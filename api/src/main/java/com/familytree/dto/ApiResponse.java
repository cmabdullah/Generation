package com.familytree.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API response wrapper
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Generic API response wrapper")
public class ApiResponse<T> {

	@Schema(description = "Success status", example = "true")
	private boolean success;

	@Schema(description = "Response message", example = "Operation completed successfully")
	private String message;

	@Schema(description = "Response data")
	private T data;

	@Schema(description = "Error details if any")
	private String error;

	@Schema(description = "API response time in milliseconds", example = "125")
	private Long responseTime;

	public static <T> ApiResponse<T> success(T data) {
		return ApiResponse.<T>builder()
				.success(true)
				.data(data)
				.build();
	}

	public static <T> ApiResponse<T> success(String message, T data) {
		return ApiResponse.<T>builder()
				.success(true)
				.message(message)
				.data(data)
				.build();
	}

	public static <T> ApiResponse<T> error(String error) {
		return ApiResponse.<T>builder()
				.success(false)
				.error(error)
				.build();
	}
}
