package com.familytree.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PersonDetails entity representing detailed information about a person.
 * Has a one-to-one relationship with Person entity.
 */
@Node("PersonDetails")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PersonDetails {

    @Id
    @EqualsAndHashCode.Include
    private String id;

    @Relationship(type = "HAS_DETAILS", direction = Relationship.Direction.OUTGOING)
    private Person person;

    @Property("fullName")
    private String fullName;

    @Property("nickName")
    private String nickName;

    @Property("title")
    private String title;

    @Property("gender")
    private String gender;

    @Property("dateOfBirth")
    private LocalDate dateOfBirth;

    @Property("dateOfDeath")
    private LocalDate dateOfDeath;

    @Property("placeOfBirth")
    private String placeOfBirth;

    @Property("placeOfDeath")
    private String placeOfDeath;

    @Property("profession")
    private String profession;

    @Property("institution")
    private String institution;

    @Property("bio")
    private String bio;

    @Property("cell")
    private String cell;

    @Property("email")
    private String email;

    @Property("facebook")
    private String facebook;

    @Property("linkedIn")
    private String linkedIn;

    @Property("website")
    private String website;

    @Property("anyOther")
    private String anyOther;

    @Property("createdAt")
    private LocalDateTime createdAt;

    @Property("updatedAt")
    private LocalDateTime updatedAt;


    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
