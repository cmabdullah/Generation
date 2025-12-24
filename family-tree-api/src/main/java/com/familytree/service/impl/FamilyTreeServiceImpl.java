package com.familytree.service.impl;

import com.familytree.dto.PersonPatchRequest;
import com.familytree.dto.PersonRequest;
import com.familytree.dto.PersonResponse;
import com.familytree.exception.InvalidDataException;
import com.familytree.exception.PersonAlreadyExistsException;
import com.familytree.exception.PersonNotFoundException;
import com.familytree.model.Person;
import com.familytree.repository.PersonRepository;
import com.familytree.service.FamilyTreeService;
import com.familytree.util.DataLoader;
import com.familytree.util.TreeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of FamilyTreeService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FamilyTreeServiceImpl implements FamilyTreeService {

	private final PersonRepository personRepository;
	private final DataLoader dataLoader;

	@Override
	@Transactional(readOnly = true)
	public PersonResponse getFullTree() {
		log.info("Fetching full family tree");

		Person root = personRepository.findFirstByLevel(1)
				.orElseThrow(() -> new PersonNotFoundException("Root person not found"));

		// Get the full tree with all descendants
		Person fullTree = personRepository.findByIdWithAllDescendants(root.getId())
				.orElseThrow(() -> new PersonNotFoundException("Root person not found"));

		return TreeMapper.toResponseWithChildren(fullTree);
	}

	@Override
	@Transactional(readOnly = true)
	public PersonResponse getPersonById(String id) {
		log.info("Fetching person by ID: {}", id);

		Person person = personRepository.findByIdWithChildren(id)
				.orElseThrow(() -> new PersonNotFoundException(id));

		return TreeMapper.toResponseWithChildren(person);
	}

	@Override
	@Transactional(readOnly = true)
	public PersonResponse getPersonWithAllDescendants(String id) {
		log.info("Fetching person with all descendants: {}", id);

		Person person = personRepository.findByIdWithAllDescendants(id)
				.orElseThrow(() -> new PersonNotFoundException(id));

		return TreeMapper.toResponseWithChildren(person);
	}

	@Override
	public PersonResponse createPerson(PersonRequest request) {
		log.info("Creating new person with ID: {}", request.getId());

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
	public PersonResponse updatePerson(String id, PersonPatchRequest request) {
		log.info("Updating person: {}", id);

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
	public void deletePerson(String id) {
		log.info("Deleting person: {}", id);

		if (!personRepository.existsById(id)) {
			throw new PersonNotFoundException(id);
		}

		personRepository.deleteById(id);
		log.info("Person deleted: {}", id);
	}

	@Override
	@Transactional(readOnly = true)
	public List<PersonResponse> searchByName(String name) {
		log.info("Searching persons by name: {}", name);

		List<Person> persons = personRepository.searchByName(name);

		return persons.stream()
				.map(TreeMapper::toResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<PersonResponse> getPersonsByLevel(Integer level) {
		log.info("Fetching persons at level: {}", level);

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
	public void reloadData() {
		log.info("Reloading data from JSON file");

		// Clear existing data
		dataLoader.clearDatabase();

		// Reload from JSON
		dataLoader.loadDataFromJson();

		log.info("Data reloaded successfully");
	}
}
