# 🚀 Deploying AdaptIQ to Vercel (Full-Stack Setup)

This repository is pre-configured for a **unified full-stack deployment on Vercel**:
* **Frontend:** Vite + React Single Page Application served via Vercel Edge CDN.
* **Backend:** Express.js API executed as a Vercel Serverless Function under `/api/*`.
* **Domain:** Both frontend and backend share the exact same domain (zero CORS configuration required).

---

## 📋 Cloud Database (MongoDB Atlas) Status: ✅ Connected & Seeded

Your MongoDB Atlas cluster is **already connected and populated** with:
- **150+ Approved Questions** across Mathematics and Science (Easy, Medium, Hard).
- **Demo Accounts** for both Students and Teachers.
- **Demo Class:** Grade 7-B Mathematics (`MATH7B`).

---

## ⚡ Step 1: Seed Curriculum & Accounts to Your Cloud Database

Run this single command from your local terminal to load all curriculum questions (Math & Science) and demo accounts into your Atlas database:

### On Windows PowerShell:
```powershell
cd server
$env:MONGODB_URI="your-mongodb-atlas-connection-string"
node scripts/seedQuestions.js
```

### On macOS / Linux:
```bash
cd server
MONGODB_URI="your-mongodb-atlas-connection-string" node scripts/seedQuestions.js
```

You will see:
```text
[Seed Script] Connected. Populating question bank and demo accounts...
[Database Seeder] Loaded 150+ curriculum questions (all approved).
[Database Seeder] Created demo student: Roll Number "STUDENT01", PIN: 1234
[Database Seeder] Created demo teacher: ID "TEACHER01", Password: admin123
[Seed Script] Database seeding completed successfully!
```

---

## 🌐 Step 2: Deploy to Vercel

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: configure full-stack Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
3. Click **Add New...** → **Project**.
4. Select your repository and click **Import**.
5. Leave the default settings:
   * **Framework Preset:** Vite
   * **Root Directory:** `./`
   * **Build Command:** `npm run build`
   * **Output Directory:** `client/dist`
6. Expand **Environment Variables** and add the following:

   | Variable Name | Value | Required |
   | :--- | :--- | :--- |
   | `MONGODB_URI` | `mongodb+srv://suryasampathrao_db_user:Adaptiq2026@cluster0.p7ntivh.mongodb.net/adaptiq_db?retryWrites=true&w=majority` | **Yes** |
   | `JWT_SECRET` | `super_secret_school_jwt_key_change_in_production_987654321` | **Yes** |
   | `NODE_ENV` | `production` | **Yes** |
   | `VITE_WEB3FORMS_ACCESS_KEY` | `7f2f2260-0ea7-4671-9dd6-99793dfa416e` *(or your key)* | **Yes** (For Support/Feedback Forms) |
   | `WEB3FORMS_ACCESS_KEY` | `7f2f2260-0ea7-4671-9dd6-99793dfa416e` *(or your key)* | Optional (Server proxy) |
   | `AI_PROVIDER` | `gemini` | Optional |
   | `AI_API_KEY` | *(Your Google Gemini API Key for AI Tutor)* | Optional |
   | `AI_MODEL` | `gemini-1.5-flash` | Optional |

7. Click **Deploy**.

---

## ✅ Step 3: Verification

Once Vercel finishes building (usually 45-60 seconds):

1. **Health Check:** Open `https://your-project.vercel.app/api/health` in your browser. You should see:
   ```json
   {
     "status": "OK",
     "database": "connected_mongo_fallback",
     "message": "AdaptIQ Adaptive Quiz & Assessment Engine API is running."
   }
   ```
2. **Web App:** Open `https://your-project.vercel.app`.
3. **Sign In:**
   * **Student Demo:** Roll Number `STUDENT01` | PIN `1234`
   * **Teacher Demo:** ID `TEACHER01` | Password `admin123`

---

## 📁 Files Configured in This Repository

* [`vercel.json`](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/vercel.json): Configures unified URL routing (`/api/*` to Serverless Function, `/*` to Vite React SPA).
* [`api/index.js`](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/api/index.js): Vercel Serverless Function entrypoint wrapping the Express app with persistent database connection caching.
* [`package.json`](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/package.json): Root build and postinstall orchestration scripts for seamless Vercel build pipeline.
* [`server/config/db.js`](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/server/config/db.js): Optimized for serverless connection pooling and cold-start resistance.
