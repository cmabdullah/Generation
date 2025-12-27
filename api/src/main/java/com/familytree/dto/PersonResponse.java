package com.familytree.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for returning person data in API responses
 * Supports hierarchical tree structure with recursive children
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Response object containing person information")
public class PersonResponse {

	@Schema(description = "Unique identifier", example = "gen5-001")
	private String id;

	@Schema(description = "Full name", example = "Muhammad Golap Khan")
	private String name;

	@Schema(description = "Avatar filename", example = "io.jpeg")
	private String avatar;

	@Schema(description = "Address/location", example = "Amtoli")
	private String address;

	@Schema(description = "Generation level", example = "5")
	private Integer level;

	@Schema(description = "Family signature/marker", example = "α")
	private String signature;

	@Schema(description = "Signature ID", example = "i")
	private String signatureId;

	@Schema(description = "Spouse information", example = "Mrs Example")
	private String spouse;

	@Schema(description = "Gender of the person", example = "Male")
	private String gender;

	@Schema(description = "Contributor ID", example = "001")
	private String contributorId;

	@Schema(description = "Whether position is locked", example = "true")
	private Boolean isPositionLocked;

	@Schema(description = "Canvas X position", example = "500.0")
	private Double positionX;

	@Schema(description = "Canvas Y position", example = "300.0")
	private Double positionY;

	@Schema(description = "List of children (recursive structure)")
	@Builder.Default
	private List<PersonResponse> childs = new ArrayList<>();

	@Schema(description = "Extended person details (optional)")
	private PersonDetailsResponse details;

	/**
	 * Constructor without children (for single person response)
	 */
	public PersonResponse(String id, String name, String avatar, String address,
	                      Integer level, String signature, String spouse) {
		this.id = id;
		this.name = name;
		this.avatar = avatar;
		this.address = address;
		this.level = level;
		this.signature = signature;
		this.spouse = spouse;
		this.childs = new ArrayList<>();
	}
}
