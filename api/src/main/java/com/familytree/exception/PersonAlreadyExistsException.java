package com.familytree.exception;

/**
 * Exception thrown when attempting to create a person with an ID that already exists
 */
public class PersonAlreadyExistsException extends RuntimeException {

	public PersonAlreadyExistsException(String id) {
		super(String.format("Person with ID '%s' already exists", id));
	}

	public PersonAlreadyExistsException(String message, Throwable cause) {
		super(message, cause);
	}
}
