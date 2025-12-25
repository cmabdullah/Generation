package com.familytree.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing person (PATCH operation)
 * All fields are optional - only non-null fields will be updated
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request object for updating person properties")
public class PersonPatchRequest {

	@Schema(description = "Updated name", example = "Muhammad Abdullah Khan (Updated)")
	private String name;

	@Schema(description = "Updated avatar filename", example = "new-avatar.jpeg")
	private String avatar;

	@Schema(description = "Updated address/location", example = "Dhaka, Bangladesh")
	private String address;

	@Schema(description = "Updated generation level", example = "9")
	private Integer level;

	@Schema(description = "Updated family signature/marker", example = "α++++")
	private String signature;

	@Schema(description = "Updated spouse information", example = "Mrs Fatima Begum (Updated)")
	private String spouse;

	@Schema(description = "Updated canvas X position", example = "650.0")
	private Double positionX;

	@Schema(description = "Updated canvas Y position", example = "450.0")
	private Double positionY;
}
