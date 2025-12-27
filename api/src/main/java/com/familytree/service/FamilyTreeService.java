package com.familytree.service;

import com.familytree.dto.PersonDetailsRequest;
import com.familytree.dto.PersonDetailsResponse;
import com.familytree.dto.PersonPatchRequest;
import com.familytree.dto.PersonRequest;
import com.familytree.dto.PersonResponse;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for family tree operations
 */
public interface FamilyTreeService {

	/**
	 * Get the complete family tree starting from root
	 */
	PersonResponse getFullTree();

	/**
	 * Get a specific person by ID with immediate children
	 */
	PersonResponse getPersonById(String id);

	/**
	 * Get a person by ID with full subtree
	 */
	PersonResponse getPersonWithAllDescendants(String id);

	/**
	 * Create a new person
	 */
	PersonResponse createPerson(PersonRequest request);

	/**
	 * Update an existing person (PATCH operation)
	 */
	PersonResponse updatePerson(String id, PersonPatchRequest request);

	/**
	 * Delete a person by ID
	 */
	void deletePerson(String id);

	/**
	 * Search persons by name
	 */
	List<PersonResponse> searchByName(String name);

	/**
	 * Get all persons at a specific generation level
	 */
	List<PersonResponse> getPersonsByLevel(Integer level);

	/**
	 * Get total count of persons in the tree
	 */
	long getTotalCount();

	/**
	 * Reload data from JSON file (admin operation)
	 */
	void reloadData();

	/**
	 * Reset all position values (positionX and positionY) to null
	 * This forces automatic layout recalculation on the frontend
	 */
	void resetAllPositions();

	/**
	 * Add or update person details
	 *
	 * @param personId the ID of the person
	 * @param request the details to add or update
	 * @return the created or updated details
	 */
	PersonDetailsResponse addOrUpdatePersonDetails(String personId, PersonDetailsRequest request);

	/**
	 * Get person details by person ID
	 *
	 * @param personId the ID of the person
	 * @return Optional containing the details if found
	 */
	Optional<PersonDetailsResponse> getPersonDetails(String personId);

	/**
	 * Delete person details
	 *
	 * @param personId the ID of the person
	 */
	void deletePersonDetails(String personId);
}
