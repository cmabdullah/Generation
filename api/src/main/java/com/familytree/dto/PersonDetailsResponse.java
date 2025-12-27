package com.familytree.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for returning person extended details in API responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Response object containing person extended details")
public class PersonDetailsResponse {

	@Schema(description = "Unique identifier for the details", example = "pd-001")
	private String id;

	@Schema(description = "Full formal name", example = "Muhammad Abdullah Khan")
	private String fullName;

	@Schema(description = "Nickname or informal name", example = "Abdullah")
	private String nickName;

	@Schema(description = "Title or honorific", example = "Dr.")
	private String title;

	@Schema(description = "Date of birth", example = "1990-01-15")
	private LocalDate dateOfBirth;

	@Schema(description = "Date of death (if applicable)", example = "2020-12-31")
	private LocalDate dateOfDeath;

	@Schema(description = "Place of birth", example = "Dhaka, Bangladesh")
	private String placeOfBirth;

	@Schema(description = "Place of death (if applicable)", example = "Dhaka, Bangladesh")
	private String placeOfDeath;

	@Schema(description = "Profession or occupation", example = "Software Engineer")
	private String profession;

	@Schema(description = "Institution or workplace", example = "Tech Company Ltd")
	private String institution;

	@Schema(description = "Biography or life story", example = "A dedicated software engineer...")
	private String bio;

	@Schema(description = "Mobile phone number", example = "+8801712345678")
	private String cell;

	@Schema(description = "Email address", example = "abdullah@example.com")
	private String email;

	@Schema(description = "Facebook profile URL", example = "https://facebook.com/username")
	private String facebook;

	@Schema(description = "LinkedIn profile URL", example = "https://linkedin.com/in/username")
	private String linkedIn;

	@Schema(description = "Personal website URL", example = "https://example.com")
	private String website;

	@Schema(description = "Any other information", example = "Additional notes")
	private String anyOther;

	@Schema(description = "Creation timestamp", example = "2025-01-01T10:00:00")
	private LocalDateTime createdAt;

	@Schema(description = "Last update timestamp", example = "2025-01-01T12:00:00")
	private LocalDateTime updatedAt;
}
