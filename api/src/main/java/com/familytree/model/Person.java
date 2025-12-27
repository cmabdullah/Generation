package com.familytree.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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

	@Property("gender")
	private Gender gender;

	// === Visual Representation ===

	@Property("avatar")
	private String avatar;

	@Property("address")
	private String address;

	@Property("contributorId")
	private String contributorId;

	@Property("isPositionLocked")
	private Boolean isPositionLocked = false;

	@Property("level")
	private Integer level;

	@Property("signature")
	private String signature;

	@Property("signatureId")
	private String signatureId;

	@Property("spouse")
	private String spouse;

	@Property("positionX")
	private Double positionX;

	@Property("positionY")
	private Double positionY;

	@Relationship(type = "PARENT_OF", direction = Relationship.Direction.OUTGOING)
	@JsonManagedReference("person-children")
	private Set<Person> children = new HashSet<>();

	@Relationship(type = "HAS_DETAILS", direction = Relationship.Direction.OUTGOING)
	@JsonManagedReference("person-details")
	private PersonDetails details;

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
	 * Set details for this person and maintain bidirectional relationship
	 *
	 * @param details the PersonDetails to associate with this person
	 */
	public void setDetails(PersonDetails details) {
		this.details = details;
		if (details != null && details.getPerson() != this) {
			details.setPerson(this);
		}
	}

	/**
	 * Check if person has extended details
	 *
	 * @return true if details exist, false otherwise
	 */
	public boolean hasDetails() {
		return this.details != null;
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
