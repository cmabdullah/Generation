package com.familytree.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration to allow frontend access
 */
@Configuration
public class CorsConfig {

	@Bean
	public CorsFilter corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();

		// Allow credentials
		config.setAllowCredentials(true);

		// Allow origins (configure based on your deployment)
		config.setAllowedOriginPatterns(List.of("*"));

		// Allow headers
		config.setAllowedHeaders(Arrays.asList(
				"Origin",
				"Content-Type",
				"Accept",
				"Authorization",
				"Access-Control-Request-Method",
				"Access-Control-Request-Headers"
		));

		// Allow methods
		config.setAllowedMethods(Arrays.asList(
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE",
				"OPTIONS"
		));

		// Expose headers
		config.setExposedHeaders(Arrays.asList(
				"Access-Control-Allow-Origin",
				"Access-Control-Allow-Credentials"
		));

		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}
}
