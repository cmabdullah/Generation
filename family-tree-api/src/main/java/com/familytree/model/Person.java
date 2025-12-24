package com.familytree.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Person entity representing a node in the family tree.
 * Each person can have multiple children (PARENT_OF relationship).
 */
@Node("Person")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Person {

	@Id
	@EqualsAndHashCode.Include
	private String id;

	@Property("name")
	private String name;

	@Property("avatar")
	private String avatar;

	@Property("address")
	private String address;

	@Property("level")
	private Integer level;

	@Property("signature")
	private String signature;

	@Property("spouse")
	private String spouse;

	@Relationship(type = "PARENT_OF", direction = Relationship.Direction.OUTGOING)
	private Set<Person> children = new HashSet<>();

	@Property("createdAt")
	private LocalDateTime createdAt;

	@Property("updatedAt")
	private LocalDateTime updatedAt;

	/**
	 * Constructor for creating a person without children
	 */
	public Person(String id, String name, String avatar, String address,
	              Integer level, String signature, String spouse) {
		this.id = id;
		this.name = name;
		this.avatar = avatar;
		this.address = address;
		this.level = level;
		this.signature = signature;
		this.spouse = spouse;
		this.children = new HashSet<>();
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	/**
	 * Add a child to this person
	 */
	public void addChild(Person child) {
		if (this.children == null) {
			this.children = new HashSet<>();
		}
		this.children.add(child);
	}

	/**
	 * Update timestamp before saving
	 */
	public void updateTimestamp() {
		this.updatedAt = LocalDateTime.now();
		if (this.createdAt == null) {
			this.createdAt = LocalDateTime.now();
		}
	}
}
