#!/bin/bash

###############################################################################
# Clear Neo4j Database Script
#
# This script clears all data from the Neo4j database.
# Use with caution - this will delete ALL nodes and relationships!
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║        Neo4j Database Clear Script                        ║${NC}"
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Configuration
NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
NEO4J_USERNAME="${NEO4J_USERNAME:neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:password}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Neo4j URI: $NEO4J_URI"
echo "  Username: $NEO4J_USERNAME"
echo ""

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

# Function to execute Cypher query
execute_cypher() {
    local query="$1"
    local description="$2"

    echo -e "${YELLOW}→ $description${NC}"

    # Using cypher-shell
    if command -v cypher-shell &> /dev/null; then
        echo "$query" | cypher-shell \
            -a "$NEO4J_URI" \
            -u "$NEO4J_USERNAME" \
            -p "$NEO4J_PASSWORD" \
            --format plain

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Done${NC}"
        else
            echo -e "${RED}✗ Failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ cypher-shell not found. Please install Neo4j Shell.${NC}"
        echo ""
        echo "Alternative: Use curl with Neo4j HTTP API"

        # Fallback to HTTP API
        curl -X POST \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "{\"statements\":[{\"statement\":\"$query\"}]}" \
            -u "$NEO4J_USERNAME:$NEO4J_PASSWORD" \
            "$NEO4J_URI/db/data/transaction/commit" \
            2>/dev/null

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Done${NC}"
        else
            echo -e "${RED}✗ Failed${NC}"
            return 1
        fi
    fi

    echo ""
}

# Step 1: Count current nodes
echo -e "${YELLOW}[1/4] Checking current database state...${NC}"
count_query="MATCH (n) RETURN count(n) as nodeCount;"
execute_cypher "$count_query" "Counting nodes"

# Step 2: Delete all Person nodes and relationships
echo -e "${YELLOW}[2/4] Deleting Person nodes...${NC}"
delete_persons="MATCH (p:Person) DETACH DELETE p;"
execute_cypher "$delete_persons" "Removing all Person nodes and relationships"

# Step 3: Delete all PersonDetails nodes and relationships
echo -e "${YELLOW}[3/4] Deleting PersonDetails nodes...${NC}"
delete_details="MATCH (pd:PersonDetails) DETACH DELETE pd;"
execute_cypher "$delete_details" "Removing all PersonDetails nodes and relationships"

# Step 4: Delete any remaining nodes (cleanup)
echo -e "${YELLOW}[4/4] Cleaning up remaining data...${NC}"
delete_all="MATCH (n) DETACH DELETE n;"
execute_cypher "$delete_all" "Removing any remaining nodes"

# Verify database is empty
echo -e "${YELLOW}Verifying database is empty...${NC}"
verify_query="MATCH (n) RETURN count(n) as nodeCount;"
execute_cypher "$verify_query" "Final node count"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Database successfully cleared!                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run the migration script if needed"
echo "  2. Start the application to reload data"
echo ""
