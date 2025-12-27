package com.familytree.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enum representing gender options for a person.
 * Provides type-safe gender values with JSON serialization support.
 */
public enum Gender {
	MALE("Male"),
	FEMALE("Female");

	private final String displayName;

	Gender(String displayName) {
		this.displayName = displayName;
	}

	/**
	 * Get the display name for this gender.
	 * Used for JSON serialization.
	 *
	 * @return the display name
	 */
	@JsonValue
	public String getDisplayName() {
		return displayName;
	}

	/**
	 * Parse a gender from a string value.
	 * Supports both display names and enum names (case-insensitive).
	 * Used for JSON deserialization.
	 *
	 * @param value the string value to parse
	 * @return the corresponding Gender enum, or null if value is null
	 * @throws IllegalArgumentException if the value doesn't match any gender
	 */
	@JsonCreator
	public static Gender fromString(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}

		String trimmedValue = value.trim();

		// Try to match by display name or enum name
		for (Gender gender : Gender.values()) {
			if (gender.displayName.equalsIgnoreCase(trimmedValue) ||
					gender.name().equalsIgnoreCase(trimmedValue)) {
				return gender;
			}
		}

		// Throw exception for invalid values
		throw new IllegalArgumentException("Unknown gender: " + value +
				". Valid values are: Male, Female, Other, Prefer not to say");
	}

	@Override
	public String toString() {
		return displayName;
	}
}
