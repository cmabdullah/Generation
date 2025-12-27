package com.familytree.util;

import com.familytree.model.Person;
import com.familytree.repository.PersonRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

/**
 * Data loader that loads initial family tree data from JSON file on application startup
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

	private final PersonRepository personRepository;
	private final ResourceLoader resourceLoader;
	private final ObjectMapper objectMapper;

	@Value("${app.data.initial-load:true}")
	private boolean shouldLoadInitialData;

	@Value("${app.data.json-file-path:classpath:data/data_full.json}")
	private String jsonFilePath;

	@Override
	public void run(String... args) throws Exception {
		if (!shouldLoadInitialData) {
			log.info("Initial data loading is disabled");
			return;
		}

		// Check if database already has data
		if (personRepository.hasAnyPerson()) {
			log.info("Database already contains data. Skipping initial load.");
			return;
		}

		log.info("Starting initial data load from: {}", jsonFilePath);
		loadDataFromJson();
	}

	/**
	 * Load data from JSON file and persist to Neo4j
	 */
	public void loadDataFromJson() {
		try {
			Resource resource = resourceLoader.getResource(jsonFilePath);
			InputStream inputStream = resource.getInputStream();

			// Parse JSON to JsonTreeNode
			JsonTreeNode rootNode = objectMapper.readValue(inputStream, JsonTreeNode.class);
			log.info("Successfully parsed JSON file. Root person: {}", rootNode.getName());

			// Convert to Person entities and save
			int count = saveTreeToDatabase(rootNode);

			log.info("Successfully loaded {} persons into Neo4j database", count);

		} catch (IOException e) {
			log.error("Failed to load data from JSON file: {}", jsonFilePath, e);
			throw new RuntimeException("Failed to load initial data", e);
		}
	}

	/**
	 * Recursively save tree structure to database
	 * Uses a two-pass approach:
	 * 1. Save all nodes first
	 * 2. Create relationships separately
	 */
	private int saveTreeToDatabase(JsonTreeNode rootNode) {
		// Flatten tree to list of all nodes with parent references
		Map<String, JsonTreeNode> allNodes = new HashMap<>();
		Map<String, String> childToParentMap = new HashMap<>();
		Map<String, Integer> nodeLevels = new HashMap<>();
		flattenTree(rootNode, null, 1, allNodes, childToParentMap, nodeLevels);

		log.info("Flattened tree contains {} nodes", allNodes.size());
		log.info("Total parent-child relationships to create: {}", childToParentMap.size());

		// First pass: Create all Person nodes
		List<Person> persons = new ArrayList<>();
		for (JsonTreeNode node : allNodes.values()) {
			Person person = TreeMapper.fromJsonNode(node);
			// Set the computed level
			person.setLevel(nodeLevels.get(node.getId()));
			persons.add(person);
		}

		// Save all persons in batch
		personRepository.saveAll(persons);
		log.info("Saved {} person nodes", persons.size());

		// Second pass: Create PARENT_OF relationships
		int relationshipCount = 0;
		int failedRelationships = 0;
		for (Map.Entry<String, String> entry : childToParentMap.entrySet()) {
			String childId = entry.getKey();
			String parentId = entry.getValue();
			try {
				personRepository.createParentChildRelationship(parentId, childId);
				relationshipCount++;
				if (relationshipCount <= 5) {
					log.debug("Created relationship: {} -> {}", parentId, childId);
				}
			} catch (Exception e) {
				failedRelationships++;
				log.error("Failed to create relationship: {} -> {}. Error: {}", parentId, childId, e.getMessage());
			}
		}

		log.info("Created {} PARENT_OF relationships", relationshipCount);
		if (failedRelationships > 0) {
			log.warn("Failed to create {} relationships", failedRelationships);
		}

		// Verify root node has children
		verifyRootNodeChildren(rootNode.getId());

		return allNodes.size();
	}

	/**
	 * Verify that the root node has children in the database
	 */
	private void verifyRootNodeChildren(String rootId) {
		try {
			List<Person> children = personRepository.findChildren(rootId);
			log.info("Verification: Root node '{}' has {} children in database", rootId, children.size());
			if (children.isEmpty()) {
				log.error("CRITICAL: Root node has NO children after migration!");
			} else {
				for (int i = 0; i < Math.min(3, children.size()); i++) {
					Person child = children.get(i);
					log.info("  Child {}: {} (ID: {}, Level: {})", i + 1, child.getName(), child.getId(), child.getLevel());
				}
			}
		} catch (Exception e) {
			log.error("Failed to verify root node children: {}", e.getMessage());
		}
	}

	/**
	 * Flatten tree structure into a map of nodes and parent-child relationships
	 */
	private void flattenTree(JsonTreeNode node, String parentId, int level,
	                         Map<String, JsonTreeNode> allNodes,
	                         Map<String, String> childToParentMap,
	                         Map<String, Integer> nodeLevels) {
		if (node == null) {
			return;
		}

		// Add current node to map
		allNodes.put(node.getId(), node);

		// Store the computed level
		nodeLevels.put(node.getId(), level);

		// If this node has a parent, record the relationship
		if (parentId != null) {
			childToParentMap.put(node.getId(), parentId);
		}

		// Recursively process children with incremented level
		if (node.getChilds() != null) {
			for (JsonTreeNode child : node.getChilds()) {
				flattenTree(child, node.getId(), level + 1, allNodes, childToParentMap, nodeLevels);
			}
		}
	}

	/**
	 * Clear all data from database (use with caution!)
	 */
	public void clearDatabase() {
		log.warn("Clearing all data from database");
		personRepository.deleteAllPersons();
		log.info("Database cleared");
	}
}
