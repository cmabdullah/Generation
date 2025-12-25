# API Testing Examples

Complete collection of curl commands to test all API endpoints.

## Prerequisites

- Application running on `http://localhost:8080`
- Neo4j running with data loaded

---

## 1. Health Check

### Application Health
```bash
curl -X GET http://localhost:8080/actuator/health
```

### Neo4j Health
```bash
curl -X GET http://localhost:8080/actuator/health/neo4j
```

---

## 2. Get Operations

### Get Complete Family Tree
```bash
curl -X GET http://localhost:8080/api/family-tree \
  -H "Accept: application/json" | jq
```

### Get Person by ID
```bash
curl -X GET http://localhost:8080/api/family-tree/gen5-001 \
  -H "Accept: application/json" | jq
```

### Get Person with All Descendants
```bash
curl -X GET http://localhost:8080/api/family-tree/gen5-001/descendants \
  -H "Accept: application/json" | jq
```

### Search Persons by Name
```bash
curl -X GET "http://localhost:8080/api/family-tree/search?name=Muhammad" \
  -H "Accept: application/json" | jq
```

### Get Persons by Generation Level
```bash
curl -X GET http://localhost:8080/api/family-tree/level/5 \
  -H "Accept: application/json" | jq
```

### Get Total Count
```bash
curl -X GET http://localhost:8080/api/family-tree/count \
  -H "Accept: application/json" | jq
```

---

## 3. Create Operations

### Create New Person (with Parent)
```bash
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "id": "gen9-test-001",
    "name": "Muhammad Test Khan",
    "avatar": "io.jpeg",
    "address": "Dhaka, Bangladesh",
    "level": 9,
    "signature": "α++++",
    "spouse": "Mrs Test Begum",
    "parentId": "gen8-alpha-001"
  }' | jq
```

### Create New Person (without Parent)
```bash
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "id": "gen9-test-002",
    "name": "Another Test Person",
    "avatar": "io.jpeg",
    "address": "Chittagong",
    "level": 9,
    "signature": "β++++"
  }' | jq
```

---

## 4. Update Operations (PATCH)

### Update Single Field
```bash
curl -X PATCH http://localhost:8080/api/family-tree/gen9-test-001 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "address": "Dhaka, Bangladesh (Updated)"
  }' | jq
```

### Update Multiple Fields
```bash
curl -X PATCH http://localhost:8080/api/family-tree/gen9-test-001 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "address": "Sylhet, Bangladesh",
    "spouse": "Mrs Updated Spouse",
    "signature": "α++++++"
  }' | jq
```

---

## 5. Delete Operations

### Delete Person
```bash
curl -X DELETE http://localhost:8080/api/family-tree/gen9-test-002 \
  -H "Accept: application/json" | jq
```

---

## 6. Admin Operations

### Reload Data from JSON
```bash
curl -X POST http://localhost:8080/api/family-tree/reload-data \
  -H "Accept: application/json" | jq
```

---

## 7. Error Cases

### Get Non-Existent Person (404)
```bash
curl -X GET http://localhost:8080/api/family-tree/non-existent-id \
  -H "Accept: application/json" | jq
```

### Create Person with Duplicate ID (409)
```bash
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "id": "gen5-001",
    "name": "Duplicate Person",
    "level": 5
  }' | jq
```

### Create Person with Invalid Data (400)
```bash
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "No ID Person"
  }' | jq
```

### Update Non-Existent Person (404)
```bash
curl -X PATCH http://localhost:8080/api/family-tree/non-existent-id \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Updated Name"
  }' | jq
```

---

## 8. Complex Scenarios

### Scenario 1: Create Family Branch

```bash
# 1. Create grandparent
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-gen7-001",
    "name": "Test Grandparent",
    "level": 7,
    "parentId": "gen6-alpha-001"
  }'

# 2. Create parent
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-gen8-001",
    "name": "Test Parent",
    "level": 8,
    "parentId": "test-gen7-001"
  }'

# 3. Create child
curl -X POST http://localhost:8080/api/family-tree \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-gen9-001",
    "name": "Test Child",
    "level": 9,
    "parentId": "test-gen8-001"
  }'

# 4. Verify the branch
curl -X GET http://localhost:8080/api/family-tree/test-gen7-001/descendants | jq
```

### Scenario 2: Update and Verify

```bash
# 1. Get original
curl -X GET http://localhost:8080/api/family-tree/test-gen8-001 | jq

# 2. Update
curl -X PATCH http://localhost:8080/api/family-tree/test-gen8-001 \
  -H "Content-Type: application/json" \
  -d '{
    "spouse": "Test Spouse Added",
    "address": "Test Location"
  }'

# 3. Verify update
curl -X GET http://localhost:8080/api/family-tree/test-gen8-001 | jq
```

### Scenario 3: Search and Count

```bash
# 1. Count before
curl -X GET http://localhost:8080/api/family-tree/count

# 2. Search for test persons
curl -X GET "http://localhost:8080/api/family-tree/search?name=Test" | jq

# 3. Get all at level 9
curl -X GET http://localhost:8080/api/family-tree/level/9 | jq
```

---

## 9. Using with Postman

### Import OpenAPI Spec

1. Open Postman
2. Import → Link
3. Enter: `http://localhost:8080/api-docs`
4. Collection will be auto-generated

### Or Import as cURL

Copy any curl command above and:
1. Postman → Import → Raw Text
2. Paste curl command
3. Click Import

---

## 10. Advanced Queries

### Get Entire Tree and Save to File
```bash
curl -X GET http://localhost:8080/api/family-tree \
  -H "Accept: application/json" > family_tree_backup.json
```

### Get Specific Generation
```bash
for level in {1..8}; do
  echo "Generation $level:"
  curl -s -X GET http://localhost:8080/api/family-tree/level/$level | jq '.data | length'
done
```

### Search Multiple Names
```bash
for name in "Muhammad" "Khan" "Begum"; do
  echo "Searching for: $name"
  curl -s -X GET "http://localhost:8080/api/family-tree/search?name=$name" | jq '.data | length'
done
```

---

## 11. Performance Testing

### Load Test with Apache Bench
```bash
# Install: apt-get install apache2-utils (Linux) or brew install apache2 (Mac)

# Test GET endpoint
ab -n 1000 -c 10 http://localhost:8080/api/family-tree/gen5-001

# Test with POST (create a file test.json first)
ab -n 100 -c 5 -p test.json -T application/json http://localhost:8080/api/family-tree
```

---

## 12. Cleanup Test Data

```bash
# Delete test persons created during testing
curl -X DELETE http://localhost:8080/api/family-tree/gen9-test-001
curl -X DELETE http://localhost:8080/api/family-tree/test-gen9-001
curl -X DELETE http://localhost:8080/api/family-tree/test-gen8-001
curl -X DELETE http://localhost:8080/api/family-tree/test-gen7-001

# Reload original data
curl -X POST http://localhost:8080/api/family-tree/reload-data
```

---

## Notes

- Add `| jq` at the end of commands for pretty-printed JSON (requires jq installed)
- Add `-v` flag for verbose output with headers
- Add `-i` flag to include response headers
- Use `-w "\n"` to add newline after response

### Install jq (JSON processor)
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows
choco install jq
```

---

**Happy Testing!**
