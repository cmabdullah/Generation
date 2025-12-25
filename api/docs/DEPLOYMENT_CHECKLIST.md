# Deployment Checklist

Use this checklist to ensure successful deployment of the Family Tree API.

## Pre-Deployment

### System Requirements
- [ ] Java 17 or higher installed
- [ ] Maven 3.6+ installed
- [ ] Docker and Docker Compose installed (for containerized deployment)
- [ ] At least 2GB RAM available
- [ ] Ports 7474, 7687, and 8080 are available

### Code Verification
- [x] All Java files compiled without errors
- [x] pom.xml has all required dependencies
- [x] data_full.json is in src/main/resources/data/
- [x] Configuration files (application*.yml) are present
- [x] Docker files are present

## Local Development Deployment

### Step 1: Start Neo4j
```bash
cd /Users/cmabdullah/Documents/workspace/Generation/family-tree-api
docker-compose up -d
```

- [ ] Neo4j container is running (`docker ps`)
- [ ] Neo4j Browser accessible at http://localhost:7474
- [ ] Can login with neo4j/password

### Step 2: Build Application
```bash
mvn clean package
```

- [ ] Build completes successfully
- [ ] JAR file created in target/family-tree-api.jar
- [ ] No compilation errors

### Step 3: Run Application
```bash
mvn spring-boot:run
```

OR

```bash
java -jar target/family-tree-api.jar
```

- [ ] Application starts without errors
- [ ] Sees "Started FamilyTreeApplication" in logs
- [ ] Data loading completes successfully
- [ ] No connection errors to Neo4j

### Step 4: Verify Deployment
- [ ] Health check: http://localhost:8080/actuator/health returns UP
- [ ] Swagger UI: http://localhost:8080/swagger-ui.html loads
- [ ] GET http://localhost:8080/api/family-tree returns data
- [ ] Person count > 0: http://localhost:8080/api/family-tree/count

## Docker Deployment

### Full Stack with Docker Compose

```bash
cd /Users/cmabdullah/Documents/workspace/Generation/family-tree-api/docker
docker-compose up --build
```

- [ ] Both containers start (neo4j and app)
- [ ] App waits for Neo4j health check
- [ ] Data loads automatically
- [ ] All services running: `docker-compose ps`

### Verification
- [ ] Application accessible at http://localhost:8080
- [ ] Neo4j accessible at http://localhost:7474
- [ ] Can access Swagger UI
- [ ] API endpoints responding correctly

## Production Deployment

### Configuration
- [ ] Update Neo4j credentials in application-prod.yml
- [ ] Set SPRING_PROFILES_ACTIVE=prod
- [ ] Configure proper CORS origins
- [ ] Set appropriate memory limits
- [ ] Configure logging levels (INFO/WARN)
- [ ] Set initial-load to false if not needed

### Security
- [ ] Change default Neo4j password
- [ ] Configure SSL/TLS for Neo4j
- [ ] Add authentication to API endpoints (if required)
- [ ] Configure firewall rules
- [ ] Set up HTTPS reverse proxy (nginx/Apache)

### Monitoring
- [ ] Health endpoints accessible
- [ ] Logging configured properly
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure alerts for errors

### Backup
- [ ] Neo4j data directory backed up
- [ ] Backup strategy in place
- [ ] Test restore procedure

## Testing Checklist

### Functional Tests
- [ ] GET full tree returns data
- [ ] GET person by ID works
- [ ] POST creates new person
- [ ] PATCH updates person
- [ ] DELETE removes person
- [ ] Search by name works
- [ ] Get by level works
- [ ] Count returns correct number

### Error Handling Tests
- [ ] GET non-existent ID returns 404
- [ ] POST duplicate ID returns 409
- [ ] POST invalid data returns 400
- [ ] PATCH non-existent ID returns 404
- [ ] Validation errors return proper messages

### Performance Tests
- [ ] Full tree loads in < 2 seconds
- [ ] Individual queries respond in < 500ms
- [ ] Can handle 10 concurrent requests
- [ ] No memory leaks during extended use

## Troubleshooting

### If Application Won't Start

1. Check Java version:
```bash
java -version  # Should be 17 or higher
```

2. Check ports:
```bash
lsof -i :8080  # Should be free
lsof -i :7687  # Should be free
```

3. Check Neo4j:
```bash
docker logs family-tree-neo4j
```

### If Data Doesn't Load

1. Check file exists:
```bash
ls -la src/main/resources/data/data_full.json
```

2. Check configuration:
```yaml
app:
  data:
    initial-load: true  # Should be true
```

3. Check logs for errors:
```bash
# Look for "Starting initial data load" message
```

### If API Returns Errors

1. Check Neo4j connection:
```bash
curl http://localhost:8080/actuator/health/neo4j
```

2. Verify data in Neo4j:
```cypher
# In Neo4j Browser
MATCH (p:Person) RETURN count(p)
```

3. Check application logs for stack traces

## Post-Deployment

### Immediate Verification
- [ ] All API endpoints tested
- [ ] Error responses are correct
- [ ] Swagger documentation accessible
- [ ] No errors in logs
- [ ] Memory usage stable

### Within 24 Hours
- [ ] Monitor application logs
- [ ] Check for any errors or warnings
- [ ] Verify data integrity
- [ ] Test from different clients
- [ ] Performance metrics look good

### Within 1 Week
- [ ] Backup completed successfully
- [ ] No memory leaks detected
- [ ] Performance remains stable
- [ ] User feedback collected
- [ ] Any issues documented

## Environment Variables Reference

### Required
```bash
SPRING_NEO4J_URI=bolt://localhost:7687
SPRING_NEO4J_AUTHENTICATION_USERNAME=neo4j
SPRING_NEO4J_AUTHENTICATION_PASSWORD=password
```

### Optional
```bash
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod
INITIAL_DATA_LOAD=true
```

## Quick Commands Reference

### Start Services
```bash
# Neo4j only
docker-compose up -d

# Full stack
cd docker && docker-compose up -d
```

### Stop Services
```bash
docker-compose down

# Remove data
docker-compose down -v
```

### View Logs
```bash
# Application
docker logs -f family-tree-api

# Neo4j
docker logs -f family-tree-neo4j

# Both
docker-compose logs -f
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose up --build -d
```

## Support Resources

- README.md - Full documentation
- QUICK_START.md - Quick setup guide
- API_EXAMPLES.md - API testing examples
- PROJECT_SUMMARY.md - Project overview

## Deployment Status

Date: ________________

Deployed By: ________________

Environment: [ ] Development  [ ] Staging  [ ] Production

Status: [ ] Success  [ ] Failed  [ ] Partial

Notes:
_____________________________________________
_____________________________________________
_____________________________________________

---

**Remember**: Always test in development/staging before production deployment!
