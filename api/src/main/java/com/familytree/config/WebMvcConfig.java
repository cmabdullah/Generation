package com.familytree.config;

import com.familytree.interceptor.RequestTimingInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration for registering interceptors
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

	private final RequestTimingInterceptor requestTimingInterceptor;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		// Register timing interceptor for all API endpoints
		registry.addInterceptor(requestTimingInterceptor)
				.addPathPatterns("/api/**");
	}
}
