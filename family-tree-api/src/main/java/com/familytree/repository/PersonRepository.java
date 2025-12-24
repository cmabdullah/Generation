package com.familytree.repository;

import com.familytree.model.Person;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Person entity with custom Cypher queries
 */
@Repository
public interface PersonRepository extends Neo4jRepository<Person, String> {

	/**
	 * Find root node (typically level 1)
	 */
	Optional<Person> findFirstByLevel(Integer level);

	/**
	 * Find person by ID with all children (depth = 1)
	 */
	@Query("MATCH (p:Person {id: $id}) " +
			"OPTIONAL MATCH (p)-[:PARENT_OF]->(child:Person) " +
			"RETURN p, collect(child) as children")
	Optional<Person> findByIdWithChildren(@Param("id") String id);

	/**
	 * Find person by ID with all descendants (full subtree)
	 * Using depth parameter to control recursion
	 */
	@Query("MATCH (p:Person {id: $id}) " +
			"OPTIONAL MATCH path = (p)-[:PARENT_OF*]->(descendant:Person) " +
			"RETURN p, collect(descendant), collect(relationships(path))")
	Optional<Person> findByIdWithAllDescendants(@Param("id") String id);

	/**
	 * Get full tree starting from root node with all relationships
	 */
	@Query("MATCH (root:Person) WHERE root.level = 1 " +
			"CALL { " +
			"  WITH root " +
			"  MATCH path = (root)-[:PARENT_OF*0..]->(descendant:Person) " +
			"  RETURN collect(DISTINCT descendant) as descendants, collect(relationships(path)) as rels " +
			"} " +
			"RETURN root, descendants, rels")
	Optional<Person> findFullTree();

	/**
	 * Find person with all ancestors
	 */
	@Query("MATCH path = (ancestor:Person)-[:PARENT_OF*]->(p:Person {id: $id}) " +
			"RETURN collect(DISTINCT ancestor) as ancestors, p")
	Optional<Person> findPersonWithAncestors(@Param("id") String id);

	/**
	 * Search persons by name (case-insensitive)
	 */
	@Query("MATCH (p:Person) " +
			"WHERE toLower(p.name) CONTAINS toLower($name) " +
			"RETURN p")
	List<Person> searchByName(@Param("name") String name);

	/**
	 * Find all persons at a specific generation level
	 */
	List<Person> findByLevel(Integer level);

	/**
	 * Count total persons in the tree
	 */
	@Query("MATCH (p:Person) RETURN count(p)")
	long countAllPersons();

	/**
	 * Delete all persons (for testing/reset)
	 */
	@Query("MATCH (p:Person) DETACH DELETE p")
	void deleteAllPersons();

	/**
	 * Check if database is empty
	 */
	@Query("MATCH (p:Person) RETURN count(p) > 0")
	boolean hasAnyPerson();

	/**
	 * Find children of a person
	 */
	@Query("MATCH (p:Person {id: $id})-[:PARENT_OF]->(child:Person) " +
			"RETURN child")
	List<Person> findChildren(@Param("id") String id);

	/**
	 * Create PARENT_OF relationship between two persons
	 */
	@Query("MATCH (parent:Person {id: $parentId}), (child:Person {id: $childId}) " +
			"MERGE (parent)-[:PARENT_OF]->(child)")
	void createParentChildRelationship(@Param("parentId") String parentId,
	                                   @Param("childId") String childId);
}
