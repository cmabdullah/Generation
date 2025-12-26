#!/bin/bash
# File: deploy-api.sh
# Description: Deploy Spring Boot API

set -e

VERSION=$1
JAR_FILE=$2

if [ -z "$VERSION" ] || [ -z "$JAR_FILE" ]; then
    echo "Usage: $0 <version> <jar-file>"
    exit 1
fi

DEPLOY_DIR="/opt/family-tree/api"
RELEASE_DIR="$DEPLOY_DIR/releases/$VERSION"
CURRENT_LINK="$DEPLOY_DIR/current"
BACKUP_DIR="$DEPLOY_DIR/backups"

echo "=== Deploying Family Tree API v$VERSION ==="

# Create release directory
mkdir -p "$RELEASE_DIR"
mkdir -p "$BACKUP_DIR"

# Copy JAR file
echo "Copying JAR file..."
cp "$JAR_FILE" "$RELEASE_DIR/family-tree-api.jar"

# Backup current version
if [ -L "$CURRENT_LINK" ]; then
    CURRENT_VERSION=$(basename $(readlink -f "$CURRENT_LINK"))
    echo "Backing up current version: $CURRENT_VERSION"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    cp -r "$CURRENT_LINK" "$BACKUP_DIR/${CURRENT_VERSION}_${TIMESTAMP}"
fi

# Stop service
echo "Stopping service..."
sudo systemctl stop family-tree-api || true

# Update symlink
echo "Updating current version symlink..."
rm -f "$CURRENT_LINK"
ln -s "$RELEASE_DIR" "$CURRENT_LINK"

# Start service
echo "Starting service..."
sudo systemctl start family-tree-api

# Health check
echo "Performing health check..."
sleep 10
for i in {1..30}; do
    if curl -f http://localhost:8081/actuator/health > /dev/null 2>&1; then
        echo "✓ API is healthy"
        exit 0
    fi
    echo "Waiting for API to start... ($i/30)"
    sleep 2
done

echo "✗ Health check failed!"
echo "Rolling back..."
bash /opt/family-tree/scripts/rollback.sh api
exit 1
