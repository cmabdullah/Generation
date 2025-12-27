package com.familytree.repository;

import com.familytree.model.PersonDetails;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for PersonDetails entity with custom Cypher queries
 */
@Repository
public interface PersonDetailsRepository extends Neo4jRepository<PersonDetails, String> {

	/**
	 * Find details by person ID
	 *
	 * @param personId the ID of the person
	 * @return Optional containing the PersonDetails if found
	 */
	@Query("MATCH (p:Person {id: $personId})-[:HAS_DETAILS]->(d:PersonDetails) RETURN d")
	Optional<PersonDetails> findByPersonId(@Param("personId") String personId);

	/**
	 * Check if person has details
	 *
	 * @param personId the ID of the person
	 * @return true if details exist, false otherwise
	 */
	@Query("MATCH (p:Person {id: $personId})-[:HAS_DETAILS]->(d:PersonDetails) RETURN count(d) > 0")
	boolean existsByPersonId(@Param("personId") String personId);

	/**
	 * Delete details for a person
	 *
	 * @param personId the ID of the person
	 */
	@Query("MATCH (p:Person {id: $personId})-[r:HAS_DETAILS]->(d:PersonDetails) DELETE r, d")
	void deleteByPersonId(@Param("personId") String personId);

	/**
	 * Find person details with the person node
	 *
	 * @param personId the ID of the person
	 * @return Optional containing the PersonDetails with person relationship
	 */
	@Query("MATCH (p:Person {id: $personId})-[:HAS_DETAILS]->(d:PersonDetails) RETURN d, collect(p)")
	Optional<PersonDetails> findByPersonIdWithPerson(@Param("personId") String personId);
}
