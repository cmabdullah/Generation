# Quick Start Guide

Get your Family Tree API up and running in 5 minutes!

## Prerequisites

- Java 17 installed
- Docker installed (for Neo4j)

## Steps

### 1. Start Neo4j Database

```bash
docker-compose up -d
```

Wait for Neo4j to start (about 30 seconds). You can check at http://localhost:7474

### 2. Build the Application

```bash
mvn clean package
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

Or:

```bash
java -jar target/family-tree-api.jar
```

### 4. Verify It's Running

Open your browser:
- API Documentation: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

### 5. Test the API

Get the full family tree:
```bash
curl http://localhost:8080/api/family-tree
```

Search for a person:
```bash
curl "http://localhost:8080/api/family-tree/search?name=Muhammad"
```

Get total count:
```bash
curl http://localhost:8080/api/family-tree/count
```

## One-Command Deployment (Docker)

If you prefer to run everything in Docker:

```bash
cd docker
docker-compose up --build
```

This builds and starts both Neo4j and the application.

## API Endpoints Summary

- **GET** `/api/family-tree` - Full tree
- **GET** `/api/family-tree/{id}` - Person by ID
- **POST** `/api/family-tree` - Create person
- **PATCH** `/api/family-tree/{id}` - Update person
- **DELETE** `/api/family-tree/{id}` - Delete person
- **GET** `/api/family-tree/search?name={name}` - Search
- **GET** `/api/family-tree/level/{level}` - Get by level

## Example: Create a New Person

```bash
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -d '{
    "id": "gen9-new",
    "name": "New Person",
    "avatar": "io.jpeg",
    "address": "Dhaka",
    "level": 9,
    "signature": "α++++",
    "parentId": "gen8-001"
  }'
```

## Example: Update a Person

```bash
curl -X PATCH http://localhost:8080/api/family-tree/gen9-new \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Dhaka, Bangladesh",
    "spouse": "Example Spouse"
  }'
```

## Troubleshooting

### Neo4j not connecting?
```bash
docker logs family-tree-neo4j
```

### Port 8080 already in use?
Edit `src/main/resources/application.yml` and change the port:
```yaml
server:
  port: 8081
```

### Need to reset database?
```bash
docker-compose down -v
docker-compose up -d
mvn spring-boot:run
```

## Next Steps

- Explore the Swagger UI at http://localhost:8080/swagger-ui.html
- View Neo4j Browser at http://localhost:7474 (login: neo4j/password)
- Check the full README.md for detailed documentation
- Run Cypher queries in Neo4j Browser:
  ```cypher
  MATCH (p:Person) RETURN p LIMIT 25
  ```

---

**You're all set! Happy coding!**
