package com.familytree.exception;

/**
 * Exception thrown when a person is not found in the database
 */
public class PersonNotFoundException extends RuntimeException {

	public PersonNotFoundException(String id) {
		super(String.format("Person with ID '%s' not found", id));
	}

	public PersonNotFoundException(String message, Throwable cause) {
		super(message, cause);
	}
}
