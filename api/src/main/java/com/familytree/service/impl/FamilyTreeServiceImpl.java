package com.familytree.service.impl;

import com.familytree.dto.PersonDetailsRequest;
import com.familytree.dto.PersonDetailsResponse;
import com.familytree.dto.PersonPatchRequest;
import com.familytree.dto.PersonRequest;
import com.familytree.dto.PersonResponse;
import com.familytree.exception.InvalidDataException;
import com.familytree.exception.PersonAlreadyExistsException;
import com.familytree.exception.PersonNotFoundException;
import com.familytree.model.Gender;
import com.familytree.model.Person;
import com.familytree.model.PersonDetails;
import com.familytree.repository.PersonDetailsRepository;
import com.familytree.repository.PersonRepository;
import com.familytree.service.FamilyTreeService;
import com.familytree.util.DataLoader;
import com.familytree.util.TreeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.familytree.config.CacheConfig.*;
import static com.familytree.util.TreeMapper.getPersonDetailsResponse;

/**
 * Implementation of FamilyTreeService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FamilyTreeServiceImpl implements FamilyTreeService {

	private final PersonRepository personRepository;
	private final PersonDetailsRepository personDetailsRepository;
	private final DataLoader dataLoader;

	@Override
	@Transactional(readOnly = true)
	@Cacheable(value = FAMILY_TREE_FULL, key = "'fullTree'")
	public PersonResponse getFullTree() {
		log.info("Fetching full family tree (cache miss)");

		Person root = personRepository.findFirstByLevel(1)
				.orElseThrow(() -> new PersonNotFoundException("Root person not found"));

		// Get the full tree with all descendants
		Person fullTree = personRepository.findByIdWithAllDescendants(root.getId())
				.orElseThrow(() -> new PersonNotFoundException("Root person not found"));

		return TreeMapper.toResponseWithChildren(fullTree);
	}

	@Override
	@Transactional(readOnly = true)
	@Cacheable(value = PERSON_BY_ID, key = "#id")
	public PersonResponse getPersonById(String id) {
		log.info("Fetching person by ID: {} (cache miss)", id);

		Person person = personRepository.findByIdWithChildren(id)
				.orElseThrow(() -> new PersonNotFoundException(id));

		return TreeMapper.toResponseWithChildren(person);
	}

	@Override
	@Transactional(readOnly = true)
	@Cacheable(value = PERSON_DESCENDANTS, key = "#id")
	public PersonResponse getPersonWithAllDescendants(String id) {
		log.info("Fetching person with all descendants: {} (cache miss)", id);

		Person person = personRepository.findByIdWithAllDescendants(id)
				.orElseThrow(() -> new PersonNotFoundException(id));

		return TreeMapper.toResponseWithChildren(person);
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = FAMILY_TREE_FULL, allEntries = true),
			@CacheEvict(value = PERSON_DESCENDANTS, allEntries = true),
			@CacheEvict(value = SEARCH_RESULTS, allEntries = true),
			@CacheEvict(value = PERSONS_BY_LEVEL, allEntries = true)
	})
	public PersonResponse createPerson(PersonRequest request) {
		log.info("Creating new person with ID: {} (evicting caches)", request.getId());

		// Validate that person doesn't already exist
		if (personRepository.existsById(request.getId())) {
			throw new PersonAlreadyExistsException(request.getId());
		}

		// Validate parent exists if parentId is provided
		if (request.getParentId() != null && !request.getParentId().isEmpty()) {
			if (!personRepository.existsById(request.getParentId())) {
				throw new PersonNotFoundException(request.getParentId());
			}
		}

		// Create new person
		Person person = new Person(
				request.getId(),
				request.getName(),
				request.getAvatar(),
				request.getAddress(),
				request.getLevel(),
				request.getSignature(),
				request.getSpouse()
		);

		// Set gender if provided
		if (request.getGender() != null && !request.getGender().isEmpty()) {
			person.setGender(Gender.fromString(request.getGender()));
		}

		// Set position if provided
		if (request.getPositionX() != null) {
			person.setPositionX(request.getPositionX());
		}
		if (request.getPositionY() != null) {
			person.setPositionY(request.getPositionY());
		}

		// Save person
		Person savedPerson = personRepository.save(person);
		log.info("Person created: {}", savedPerson.getId());

		// Create relationship with parent if provided
		if (request.getParentId() != null && !request.getParentId().isEmpty()) {
			personRepository.createParentChildRelationship(request.getParentId(), savedPerson.getId());
			log.info("Created PARENT_OF relationship: {} -> {}", request.getParentId(), savedPerson.getId());
		}

		return TreeMapper.toResponse(savedPerson);
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = FAMILY_TREE_FULL, allEntries = true),
			@CacheEvict(value = PERSON_BY_ID, key = "#id"),
			@CacheEvict(value = PERSON_DESCENDANTS, allEntries = true),
			@CacheEvict(value = SEARCH_RESULTS, allEntries = true),
			@CacheEvict(value = PERSONS_BY_LEVEL, allEntries = true)
	})
	public PersonResponse updatePerson(String id, PersonPatchRequest request) {
		log.info("Updating person: {} (evicting caches)", id);

		// Find existing person
		Person person = personRepository.findById(id)
				.orElseThrow(() -> new PersonNotFoundException(id));

		// Update only non-null fields
		boolean updated = false;

		if (request.getName() != null) {
			person.setName(request.getName());
			updated = true;
		}

		if (request.getAvatar() != null) {
			person.setAvatar(request.getAvatar());
			updated = true;
		}

		if (request.getAddress() != null) {
			person.setAddress(request.getAddress());
			updated = true;
		}

		if (request.getLevel() != null) {
			person.setLevel(request.getLevel());
			updated = true;
		}

		if (request.getSignature() != null) {
			person.setSignature(request.getSignature());
			updated = true;
		}

		if (request.getSpouse() != null) {
			person.setSpouse(request.getSpouse());
			updated = true;
		}

		if (request.getPositionX() != null) {
			person.setPositionX(request.getPositionX());
			updated = true;
		}

		if (request.getPositionY() != null) {
			person.setPositionY(request.getPositionY());
			updated = true;
		}

		if (!updated) {
			throw new InvalidDataException("No fields to update");
		}

		// Update timestamp and save
		person.updateTimestamp();
		Person updatedPerson = personRepository.save(person);

		log.info("Person updated: {}", updatedPerson.getId());

		return TreeMapper.toResponse(updatedPerson);
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = FAMILY_TREE_FULL, allEntries = true),
			@CacheEvict(value = PERSON_BY_ID, key = "#id"),
			@CacheEvict(value = PERSON_DESCENDANTS, allEntries = true),
			@CacheEvict(value = SEARCH_RESULTS, allEntries = true),
			@CacheEvict(value = PERSONS_BY_LEVEL, allEntries = true)
	})
	public void deletePerson(String id) {
		log.info("Deleting person: {} (evicting caches)", id);

		if (!personRepository.existsById(id)) {
			throw new PersonNotFoundException(id);
		}

		personRepository.deleteById(id);
		log.info("Person deleted: {}", id);
	}

	@Override
	@Transactional(readOnly = true)
	@Cacheable(value = SEARCH_RESULTS, key = "#name")
	public List<PersonResponse> searchByName(String name) {
		log.info("Searching persons by name: {} (cache miss)", name);

		List<Person> persons = personRepository.searchByName(name);

		return persons.stream()
				.map(TreeMapper::toResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	@Cacheable(value = PERSONS_BY_LEVEL, key = "#level")
	public List<PersonResponse> getPersonsByLevel(Integer level) {
		log.info("Fetching persons at level: {} (cache miss)", level);

		List<Person> persons = personRepository.findByLevel(level);

		return persons.stream()
				.map(TreeMapper::toResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public long getTotalCount() {
		log.info("Fetching total count of persons");
		return personRepository.countAllPersons();
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = FAMILY_TREE_FULL, allEntries = true),
			@CacheEvict(value = PERSON_BY_ID, allEntries = true),
			@CacheEvict(value = PERSON_DESCENDANTS, allEntries = true),
			@CacheEvict(value = SEARCH_RESULTS, allEntries = true),
			@CacheEvict(value = PERSONS_BY_LEVEL, allEntries = true)
	})
	public void reloadData() {
		log.info("Reloading data from JSON file (clearing all caches)");

		// Clear existing data
		dataLoader.clearDatabase();

		// Reload from JSON
		dataLoader.loadDataFromJson();

		log.info("Data reloaded successfully");
	}

	@Override
	@CacheEvict(value = FAMILY_TREE_FULL, allEntries = true)
	public void resetAllPositions() {
		log.info("Resetting all node positions to null (evicting full tree cache)");

		// Get all persons and reset their positions
		List<Person> allPersons = personRepository.findAll();

		for (Person person : allPersons) {
			person.setPositionX(null);
			person.setPositionY(null);
		}

		personRepository.saveAll(allPersons);

		log.info("Successfully reset positions for {} persons", allPersons.size());
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = FAMILY_TREE_FULL, allEntries = true),
			@CacheEvict(value = PERSON_BY_ID, key = "#personId"),
			@CacheEvict(value = PERSON_DESCENDANTS, allEntries = true)
	})
	public PersonDetailsResponse addOrUpdatePersonDetails(String personId, PersonDetailsRequest request) {
		log.info("Adding or updating details for person: {} (evicting caches)", personId);

		// Find the person
		Person person = personRepository.findById(personId)
				.orElseThrow(() -> new PersonNotFoundException("Person not found: " + personId));

		PersonDetails details;

		// Check if person already has details
		if (person.hasDetails()) {
			// Update existing details
			details = person.getDetails();
			updateDetailsFromRequest(details, request);
			log.info("Updating existing details for person: {}", personId);
		} else {
			// Create new details
			details = mapToDetailsEntity(request);
			details.setId(UUID.randomUUID().toString());
			details.setPerson(person);
			person.setDetails(details);
			log.info("Creating new details for person: {}", personId);
		}

		// Update timestamp
		details.updateTimestamp();

		// Save details
		PersonDetails savedDetails = personDetailsRepository.save(details);

		log.info("Person details saved for person: {}", personId);

		return mapToDetailsResponse(savedDetails);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<PersonDetailsResponse> getPersonDetails(String personId) {
		log.info("Fetching details for person: {}", personId);

		return personDetailsRepository.findByPersonId(personId)
				.map(this::mapToDetailsResponse);
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = FAMILY_TREE_FULL, allEntries = true),
			@CacheEvict(value = PERSON_BY_ID, key = "#personId"),
			@CacheEvict(value = PERSON_DESCENDANTS, allEntries = true)
	})
	public void deletePersonDetails(String personId) {
		log.info("Deleting details for person: {} (evicting caches)", personId);

		// Verify person exists
		if (!personRepository.existsById(personId)) {
			throw new PersonNotFoundException("Person not found: " + personId);
		}

		// Delete details
		personDetailsRepository.deleteByPersonId(personId);

		log.info("Person details deleted for person: {}", personId);
	}

	// === Private Helper Methods for PersonDetails ===

	/**
	 * Map PersonDetailsRequest to PersonDetails entity
	 */
	private PersonDetails mapToDetailsEntity(PersonDetailsRequest request) {
		PersonDetails details = new PersonDetails();
		details.setFullName(request.getFullName());
		details.setNickName(request.getNickName());
		details.setTitle(request.getTitle());
		details.setDateOfBirth(request.getDateOfBirth());
		details.setDateOfDeath(request.getDateOfDeath());
		details.setPlaceOfBirth(request.getPlaceOfBirth());
		details.setPlaceOfDeath(request.getPlaceOfDeath());
		details.setProfession(request.getProfession());
		details.setInstitution(request.getInstitution());
		details.setBio(request.getBio());
		details.setCell(request.getCell());
		details.setEmail(request.getEmail());
		details.setFacebook(request.getFacebook());
		details.setLinkedIn(request.getLinkedIn());
		details.setWebsite(request.getWebsite());
		details.setAnyOther(request.getAnyOther());
		return details;
	}

	/**
	 * Update PersonDetails entity from PersonDetailsRequest (only non-null fields)
	 */
	private void updateDetailsFromRequest(PersonDetails details, PersonDetailsRequest request) {
		if (request.getFullName() != null) details.setFullName(request.getFullName());
		if (request.getNickName() != null) details.setNickName(request.getNickName());
		if (request.getTitle() != null) details.setTitle(request.getTitle());
		if (request.getDateOfBirth() != null) details.setDateOfBirth(request.getDateOfBirth());
		if (request.getDateOfDeath() != null) details.setDateOfDeath(request.getDateOfDeath());
		if (request.getPlaceOfBirth() != null) details.setPlaceOfBirth(request.getPlaceOfBirth());
		if (request.getPlaceOfDeath() != null) details.setPlaceOfDeath(request.getPlaceOfDeath());
		if (request.getProfession() != null) details.setProfession(request.getProfession());
		if (request.getInstitution() != null) details.setInstitution(request.getInstitution());
		if (request.getBio() != null) details.setBio(request.getBio());
		if (request.getCell() != null) details.setCell(request.getCell());
		if (request.getEmail() != null) details.setEmail(request.getEmail());
		if (request.getFacebook() != null) details.setFacebook(request.getFacebook());
		if (request.getLinkedIn() != null) details.setLinkedIn(request.getLinkedIn());
		if (request.getWebsite() != null) details.setWebsite(request.getWebsite());
		if (request.getAnyOther() != null) details.setAnyOther(request.getAnyOther());
	}

	/**
	 * Map PersonDetails entity to PersonDetailsResponse
	 */
	private PersonDetailsResponse mapToDetailsResponse(PersonDetails details) {
		return getPersonDetailsResponse(details);
	}
}
