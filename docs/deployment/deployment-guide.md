# AdaptIQ Deployment & Operations Guide

## 1. Environment Requirements
- **Node.js**: LTS v18, v20, or v22+ (tested on Node v24.14.0)
- **MongoDB**: v6.0+ (MongoDB Atlas or self-hosted replica set)
- **AI Integration**: Google Gemini API key (optional; fallback heuristics operate automatically if key is absent)

## 2. Configuration (`.env`)

### Server (`server/.env`):
```ini
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/adaptiq?retryWrites=true&w=majority
JWT_SECRET=<secure_random_64_char_secret>
CLIENT_URL=https://adaptiq.example.com
GEMINI_API_KEY=<optional_gemini_api_key>
```

### Client (`client/.env`):
```ini
VITE_API_URL=https://api.adaptiq.example.com
```

## 3. Build & Launch Procedures

### 3.1 Server Deployment:
```bash
cd server
npm ci --only=production
npm test # Pre-flight test suite must pass 100%
npm start
```

### 3.2 Client Build & PWA Hosting:
```bash
cd client
npm ci
npm run build
# The resulting client/dist directory can be deployed to Nginx, Cloudflare Pages, Vercel, or AWS S3+CloudFront.
```

## 4. Rollback & Disaster Recovery
- If MongoDB becomes unreachable in production, `server/config/db.js` halts immediately with an operational log rather than falling back to in-memory mode, preventing data corruption.
- In-flight student answers are safeguarded in IndexedDB (`syncQueue`) and automatically re-transmitted once connectivity is re-established.
