#!/bin/bash
# File: healthcheck.sh
# Description: Continuous health monitoring

API_URL="http://localhost:8081/actuator/health"
UI_URL="http://localhost:80"
ALERT_EMAIL="devops@familytree.com"

check_api() {
    if ! curl -sf "$API_URL" > /dev/null; then
        echo "API health check failed!"
        return 1
    fi
    return 0
}

check_ui() {
    if ! curl -sf "$UI_URL" > /dev/null; then
        echo "UI health check failed!"
        return 1
    fi
    return 0
}

# Main monitoring loop
while true; do
    if ! check_api; then
        echo "API is down, attempting restart..."
        sudo systemctl restart family-tree-api
        # Send alert (configure mail command)
        # echo "API is down" | mail -s "Family Tree API Alert" "$ALERT_EMAIL"
    fi

    if ! check_ui; then
        echo "UI is down, attempting recovery..."
        sudo systemctl reload apache2
        # Send alert (configure mail command)
        # echo "UI is down" | mail -s "Family Tree UI Alert" "$ALERT_EMAIL"
    fi

    sleep 60
done
