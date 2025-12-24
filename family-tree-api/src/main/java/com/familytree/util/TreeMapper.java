package com.familytree.util;

import com.familytree.dto.PersonResponse;
import com.familytree.model.Person;
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

		return PersonResponse.builder()
				.id(person.getId())
				.name(person.getName())
				.avatar(person.getAvatar())
				.address(person.getAddress())
				.level(person.getLevel())
				.signature(person.getSignature())
				.spouse(person.getSpouse())
				.childs(new ArrayList<>())
				.build();
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
		person.setSpouse(node.getSpouse());
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
}
