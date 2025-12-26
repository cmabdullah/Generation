# Deployment Checklist

Use this checklist to ensure a successful deployment of the Family Tree application.

## Pre-Deployment Checklist

### Infrastructure Verification

- [ ] VM is accessible via `ssh vm`
- [ ] Neo4j 5.15.0 is running on VM
  ```bash
  ssh vm "systemctl status neo4j"
  ```
- [ ] Java 17 is installed on VM
  ```bash
  ssh vm "java -version"
  ```
- [ ] You have Neo4j credentials (username and password)
- [ ] SSH key is configured for passwordless access

### Local Environment

- [ ] Git repository is cloned
- [ ] You're on the correct branch (master/main)
- [ ] All changes are committed
- [ ] Gradle wrapper is executable (`chmod +x api/gradlew`)
- [ ] Node.js and npm are installed locally

## Initial Setup (One-Time)

### Step 1: VM Infrastructure Setup

- [ ] Copy vm-setup.sh to VM
  ```bash
  scp deployment/scripts/vm-setup.sh vm:/tmp/
  ```
- [ ] Execute setup script
  ```bash
  ssh vm "sudo bash /tmp/vm-setup.sh"
  ```
- [ ] Verify Apache is running
  ```bash
  ssh vm "systemctl status apache2"
  ```
- [ ] Verify application directories created
  ```bash
  ssh vm "ls -la /opt/family-tree/"
  ```

### Step 2: Systemd Service Configuration

- [ ] Copy service file to VM
  ```bash
  scp deployment/systemd/family-tree-api.service vm:/tmp/
  ```
- [ ] Edit service file with Neo4j password
  ```bash
  ssh vm "sudo nano /tmp/family-tree-api.service"
  ```
- [ ] Verify password is set (not 'your-neo4j-password-here')
- [ ] Install service file
  ```bash
  ssh vm "sudo cp /tmp/family-tree-api.service /etc/systemd/system/"
  ```
- [ ] Reload systemd daemon
  ```bash
  ssh vm "sudo systemctl daemon-reload"
  ```
