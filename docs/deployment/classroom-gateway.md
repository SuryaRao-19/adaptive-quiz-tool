# AdaptIQ Local Classroom Server & No-Internet Gateway Architecture

## 1. Overview
In under-resourced schools and remote areas without reliable internet backhaul, AdaptIQ operates in **Classroom Gateway Mode**. 
A teacher laptop or low-cost microcomputer (e.g., Raspberry Pi 4/5) acts as an on-premise local server. Student tablets, lab PCs, and Chromebooks connect to a local Wi-Fi router (no internet required) to access curriculum questions, complete adaptive practice, and persist assessment attempts.

```text
+-----------------------+       Local Wi-Fi        +-----------------------------+
|    Student Tablets    | <--------------------->  |  Teacher Classroom Gateway  |
| (Chromebooks/Laptops) |                          |    (Node.js + MongoDB)      |
+-----------------------+                          +-----------------------------+
                                                                  |
                                                      Periodic Cloud Sync
                                                      (When Internet Returns)
                                                                  v
                                                   +-----------------------------+
                                                   |    Central Cloud Cluster    |
                                                   |  (Standardized Analytics)   |
                                                   +-----------------------------+
```

---

## 2. Gateway Deployment Architecture

### 2.1 Hardware Requirements
- **Teacher Laptop**: Windows 10/11, macOS, or Ubuntu Linux with 4GB+ RAM.
- **Microcomputer**: Raspberry Pi 4 or 5 (4GB/8GB RAM) running Raspberry Pi OS (64-bit) with a durable Class 10/A2 MicroSD or USB 3.0 SSD.
- **Local Access Point**: Standard Wi-Fi router capable of handling 40–60 concurrent DHCP clients.

### 2.2 Operational Roles
1. **Student Device**:
   - Accesses the PWA frontend at the gateway's LAN address (e.g. `http://192.168.1.100:5173` or port `5000` in production).
   - Authenticates via roll number and 4-digit PIN.
   - Practices STEM questions offline.
2. **Classroom Gateway**:
   - Runs local Express server with local MongoDB database.
   - Provides `/api/health` and `/api/gateway/health` discovery.
   - Stores approved curriculum bundles and logs assessment attempts.
   - Idempotently reconciles incoming attempts.
3. **Central Cloud Service**:
   - Authorized target when the teacher reconnects to the internet.
   - Receives reconciled event batches from the gateway.

---

## 3. Configuration & Startup

### Environment Flags (`.env`)
```bash
# Set Gateway mode
GATEWAY_MODE=true
LOCAL_LAN_BIND=0.0.0.0
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptiq_local
CONTENT_BUNDLE_VERSION=2.0.0-stem-offline
JWT_SECRET=classroom_gateway_secure_key_12345
```

### Running on Teacher Laptop
```bash
# 1. Start persistent local MongoDB
mongod --dbpath ./data/db --bind_ip 127.0.0.1,0.0.0.0

# 2. Start Gateway Backend
cd server
npm start

# 3. Serve Frontend Build
cd ../client
npm run preview -- --host 0.0.0.0 --port 5173
```

---

## 4. LAN Security Directives
A local classroom Wi-Fi network cannot be presumed secure:
1. **Network Exposure Isolation**:
   - The database port (`27017`) must **NEVER** be bound to the public interface. Only the Express backend binds to `0.0.0.0`.
2. **Role Boundaries**:
   - Administrative and teacher endpoints (`/api/classes`, `/api/progress/export-gradebook`, `/api/gateway/quarantine`) require strict JWT tokens with `teacher` or `admin` role.
   - Students cannot access teacher dashboards or export gradebooks.
3. **Transport Security Note**:
   - In pure offline air-gapped classrooms without internet PKI certificates, HTTPS with trusted public CA is not available. The local gateway relies on LAN WPA2/WPA3 access control, token expiry, and password hashing (Bcrypt). Teachers are advised to use dedicated school Wi-Fi SSIDs with client isolation.

---

## 5. Event Deduplication & Quarantine Protocol
When offline devices sync attempts, the gateway enforces:
- **Idempotency**: Every attempt event carries an `eventId` (e.g., `evt_172900000_abc123`). If already recorded, it is acknowledged as duplicate with zero state mutation.
- **Quarantine**: If an attempt references an unregistered student or unapproved question version, it is placed in `QuarantinedAttempt` for teacher review instead of being silently dropped.
