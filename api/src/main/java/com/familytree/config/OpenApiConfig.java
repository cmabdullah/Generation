package com.familytree.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration
 */
@Configuration
public class OpenApiConfig {

	@Value("${server.port:8080}")
	private int serverPort;

	@Value("${app.server.url:#{null}}")
	private String serverUrl;

	@Bean
	public OpenAPI familyTreeOpenAPI() {
		Server localServer = new Server();
		localServer.setUrl("http://localhost:" + serverPort);
		localServer.setDescription("Local Development Server");

		// Add production server if configured
		Server prodServer = new Server();
		prodServer.setUrl(serverUrl != null ? serverUrl : "http://200.69.21.86:" + serverPort);
		prodServer.setDescription("Production Server");

		Contact contact = new Contact();
		contact.setName("Family Tree API Team");
		contact.setEmail("support@familytree.com");

		License license = new License()
				.name("MIT License")
				.url("https://opensource.org/licenses/MIT");

		Info info = new Info()
				.title("Family Tree API")
				.version("1.0.0")
				.description("REST API for managing family tree data with Neo4j graph database. " +
						"This API provides endpoints to create, read, update, and delete family tree nodes, " +
						"as well as query relationships between family members.")
				.contact(contact)
				.license(license);

		return new OpenAPI()
				.info(info)
				.servers(List.of(prodServer, localServer));
	}
}
