#!/bin/bash
# File: verify-neo4j.sh
# Description: Verify Neo4j connection

# Check Neo4j service status
echo "Checking Neo4j service..."
sudo systemctl status neo4j --no-pager

# Check Neo4j is listening
echo -e "\nChecking Neo4j connectivity..."
netstat -tuln | grep 7687 || ss -tuln | grep 7687

# Test connection (requires credentials)
echo -e "\nTesting Neo4j connection..."
echo "To test connection, run:"
echo "cypher-shell -a bolt://localhost:7687 -u neo4j -p <password>"

# Get Neo4j version
echo -e "\nNeo4j version:"
neo4j version 2>/dev/null || echo "Run: neo4j version"