- [ ] Enable service (don't start yet)
  ```bash
  ssh vm "sudo systemctl enable family-tree-api"
  ```

### Step 3: Deployment Scripts

- [ ] Copy all scripts to VM
  ```bash
  scp deployment/scripts/*.sh vm:/tmp/
  ```
- [ ] Move scripts to correct location
  ```bash
  ssh vm "sudo mkdir -p /opt/family-tree/scripts" && ssh vm "sudo cp /tmp/*.sh /opt/family-tree/scripts/"
  ```
- [ ] Make scripts executable
  ```bash
  ssh vm "sudo chmod +x /opt/family-tree/scripts/*.sh"
  ```
- [ ] Set correct ownership
  ```bash
  ssh vm "sudo chown familytree:familytree /opt/family-tree/scripts/*.sh"
  ```
- [ ] Verify scripts are in place
  ```bash
  ssh vm "ls -la /opt/family-tree/scripts/"
  ```

## First Deployment

### API Deployment

- [ ] Build API locally
  ```bash
  cd api && ./gradlew clean bootJar
  ```
- [ ] Verify JAR was created
  ```bash
  ls -lh api/build/libs/family-tree-api.jar
  ```
- [ ] Copy JAR to VM
  ```bash
  scp api/build/libs/family-tree-api.jar vm:/tmp/
  ```
- [ ] Deploy API (first time)
  ```bash
  ssh vm "sudo -u familytree bash /opt/family-tree/scripts/deploy-api.sh 1.0.0 /tmp/family-tree-api.jar"
  ```
- [ ] Wait for deployment to complete
- [ ] Verify API is running
  ```bash
  ssh vm "systemctl status family-tree-api"
  ```
- [ ] Test API health endpoint
  ```bash
  ssh vm "curl http://localhost:8081/actuator/health"
  ```
- [ ] Check API logs if needed
  ```bash
  ssh vm "tail -50 /opt/family-tree/logs/api-stdout.log"
  ```

### UI Deployment

- [ ] Build UI locally
  ```bash
  cd ui && npm ci && npm run build
  ```
- [ ] Verify build was created
  ```bash
  ls -la ui/dist/
  ```
- [ ] Package UI build
  ```bash
  tar -czf ui-dist.tar.gz -C ui/dist .
  ```
- [ ] Copy to VM
  ```bash
  scp ui-dist.tar.gz vm:/tmp/
  ```
- [ ] Deploy UI
  ```bash
  ssh vm "mkdir -p /tmp/ui-dist && \
          tar -xzf /tmp/ui-dist.tar.gz -C /tmp/ui-dist && \
          sudo bash /opt/family-tree/scripts/deploy-ui.sh /tmp/ui-dist && \
          rm -rf /tmp/ui-dist /tmp/ui-dist.tar.gz"
  ```
- [ ] Verify UI files are deployed
  ```bash
  ssh vm "ls -la /var/www/html/"
  ```
- [ ] Test UI accessibility
  ```bash
  ssh vm "curl -I http://localhost:80"
  ```

## Jenkins Setup

### Jenkins Configuration

- [ ] Jenkins is installed and accessible
- [ ] Required plugins installed:
  - [ ] Pipeline Plugin
  - [ ] Git Plugin
  - [ ] Gradle Plugin
  - [ ] NodeJS Plugin
  - [ ] SSH Agent Plugin
  - [ ] Credentials Plugin
  - [ ] Email Extension Plugin

### Credentials Setup

- [ ] Add `vm-ssh-key` credential (SSH Username with private key)
  - [ ] Test SSH connection to VM
- [ ] Add `neo4j-prod-password` credential (Secret text)
- [ ] Add `git-credentials` credential (if needed)

### Tools Configuration

- [ ] Configure JDK-17
  - [ ] Verify path or auto-install enabled
- [ ] Configure Gradle-8.5
  - [ ] Auto-install from Gradle.org
- [ ] Configure NodeJS-18
  - [ ] Auto-install latest 18.x version

### Pipeline Job Creation

- [ ] Create new Pipeline job: `family-tree-deploy`
- [ ] Configure SCM:
  - [ ] Git repository URL set
  - [ ] Credentials configured (if needed)
  - [ ] Branch: `*/master` or `*/main`
- [ ] Configure Pipeline:
  - [ ] Script path: `Jenkinsfile`
- [ ] Configure parameters (should be auto-detected from Jenkinsfile):
  - [ ] DEPLOY_COMPONENT
  - [ ] SKIP_TESTS
  - [ ] FORCE_DEPLOY
- [ ] Save configuration

### Optional: Separate Pipelines

- [ ] Create `family-tree-api-deploy` job
  - [ ] Script path: `deployment/jenkins/Jenkinsfile.api`
- [ ] Create `family-tree-ui-deploy` job
  - [ ] Script path: `deployment/jenkins/Jenkinsfile.ui`

## First Jenkins Build

- [ ] Trigger build with parameters:
  - [ ] DEPLOY_COMPONENT: BOTH
  - [ ] SKIP_TESTS: false
- [ ] Monitor build progress
- [ ] Check console output for errors
- [ ] Verify build success
- [ ] Check deployment on VM

## Post-Deployment Verification

### Service Status

- [ ] API service is active
  ```bash
  ssh vm "systemctl is-active family-tree-api"
  ```
- [ ] Apache is active
  ```bash
  ssh vm "systemctl is-active apache2"
  ```
- [ ] Neo4j is active
  ```bash
  ssh vm "systemctl is-active neo4j"
  ```

### Health Checks

- [ ] API health endpoint responds
  ```bash
  curl http://vm:8081/actuator/health
  ```
- [ ] UI is accessible
  ```bash
  curl -I http://vm
  ```
- [ ] API accessible through proxy
  ```bash
  curl http://vm/api/actuator/health
  ```

### Functional Testing

- [ ] Access UI in browser: `http://vm`
- [ ] Verify UI loads correctly
- [ ] Test API endpoints through UI
- [ ] Verify data loads from Neo4j
- [ ] Test create/update/delete operations

### Log Verification

- [ ] Check API logs for errors
  ```bash
  ssh vm "journalctl -u family-tree-api -n 50 --no-pager"
  ```
- [ ] Check Apache access logs
  ```bash
  ssh vm "tail -50 /var/log/apache2/family-tree-access.log"
  ```
- [ ] Check Apache error logs
  ```bash
  ssh vm "tail -50 /var/log/apache2/family-tree-error.log"
  ```

## Production Hardening (Recommended)

### Security

- [ ] Configure firewall rules
  ```bash
  ssh vm "sudo ufw allow 22/tcp && \
          sudo ufw allow 80/tcp && \
          sudo ufw allow 443/tcp && \
          sudo ufw enable"
  ```
- [ ] Verify Neo4j is not exposed externally
  ```bash
  ssh vm "sudo ufw status | grep 7687"
  ```
- [ ] Change default passwords
- [ ] Review file permissions

### SSL/TLS (Optional but Recommended)

- [ ] Install Certbot
  ```bash
  ssh vm "sudo apt-get install -y certbot python3-certbot-apache"
  ```
- [ ] Obtain SSL certificate
  ```bash
  ssh vm "sudo certbot --apache -d yourdomain.com"
  ```
- [ ] Verify SSL configuration
- [ ] Test auto-renewal
  ```bash
  ssh vm "sudo certbot renew --dry-run"
  ```

### Monitoring

- [ ] Set up health check monitoring
  ```bash
  ssh vm "nohup bash /opt/family-tree/scripts/healthcheck.sh > /dev/null 2>&1 &"
  ```
  Or create systemd service for healthcheck.sh
- [ ] Configure email alerts
- [ ] Set up log rotation
- [ ] Configure backup schedule

### Documentation

- [ ] Document Neo4j credentials location
- [ ] Document SSH key location
- [ ] Update team wiki/docs with:
  - [ ] Deployment URLs
  - [ ] Jenkins job names
  - [ ] Contact information
  - [ ] Troubleshooting steps

## Rollback Testing

- [ ] Test API rollback
  ```bash
  ssh vm "sudo -u familytree bash /opt/family-tree/scripts/rollback.sh api"
  ```
- [ ] Verify API rolled back successfully
- [ ] Redeploy API
- [ ] Test UI rollback
  ```bash
  ssh vm "sudo bash /opt/family-tree/scripts/rollback.sh ui"
  ```
- [ ] Verify UI rolled back successfully
- [ ] Redeploy UI

## Final Sign-Off

- [ ] All services running and healthy
- [ ] Application accessible and functional
- [ ] Monitoring in place
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team trained on deployment process
- [ ] Rollback procedure tested
- [ ] Production ready ✅

## Emergency Contacts

- **VM Access Issues**: _____________
- **Neo4j Issues**: _____________
- **Jenkins Issues**: _____________
- **Network/Infrastructure**: _____________

## Notes

Use this space for deployment-specific notes:

```
Date: __________
Deployed by: __________
Version: __________
Issues encountered: __________
Resolution: __________
```

---

**Deployment Status**: ☐ Not Started | ☐ In Progress | ☐ Complete
**Sign-off**: _____________ Date: _____________
