package com.familytree.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new person in the family tree
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request object for creating a new person")
public class PersonRequest {

	@NotBlank(message = "ID is required")
	@Schema(description = "Unique identifier for the person", example = "gen9-001")
	private String id;

	@NotBlank(message = "Name is required")
	@Schema(description = "Full name of the person", example = "Muhammad Abdullah Khan")
	private String name;

	@Schema(description = "Avatar filename", example = "io.jpeg")
	private String avatar;

	@Schema(description = "Address/location", example = "Dhaka")
	private String address;

	@NotNull(message = "Level is required")
	@Schema(description = "Generation level", example = "9")
	private Integer level;

	@Schema(description = "Family signature/marker", example = "α+++")
	private String signature;

	@Schema(description = "Spouse information", example = "Mrs Fatima Begum")
	private String spouse;

	@Schema(description = "Parent ID to establish PARENT_OF relationship", example = "gen8-001")
	private String parentId;
}
