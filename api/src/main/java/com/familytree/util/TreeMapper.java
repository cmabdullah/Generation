package com.familytree.util;

import com.familytree.dto.PersonDetailsResponse;
import com.familytree.dto.PersonResponse;
import com.familytree.model.Person;
import com.familytree.model.PersonDetails;
import lombok.experimental.UtilityClass;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for mapping between Person entity and DTOs
 */
@UtilityClass
public class TreeMapper {

	/**
	 * Convert Person entity to PersonResponse DTO (without children)
	 */
	public static PersonResponse toResponse(Person person) {
		if (person == null) {
			return null;
		}

		PersonResponse response = PersonResponse.builder()
				.id(person.getId())
				.name(person.getName())
				.gender(person.getGender() != null ? person.getGender().getDisplayName() : null)
				.avatar(person.getAvatar())
				.address(person.getAddress())
				.level(person.getLevel())
				.signature(person.getSignature())
				.signatureId(person.getSignatureId())
				.spouse(person.getSpouse())
				.contributorId(person.getContributorId())
				.isPositionLocked(person.getIsPositionLocked())
				.positionX(person.getPositionX())
				.positionY(person.getPositionY())
				.childs(new ArrayList<>())
				.build();

		// Include details if present
		if (person.hasDetails()) {
			response.setDetails(toDetailsResponse(person.getDetails()));
		}

		return response;
	}

	/**
	 * Convert Person entity to PersonResponse DTO with children (recursive)
	 */
	public static PersonResponse toResponseWithChildren(Person person) {
		if (person == null) {
			return null;
		}

		PersonResponse response = toResponse(person);

		if (person.getChildren() != null && !person.getChildren().isEmpty()) {
			List<PersonResponse> childResponses = person.getChildren().stream()
					.map(TreeMapper::toResponseWithChildren)
					.collect(Collectors.toList());
			response.setChilds(childResponses);
		}

		return response;
	}

	/**
	 * Convert JsonTreeNode to Person entity (without relationships)
	 */
	public static Person fromJsonNode(JsonTreeNode node) {
		if (node == null) {
			return null;
		}

		Person person = new Person();
		person.setId(node.getId());
		person.setName(node.getName());
		person.setAvatar(node.getAvatar());
		person.setAddress(node.getAddress());
		person.setLevel(node.getLevel());
		person.setSignature(node.getSignature());
		person.setSignatureId(node.getSignatureId());
		person.setSpouse(node.getSpouse());
		person.setContributorId(node.getContributorId());
		person.setIsPositionLocked(node.getIsPositionLocked());
		person.updateTimestamp();

		return person;
	}

	/**
	 * Convert JsonTreeNode to Person entity with children (recursive)
	 */
	public static Person fromJsonNodeWithChildren(JsonTreeNode node) {
		if (node == null) {
			return null;
		}

		Person person = fromJsonNode(node);

		if (node.getChilds() != null && !node.getChilds().isEmpty()) {
			for (JsonTreeNode childNode : node.getChilds()) {
				Person child = fromJsonNodeWithChildren(childNode);
				person.addChild(child);
			}
		}

		return person;
	}

	/**
	 * Convert PersonDetails entity to PersonDetailsResponse DTO
	 */
	public static PersonDetailsResponse toDetailsResponse(PersonDetails details) {
		if (details == null) {
			return null;
		}

		return getPersonDetailsResponse(details);
	}

	public static PersonDetailsResponse getPersonDetailsResponse(PersonDetails details) {
		return PersonDetailsResponse.builder()
				.id(details.getId())
				.fullName(details.getFullName())
				.nickName(details.getNickName())
				.title(details.getTitle())
				.dateOfBirth(details.getDateOfBirth())
				.dateOfDeath(details.getDateOfDeath())
				.placeOfBirth(details.getPlaceOfBirth())
				.placeOfDeath(details.getPlaceOfDeath())
				.profession(details.getProfession())
				.institution(details.getInstitution())
				.bio(details.getBio())
				.cell(details.getCell())
				.email(details.getEmail())
				.facebook(details.getFacebook())
				.linkedIn(details.getLinkedIn())
				.website(details.getWebsite())
				.anyOther(details.getAnyOther())
				.createdAt(details.getCreatedAt())
				.updatedAt(details.getUpdatedAt())
				.build();
	}
}
