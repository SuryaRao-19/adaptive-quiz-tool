# 🚀 AdaptIQ — Deployment & Operational Setup Guide

This guide covers all deployment models for AdaptIQ: **Local Development**, **Containerized Docker**, **Cloud Production (SaaS)**, and **Rural Offline Classroom Gateway**.

---

## 1. Local Development Setup

### 1.1 Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- Git
- Optional: Local PostgreSQL instance or MongoDB Atlas account

### 1.2 Step 1: Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-repo/adaptive-quiz-tool.git
cd adaptive-quiz-tool

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 1.3 Step 2: Configure Environment Variables
Copy template environment files:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Ensure `server/.env` contains your Gemini API key and database strings:
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/adaptiq_db?schema=public"
MONGODB_URI="mongodb+srv://user:pass@cluster0.p7ntivh.mongodb.net/adaptiq_db?retryWrites=true&w=majority"

# Security
JWT_SECRET="super_secret_school_jwt_key_change_in_production_987654321"
JWT_EXPIRES_IN="7d"

# AI Configuration
GEMINI_API_KEY="AIzaSy...your_gemini_key"
GEMINI_MODEL="gemini-3.8-flash"
AI_ROUTING_MODE="auto"
AI_FALLBACK_ENABLED="true"
```

### 1.4 Step 3: Run Database Migrations & Seed
```bash
cd server
npm run prisma:generate
npm run seed
cd ..
```
*Demo credentials populated:*
- **Demo Student**: Roll Number `STUDENT01`, PIN `1234`
- **Demo Teacher**: ID `TEACHER01`, Password `admin123`

### 1.5 Step 4: Run Application
Open two terminal windows:
```bash
# Terminal 1: Backend API (port 5000)
npm start --prefix server

# Terminal 2: Frontend Client (port 5173)
npm run dev --prefix client
```
Access the application at [http://localhost:5173](http://localhost:5173).

---

## 2. Containerized Docker Deployment (`docker-compose.yml`)

Run the complete multi-container stack (PostgreSQL + Backend + Frontend) using Docker:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: adaptiq-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password_123
      POSTGRES_DB: adaptiq_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: adaptiq-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:secure_password_123@postgres:5432/adaptiq_db?schema=public
      - JWT_SECRET=production_jwt_secret_key_987654321
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GEMINI_MODEL=gemini-3.8-flash
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: adaptiq-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

Execute with a single command:
```bash
docker compose up -d
```

---

## 3. Cloud Production SaaS Deployment

| Component | Recommended Cloud Provider | Build & Runtime Configuration |
| :--- | :--- | :--- |
| **Frontend SPA** | **Vercel** / **Netlify** / **Cloudflare Pages** | Build Command: `npm run build`<br>Output Directory: `dist`<br>Environment: `VITE_API_URL=https://api.yourdomain.com` |
| **Backend API** | **Render** / **Railway** / **Google Cloud Run** | Runtime: Node.js 18+<br>Start Command: `node server.js`<br>Port: `5000`<br>Enable HTTP/2 & disable SSE proxy buffering (`X-Accel-Buffering: no`) |
| **Authoritative DB** | **Neon** / **Supabase** / **AWS RDS** | PostgreSQL 16 with automated daily WAL snapshots and connection pooling (`pgbouncer`). |
| **Document Store** | **MongoDB Atlas** | Tier M0 (Free) or M10 cluster with automated multi-region replication. |

---

## 4. Rural Offline Classroom Gateway (Resource-Constrained Schools)

For remote or rural schools with intermittent or zero internet connectivity:
1. **Hardware**: Low-cost Raspberry Pi 4 (4GB RAM) or refurbished school mini-PC.
2. **Local Wi-Fi Network**: A standard unmetered Wi-Fi router (no internet required).
3. **Deployment**:
   - Raspberry Pi binds backend to the local subnet (`LOCAL_LAN_BIND=0.0.0.0:5000`).
   - Local DNS assigns `adaptiq.local` or the Pi's static LAN IP (e.g. `192.168.1.100`).
   - Students connect their phones or school tablets to the Wi-Fi and open `http://adaptiq.local`.
   - The local heuristic engines (BKT, Rasch item selection, Leitner schedule) evaluate student answers 100% offline.
4. **Data Sync**: When the teacher brings the device within range of cellular data or internet, an automated sync script uploads quarantined student attempts to the central cloud database.

