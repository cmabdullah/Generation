package com.familytree.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard error response format for API exceptions
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime timestamp;

	private int status;

	private String error;

	private String message;

	private String path;

	public static ErrorResponse of(int status, String error, String message, String path) {
		return ErrorResponse.builder()
				.timestamp(LocalDateTime.now())
				.status(status)
				.error(error)
				.message(message)
				.path(path)
				.build();
	}
}
