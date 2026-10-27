# AdaptIQ — Database Architecture & PostgreSQL Full-Stack Integration Report

## 1. System Architecture Overview

```
                      +------------------------------------------+
                      |         React 18 SPA (Vite Client)       |
                      |   - ClassroomHub (Roster CSV/XLSX Preview|
                      |   - PracticeMode & TestMode (Shortcuts)  |
                      |   - AnalyticsHub (CSV/XLSX Export)       |
                      |   - Centralized Axios Client (api.js)    |
                      +--------------------+---------------------+
                                           | REST API (Bearer JWT / Session)
                                           v
                      +------------------------------------------+
                      |       Node.js / Express Backend          |
                      |  - RequestId Middleware (X-Request-ID)   |
                      |  - PinLimiter (5 req/min Rate Limiting)  |
                      |  - Role & Classroom Owner Authorization  |
                      |  - Layered Architecture (Routes/Services)|
                      +----+--------------------------------+----+
                           |                                |
               Prisma ORM (v6.4.1)                  Mongoose (Legacy Fallback)
                           |                                |
                           v                                v
              +--------------------------+        +-------------------+
              |    PostgreSQL 16 Engine  |        |    MongoDB Atlas  |
              | - 15 Normalized Models   |        | (Optional Fallback|
              | - UUID v4 Primary Keys   |        |  for Dev Clusters)|
              | - Versioned Migrations   |        +-------------------+
              | - UTC ISO Timestamps     |
              +--------------------------+
```

---

## 2. Normalized Relational Schema (15 Entities)

The PostgreSQL database is authored in [server/prisma/schema.prisma](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/server/prisma/schema.prisma) and version-controlled in [server/prisma/migrations/20261027000000_init/migration.sql](file:///c:/Users/Surya%20Rao/Desktop/Sem3/adaptive-quiz-tool/server/prisma/migrations/20261027000000_init/migration.sql):

1. **User**: Authentication account for teachers, admins, and students (`id`, `name`, `email`, `passwordHash`, `role`, timestamps).
2. **Classroom**: Teacher-owned educational space (`id`, `name`, `section`, `grade`, `subject`, `joinCode`, `teacherId`).
3. **Student**: Learner profile (`id`, `userId`, `rollNumber`, `grade`, `currentDifficulty`, `bktState`).
4. **Enrollment**: Many-to-many relationship between `Student` and `Classroom` with a strict `UNIQUE(studentId, classroomId)` constraint.
5. **StudentCredential**: PIN authentication record with bcrypt slow hash, `failedAttempts` tracking, and `lockedUntil` lockout threshold.
6. **Question**: Base assessment item with curriculum metadata (`subject`, `domain`, `topic`, `difficulty`, `correctAnswerIndex`).
7. **QuestionVersion**: Immutable historical snapshot (`version`, `questionText`, `options`, `explanation`) linked to answer events.
8. **Assessment**: Pre-test, post-test, quiz, or exam container (`type`, `status`, `timeLimitMinutes`, `passingScorePercentage`).
9. **AssessmentItem**: Ordered join model binding questions and versions to an assessment.
10. **Attempt**: Learner assessment session (`mode`, `status`, `score`, `maxScore`, `scorePercentage`, `startedAt`, `submittedAt`).
11. **AnswerEvent**: Granular, idempotent response record (`idempotencyKey`, `eventId`, `selectedOptionIndex`, `isCorrect`, `timeSpentSeconds`, `confidence`).
12. **GradebookEntry**: Authoritative learner gradebook record with `scorePercentage`, `letterGrade`, `masteryStatus`, and normalized gain.
13. **QuestionStatistic**: Empirical psychometric telemetry ($p$-value, sample size $N$, failure rate, Rasch $b_i$ logit difficulty).
14. **SyncEvent**: Offline classroom gateway sync journal (`batchId`, `entityType`, `status`, `errorDetails`).
15. **AuditLog**: Immutable security log tracking PIN resets, roster imports, and grade modifications (`actorId`, `action`, `details`).

---

## 3. Database Operations & Management Runbook

### 3.1 Local PostgreSQL with Docker Compose
To launch the isolated PostgreSQL development container:
```bash
docker compose up -d
```
Verify container health:
```bash
docker compose ps
```
The database runs on `127.0.0.1:5432` with database `adaptiq_dev` and persistent volume `adaptiq_postgres_data`.

### 3.2 Prisma Migrations
To apply pending version-controlled migrations:
```bash
cd server
npx prisma migrate deploy
```
To generate a new migration during development:
```bash
npx prisma migrate dev --name <migration_name>
```

### 3.3 Database Seeding
To populate the database with realistic fictional test classrooms, students, credentials, and curriculum questions:
```bash
cd server
npm run db:seed
# or: node scripts/seedPostgres.js
```

### 3.4 MongoDB to PostgreSQL Data Migration
To transfer legacy records from MongoDB to the normalized PostgreSQL database:
```bash
cd server
npm run db:migrate-mongo
# or: node scripts/migrateFromMongo.js
```

### 3.5 Database Backup & Restore
To generate an encrypted/safe PostgreSQL dump:
```bash
cd server
npm run db:backup
# or: node scripts/backupDb.js
```
To restore from a backup file:
```bash
cd server
npm run db:restore -- --file=backups/adaptiq_backup_YYYY-MM-DD.sql
```

---

## 4. API Endpoints Catalog

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Multi-database healthcheck (PostgreSQL + MongoDB status) | Public |
| `POST` | `/api/auth/pin-login` | Classroom-scoped 4-digit student PIN login with lockout | Public (Rate-limited: 5/min) |
| `POST` | `/api/auth/login` | Standard email/password authentication | Public (Rate-limited) |
| `POST` | `/api/classes/:id/roster/preview` | Preview CSV/XLSX roster before committing (validation & dupes) | Teacher / Admin |
| `POST` | `/api/classes/:id/roster/commit` | Transactionally commit roster & generate desk cards | Teacher / Admin |
| `POST` | `/api/classes/:id/students/:studentId/reset-pin` | Reset student PIN and generate replacement desk card | Teacher / Admin |
| `DELETE` | `/api/classes/:id/students/:studentId` | Soft-remove or unenroll student from classroom | Teacher / Admin |
| `POST` | `/api/assessments/attempts/start` | Start or resume an assessment attempt | Student |
| `POST` | `/api/assessments/attempts/:id/answers` | Idempotently record an answer event | Student (Owner) |
| `POST` | `/api/assessments/attempts/:id/submit` | Finalize attempt, compute authoritative score & gradebook | Student (Owner) |
| `GET` | `/api/progress/export/gradebook?format=xlsx` | Download binary XLSX Gradebook with normalized gain | Teacher / Admin |
| `GET` | `/api/progress/export/gradebook?format=csv` | Download CSV Gradebook with formula injection protection | Teacher / Admin |
| `GET` | `/api/analytics/questions` | Empirical pass rates, Rasch difficulty, and anomaly alerts | Teacher / Admin |
| `POST` | `/api/gateway/reconcile` | Batch idempotent sync for offline gateway nodes | Gateway / Admin |
