# External Network Access Troubleshooting

## Current Status
✅ **Ports are correctly bound**: Both 3000 and 8080 are listening on `0.0.0.0` (all interfaces)
✅ **Local access works**: `http://192.168.226.128:3000` works from the server
❌ **External access fails**: Cannot connect from external PC

## Verified Configuration
- Frontend: `0.0.0.0:3000` → accessible on all network interfaces
- APISIX: `0.0.0.0:8080` → accessible on all network interfaces
- Keycloak: Configured with wildcard origins

## Possible Causes & Solutions

### 1. Host Firewall (Most Likely)
The Linux firewall may be blocking incoming connections on ports 3000 and 8080.

**Check firewall status:**
```bash
sudo ufw status
# or
sudo iptables -L -n | grep -E '3000|8080'
```

**Allow ports (if using UFW):**
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp  # Keycloak
```

**Allow ports (if using iptables):**
```bash
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
sudo iptables-save
```

### 2. Network Router/Gateway
If the external PC is on a different subnet, the router may need port forwarding configured.

### 3. SELinux (if enabled)
```bash
sudo setenforce 0  # Temporarily disable to test
```

### 4. Docker Network Issue
Verify Docker is using the correct network driver:
```bash
docker network inspect marketplacenextjskafkamicroservices_microservices-net
```

## Testing Steps
1. **From server**: `curl http://192.168.226.128:3000` ✅ Works
2. **From external PC**: `telnet 192.168.226.128 3000` ❓ Test connectivity
3. **From external PC**: `ping 192.168.226.128` ❓ Test network reachability
