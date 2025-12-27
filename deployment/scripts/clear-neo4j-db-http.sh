#!/bin/bash

###############################################################################
# Clear Neo4j Database Script (HTTP API Version)
#
# This script clears all data from the Neo4j database using HTTP API.
# Does not require cypher-shell - only needs curl.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║        Neo4j Database Clear Script (HTTP API)             ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
NEO4J_HOST="${NEO4J_HOST:-localhost}"
NEO4J_PORT="${NEO4J_PORT:-7474}"
NEO4J_USERNAME="${NEO4J_USERNAME:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-password}"
NEO4J_URL="http://${NEO4J_HOST}:${NEO4J_PORT}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Neo4j URL: $NEO4J_URL"
echo "  Username: $NEO4J_USERNAME"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}✗ curl is required but not installed.${NC}"
    exit 1
fi

# Warning prompt
echo -e "${RED}⚠️  WARNING: This will DELETE ALL data from the Neo4j database!${NC}"
echo -e "${RED}⚠️  This action CANNOT be undone!${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting database clear process...${NC}"
echo ""

# Function to execute Cypher query via HTTP API
execute_cypher() {
    local query="$1"
    local description="$2"

    echo -e "${YELLOW}→ $description${NC}"

    # Execute query
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -u "$NEO4J_USERNAME:$NEO4J_PASSWORD" \
        -d "{\"statements\":[{\"statement\":\"$query\"}]}" \
        "$NEO4J_URL/db/neo4j/tx/commit")

    # Check for errors
    if echo "$response" | grep -q '"errors":\['; then
        errors=$(echo "$response" | grep -o '"message":"[^"]*"' | head -1)
        if [ -n "$errors" ]; then
            echo -e "${RED}✗ Failed: $errors${NC}"
            return 1
        fi
    fi

    # Check if request was successful
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Done${NC}"

        # Try to extract and show result count if available
        if echo "$response" | grep -q '"data"'; then
            result=$(echo "$response" | grep -o '"data":\[\[[^]]*\]\]' | head -1)
            if [ -n "$result" ]; then
                echo "  Result: $result"
            fi
        fi
    else
        echo -e "${RED}✗ Failed to connect to Neo4j${NC}"
        return 1
    fi

    echo ""
}

# Test connection
echo -e "${YELLOW}Testing Neo4j connection...${NC}"
test_response=$(curl -s -u "$NEO4J_USERNAME:$NEO4J_PASSWORD" "$NEO4J_URL/db/neo4j/")

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Cannot connect to Neo4j at $NEO4J_URL${NC}"
    echo ""
    echo "Please check:"
    echo "  1. Neo4j is running"
    echo "  2. Neo4j HTTP port (default 7474) is accessible"
    echo "  3. Credentials are correct"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Connected to Neo4j${NC}"
echo ""

# Step 1: Count current nodes
echo -e "${YELLOW}[1/4] Checking current database state...${NC}"
execute_cypher "MATCH (n) RETURN count(n) as nodeCount" "Counting nodes"

# Step 2: Delete all Person nodes and relationships
echo -e "${YELLOW}[2/4] Deleting Person nodes...${NC}"
execute_cypher "MATCH (p:Person) DETACH DELETE p" "Removing all Person nodes and relationships"

# Step 3: Delete all PersonDetails nodes and relationships
echo -e "${YELLOW}[3/4] Deleting PersonDetails nodes...${NC}"
execute_cypher "MATCH (pd:PersonDetails) DETACH DELETE pd" "Removing all PersonDetails nodes and relationships"

# Step 4: Delete any remaining nodes (cleanup)
echo -e "${YELLOW}[4/4] Cleaning up remaining data...${NC}"
execute_cypher "MATCH (n) DETACH DELETE n" "Removing any remaining nodes"

# Verify database is empty
echo -e "${YELLOW}Verifying database is empty...${NC}"
execute_cypher "MATCH (n) RETURN count(n) as nodeCount" "Final node count"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Database successfully cleared!                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run the migration script if needed"
echo "  2. Start the application to reload data"
echo ""
