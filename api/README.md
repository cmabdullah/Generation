# Family Tree API

A Spring Boot REST API for managing family tree data with Neo4j graph database.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [API Examples](#api-examples)
- [Docker Deployment](#docker-deployment)
- [Configuration](#configuration)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Overview

This application provides a RESTful API to manage hierarchical family tree data stored in a Neo4j graph database. It supports creating, reading, updating, and deleting family members, as well as querying relationships and tree structures.

## Features

- **Complete CRUD Operations**: Create, Read, Update, and Delete family members
- **Hierarchical Tree Structure**: Natural graph representation of family relationships
- **Search Functionality**: Search family members by name
- **Level-based Queries**: Get all members at a specific generation level
- **Automatic Data Loading**: Load initial data from JSON file on startup
- **RESTful API**: Standard HTTP methods with proper status codes
- **API Documentation**: Interactive Swagger UI for testing endpoints
- **Docker Support**: Easy deployment with Docker Compose
- **Error Handling**: Comprehensive error handling with meaningful messages

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data Neo4j**
- **Neo4j 5.15 Community Edition**
- **Maven**
- **Lombok**
- **SpringDoc OpenAPI (Swagger UI)**
- **Docker & Docker Compose**

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker and Docker Compose (for containerized deployment)
- Neo4j Desktop or Docker (for local development)

## Getting Started

### 1. Clone the Repository

```bash
cd family-tree-api
```

### 2. Start Neo4j Database

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

This will start Neo4j on:
- Bolt: `bolt://localhost:7687`
- HTTP (Browser): `http://localhost:7474`
- Default credentials: `neo4j/password`

### 3. Build the Application

```bash
mvn clean package
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR:

```bash
java -jar target/family-tree-api.jar
```

The application will start on `http://localhost:8080`

### 5. Access Swagger UI

Open your browser and navigate to:
```
http://localhost:8080/swagger-ui.html
```

## API Endpoints

### Family Tree Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/family-tree` | Get complete family tree |
| GET | `/api/family-tree/{id}` | Get person by ID with children |
| GET | `/api/family-tree/{id}/descendants` | Get person with all descendants |
| POST | `/api/family-tree` | Create new person |
| PATCH | `/api/family-tree/{id}` | Update person |
| DELETE | `/api/family-tree/{id}` | Delete person |
| GET | `/api/family-tree/search?name={name}` | Search persons by name |
| GET | `/api/family-tree/level/{level}` | Get persons by generation level |
| GET | `/api/family-tree/count` | Get total person count |
| POST | `/api/family-tree/reload-data` | Reload data from JSON |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Application health status |
| GET | `/actuator/health/neo4j` | Neo4j connection status |

## API Examples

### Get Full Tree

```bash
curl -X GET http://localhost:8080/api/family-tree
```

### Get Person by ID

```bash
curl -X GET http://localhost:8080/api/family-tree/gen5-001
```

### Create New Person

```bash
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -d '{
    "id": "gen9-001",
    "name": "Muhammad Abdullah Khan",
    "avatar": "io.jpeg",
    "address": "Dhaka",
    "level": 9,
    "signature": "α++++",
    "spouse": "Mrs Fatima Begum",
    "parentId": "gen8-001"
  }'
```

### Update Person (PATCH)

```bash
curl -X PATCH http://localhost:8080/api/family-tree/gen9-001 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Dhaka, Bangladesh",
    "spouse": "Mrs Fatima Begum (Updated)"
  }'
```

### Search by Name

```bash
curl -X GET "http://localhost:8080/api/family-tree/search?name=Muhammad"
```

### Get Persons by Level

```bash
curl -X GET http://localhost:8080/api/family-tree/level/5
```

### Delete Person

```bash
curl -X DELETE http://localhost:8080/api/family-tree/gen9-001
```

## Docker Deployment

### Build and Run Everything with Docker Compose

```bash
cd docker
docker-compose up --build
```

This will:
1. Build the Spring Boot application
2. Start Neo4j database
3. Start the application
4. Automatically load initial data

Access the application at `http://localhost:8080`

### Stop Services

```bash
docker-compose down
```

### Remove Volumes (Complete Reset)

```bash
docker-compose down -v
```

## Configuration

### Application Properties

Edit `src/main/resources/application.yml`:

```yaml
spring:
  neo4j:
    uri: bolt://localhost:7687
    authentication:
      username: neo4j
      password: password

app:
  data:
    initial-load: true  # Set to false to disable auto-loading
    json-file-path: classpath:data/data_full.json
```

### Environment-Specific Configuration

- **Development**: Use `application-dev.yml` with `--spring.profiles.active=dev`
- **Production**: Use `application-prod.yml` with `--spring.profiles.active=prod`

### Environment Variables

For Docker deployment:

```bash
export NEO4J_URI=bolt://neo4j:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=your-password
export INITIAL_DATA_LOAD=true
```

## Testing

### Run Unit Tests

```bash
mvn test
```

### Run Integration Tests

```bash
mvn verify
```

### Test with Postman

Import the Swagger/OpenAPI specification from:
```
http://localhost:8080/api-docs
```

## Project Structure

```
family-tree-api/
├── src/
│   ├── main/
│   │   ├── java/com/familytree/
│   │   │   ├── FamilyTreeApplication.java      # Main application class
│   │   │   ├── config/                          # Configuration classes
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── JacksonConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   ├── controller/                      # REST controllers
│   │   │   │   └── FamilyTreeController.java
│   │   │   ├── dto/                             # Data Transfer Objects
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── PersonRequest.java
│   │   │   │   ├── PersonResponse.java
│   │   │   │   └── PersonPatchRequest.java
│   │   │   ├── exception/                       # Exception handling
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── PersonNotFoundException.java
│   │   │   │   ├── PersonAlreadyExistsException.java
│   │   │   │   ├── InvalidDataException.java
│   │   │   │   └── ErrorResponse.java
│   │   │   ├── model/                           # Entity models
│   │   │   │   └── Person.java
│   │   │   ├── repository/                      # Data repositories
│   │   │   │   └── PersonRepository.java
│   │   │   ├── service/                         # Business logic
│   │   │   │   ├── FamilyTreeService.java
│   │   │   │   └── impl/
│   │   │   │       └── FamilyTreeServiceImpl.java
│   │   │   └── util/                            # Utility classes
│   │   │       ├── DataLoader.java
│   │   │       ├── JsonTreeNode.java
│   │   │       └── TreeMapper.java
│   │   └── resources/
│   │       ├── application.yml                  # Main configuration
│   │       ├── application-dev.yml              # Dev configuration
│   │       ├── application-prod.yml             # Prod configuration
│   │       └── data/
│   │           └── data_full.json               # Initial data
│   └── test/                                    # Test classes
├── docker/
│   ├── Dockerfile                               # Application Dockerfile
│   └── docker-compose.yml                       # Full stack deployment
├── docker-compose.yml                           # Neo4j only (development)
├── pom.xml                                      # Maven configuration
└── README.md                                    # This file
```

## Neo4j Data Model

### Node: Person

Properties:
- `id` (String, unique): Unique identifier
- `name` (String): Full name
- `avatar` (String): Avatar filename
- `address` (String): Location
- `level` (Integer): Generation level
- `signature` (String): Family signature
- `spouse` (String): Spouse information (optional)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Relationship: PARENT_OF

Direction: Parent → Child

Example Cypher Query:
```cypher
MATCH (p:Person {id: 'gen5-001'})-[:PARENT_OF*]->(descendant:Person)
RETURN p, descendant
```

## Common Issues

### Neo4j Connection Failed

Ensure Neo4j is running:
```bash
docker ps
```

Check Neo4j logs:
```bash
docker logs family-tree-neo4j
```

### Data Not Loading

1. Check application logs for errors
2. Verify `data_full.json` exists in `src/main/resources/data/`
3. Ensure `app.data.initial-load=true` in configuration

### Port Already in Use

Change ports in `application.yml`:
```yaml
server:
  port: 8081  # Change from 8080
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on the GitHub repository.

## Authors

Family Tree API Development Team

---

**Happy Family Tree Management!**
