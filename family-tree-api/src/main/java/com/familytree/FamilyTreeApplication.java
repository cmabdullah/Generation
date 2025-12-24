package com.familytree;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

/**
 * Main Spring Boot application class for Family Tree API
 */
@SpringBootApplication
@EnableNeo4jRepositories
@Slf4j
public class FamilyTreeApplication {

	public static void main(String[] args) {
		log.info("Starting Family Tree API Application...");
		SpringApplication.run(FamilyTreeApplication.class, args);
		log.info("Family Tree API Application started successfully!");
		log.info("Swagger UI available at: http://localhost:8080/swagger-ui.html");
		log.info("API Documentation available at: http://localhost:8080/api-docs");
	}
}
