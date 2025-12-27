#!/bin/bash
# File: vm-setup.sh
# Description: Initial VM setup for Family Tree application

set -e

echo "=== Family Tree Application Server Setup ==="

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Java 17 is already installed - verify version
echo "Verifying Java installation..."
java -version

# Install Apache HTTPD
echo "Installing Apache HTTPD..."
sudo apt-get install -y apache2
sudo systemctl enable apache2
sudo systemctl start apache2

# Install Git
sudo apt-get install -y git

# Create application directories
echo "Creating application directories..."
sudo mkdir -p /opt/family-tree/{api,scripts,config,logs}
sudo mkdir -p /opt/family-tree/api/{current,releases,logs,backups}
sudo mkdir -p /var/www/html/backups

# Create application user
sudo useradd -r -s /bin/bash -d /opt/family-tree familytree || echo "User familytree already exists"
sudo chown -R familytree:familytree /opt/family-tree

# Configure Apache
echo "Configuring Apache..."
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers

# Create Apache configuration
sudo tee /etc/apache2/sites-available/family-tree.conf > /dev/null <<'EOF'
<VirtualHost *:80>
    ServerName familytree.local
    DocumentRoot /var/www/html

    # React Router support
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Handle React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API requests
    ProxyPreserveHost On
    ProxyPass /api http://localhost:8081/api
    ProxyPassReverse /api http://localhost:8081/api

    # Error and Access logs
    ErrorLog ${APACHE_LOG_DIR}/family-tree-error.log
    CustomLog ${APACHE_LOG_DIR}/family-tree-access.log combined
</VirtualHost>
EOF

# Enable site
sudo a2ensite family-tree.conf
sudo a2dissite 000-default.conf
sudo systemctl reload apache2

# Neo4j is already configured - skip installation
echo "Neo4j is already configured on this VM"
echo "Verifying Neo4j status..."
sudo systemctl status neo4j --no-pager

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Verify Neo4j connection and credentials"
echo "2. Configure firewall rules if needed"
echo "3. Set up SSH keys for Jenkins deployment"
