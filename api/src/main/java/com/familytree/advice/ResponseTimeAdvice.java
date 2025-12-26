package com.familytree.advice;

import com.familytree.constant.Constants;
import com.familytree.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * Response advice to inject response time into ApiResponse objects
 */
@RestControllerAdvice
@Slf4j
public class ResponseTimeAdvice implements ResponseBodyAdvice<Object> {

	@Override
	public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
		// Process all responses - we'll filter for ApiResponse in beforeBodyWrite
		return true;
	}

	@Override
	public Object beforeBodyWrite(Object body, MethodParameter returnType,
								  MediaType selectedContentType,
								  Class<? extends HttpMessageConverter<?>> selectedConverterType,
								  ServerHttpRequest request, ServerHttpResponse response) {

		if (body instanceof ApiResponse<?> apiResponse) {
			// Extract HttpServletRequest from ServerHttpRequest
			if (request instanceof ServletServerHttpRequest servletRequest) {
				HttpServletRequest httpRequest = servletRequest.getServletRequest();

				// Retrieve start time from request attributes
				Long startTime = (Long) httpRequest.getAttribute(Constants.REQUEST_START_TIME);

				if (startTime != null) {
					long endTime = System.currentTimeMillis();
					long responseTime = endTime - startTime;

					// Inject response time into ApiResponse
					apiResponse.setResponseTime(responseTime);

					log.debug("Response time calculated: {} ms for URI: {}",
							responseTime, httpRequest.getRequestURI());
				} else {
					log.warn("Request start time not found for URI: {}", httpRequest.getRequestURI());
				}
			}
		}

		return body;
	}
}
