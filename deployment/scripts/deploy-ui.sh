#!/bin/bash
# File: deploy-ui.sh
# Description: Deploy React UI

set -e

BUILD_DIR=$1

if [ -z "$BUILD_DIR" ]; then
    echo "Usage: $0 <build-directory>"
    exit 1
fi

DEPLOY_DIR="/var/www/html"
BACKUP_DIR="/var/www/html/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Deploying Family Tree UI ==="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup current deployment (excluding backups folder)
echo "Backing up current deployment..."
tar -czf "$BACKUP_DIR/ui_backup_${TIMESTAMP}.tar.gz" \
    --exclude="$DEPLOY_DIR/backups" \
    -C "$DEPLOY_DIR" . 2>/dev/null || true

# Clear old files (keep backups)
echo "Clearing old files..."
find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 ! -name 'backups' -exec rm -rf {} +

# Deploy new files
echo "Deploying new files..."
cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"

# Set permissions
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# Reload Apache
echo "Reloading Apache..."
sudo systemctl reload apache2

# Cleanup old backups (keep last 5)
echo "Cleaning up old backups..."
ls -t "$BACKUP_DIR"/ui_backup_*.tar.gz | tail -n +6 | xargs -r rm

echo "✓ UI deployment complete"
