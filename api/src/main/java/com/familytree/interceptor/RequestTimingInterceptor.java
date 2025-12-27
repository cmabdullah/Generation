package com.familytree.interceptor;

import com.familytree.constant.Constants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to capture request start time for response time calculation
 */
@Component
@Slf4j
public class RequestTimingInterceptor implements HandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
		// Capture request start time in milliseconds
		long startTime = System.currentTimeMillis();
		request.setAttribute(Constants.REQUEST_START_TIME, startTime);

		log.debug("Request started at: {} ms for URI: {}", startTime, request.getRequestURI());
		return true;
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
	                            Object handler, Exception ex) {
		Long startTime = (Long) request.getAttribute(Constants.REQUEST_START_TIME);
		if (startTime != null) {
			long endTime = System.currentTimeMillis();
			long executionTime = endTime - startTime;
			log.debug("Request completed in {} ms for URI: {}", executionTime, request.getRequestURI());
		}
	}
}
