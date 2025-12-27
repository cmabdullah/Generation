# Neo4j Configuration Documentation

## Server Information

| Property             | Value                      |
|----------------------|----------------------------|
| **Server IP**        | 200.69.21.86               |
| **Neo4j Version**    | 5.15.0 (Community Edition) |
| **Operating System** | Ubuntu 22.04 (Jammy)       |
| **Java Version**     | OpenJDK 17                 |

---

## Access Details

### Web Browser Interface

| Property     | Value                    |
|--------------|--------------------------|
| **URL**      | http://200.69.21.86:7474 |
| **Protocol** | HTTP                     |
| **Port**     | 7474                     |

### Database Connection (Bolt)

| Property     | Value                    |
|--------------|--------------------------|
| **URI**      | bolt://200.69.21.86:7687 |
| **Protocol** | Bolt                     |
| **Port**     | 7687                     |

---

## Connection Examples

### Cypher Shell (Command Line)

```bash
# Local connection
cypher-shell -u neo4j -p 'neo4j'

# Remote connection
cypher-shell -a bolt://200.69.21.86:7687 -u neo4j -p 'neo4j'
```

---

## Important Ports

| Port | Protocol | Purpose                                      |
|------|----------|----------------------------------------------|
| 7474 | HTTP     | Neo4j Browser (Web UI)                       |
| 7687 | Bolt     | Database connections (drivers, cypher-shell) |
| 7473 | HTTPS    | Secure Neo4j Browser (if enabled)            |

---

## File Locations

| Purpose       | Path                          |
|---------------|-------------------------------|
| Configuration | `/etc/neo4j/neo4j.conf`       |
| Data          | `/var/lib/neo4j/data`         |
| Logs          | `/var/log/neo4j/`             |
| Plugins       | `/var/lib/neo4j/plugins`      |
| Import        | `/var/lib/neo4j/import`       |
| Certificates  | `/var/lib/neo4j/certificates` |

---

## Service Management

```bash
# Start Neo4j
sudo systemctl start neo4j

# Stop Neo4j
sudo systemctl stop neo4j

# Restart Neo4j
sudo systemctl restart neo4j

# Check status
sudo systemctl status neo4j

# Enable auto-start on boot
sudo systemctl enable neo4j

# View logs
sudo journalctl -u neo4j -f
```

---

## Key Configuration Settings

File: `/etc/neo4j/neo4j.conf`

```conf
# Listen on all interfaces
server.default_listen_address=0.0.0.0

# HTTP Connector (Browser)
server.http.enabled=true
server.http.listen_address=0.0.0.0:7474

# Bolt Connector (Database)
server.bolt.listen_address=0.0.0.0:7687

# HTTPS Connector (Optional)
server.https.enabled=false
server.https.listen_address=0.0.0.0:7473
```

---

## Password Management

### Reset Password

```bash
# Stop Neo4j
sudo systemctl stop neo4j

# Remove existing auth
sudo rm -rf /var/lib/neo4j/data/dbms/auth*

# Set new password
sudo neo4j-admin dbms set-initial-password 'YOUR_NEW_PASSWORD'

# Start Neo4j
sudo systemctl start neo4j
```

---

## Troubleshooting

### Check if Neo4j is Running

```bash
sudo systemctl status neo4j
```

### Check Listening Ports

```bash
sudo ss -tlnp | grep -E '7474|7687'
```

### Test Local Connection

```bash
curl http://localhost:7474
```

### View Recent Logs

```bash
sudo tail -100 /var/log/neo4j/neo4j.log
```

### Jansi Warning Fix

If you see Jansi library warnings, add to `~/.bashrc`:

```bash
export JAVA_TOOL_OPTIONS="-Djansi.tmpdir=$HOME/jansi-tmp"
mkdir -p ~/jansi-tmp
```