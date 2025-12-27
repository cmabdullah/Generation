package com.familytree.constant;

/**
 * Application-wide constants
 */
public final class Constants {

	private Constants() {
		// Prevent instantiation
	}

	/**
	 * Request attribute key for storing request start time
	 */
	public static final String REQUEST_START_TIME = "REQUEST_START_TIME";

	/**
	 * Request ID key for MDC logging
	 */
	public static final String REQUEST_ID = "REQUEST_ID";
}
