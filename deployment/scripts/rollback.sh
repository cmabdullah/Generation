#!/bin/bash
# File: rollback.sh
# Description: Rollback to previous version

set -e

COMPONENT=${1:-api}  # api or ui

if [ "$COMPONENT" == "api" ]; then
    BACKUP_DIR="/opt/family-tree/api/backups"
    CURRENT_LINK="/opt/family-tree/api/current"

    # Get latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -1)

    if [ -z "$LATEST_BACKUP" ]; then
        echo "No backup found!"
        exit 1
    fi

    echo "Rolling back API to: $LATEST_BACKUP"
    sudo systemctl stop family-tree-api
    rm -f "$CURRENT_LINK"
    ln -s "$BACKUP_DIR/$LATEST_BACKUP" "$CURRENT_LINK"
    sudo systemctl start family-tree-api

    echo "✓ API rollback complete"

elif [ "$COMPONENT" == "ui" ]; then
    BACKUP_DIR="/var/www/html/backups"
    DEPLOY_DIR="/var/www/html"

    # Get latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/ui_backup_*.tar.gz | head -1)

    if [ -z "$LATEST_BACKUP" ]; then
        echo "No backup found!"
        exit 1
    fi

    echo "Rolling back UI to: $LATEST_BACKUP"
    find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 ! -name 'backups' -exec rm -rf {} +
    tar -xzf "$LATEST_BACKUP" -C "$DEPLOY_DIR"
    sudo systemctl reload apache2

    echo "✓ UI rollback complete"

else
    echo "Invalid component. Use 'api' or 'ui'"
    exit 1
fi
