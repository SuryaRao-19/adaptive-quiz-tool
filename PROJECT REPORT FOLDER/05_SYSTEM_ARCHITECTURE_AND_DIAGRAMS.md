# 🏛️ AdaptIQ — System Architecture & Design Diagrams

This document contains the structural, behavioral, and data-flow diagrams of the AdaptIQ platform formatted using standard Mermaid diagrams.

---

## 1. High-Level Multi-Tier System Architecture

```mermaid
flowchart TD
    subgraph Client["React 18 (Vite) Frontend SPA"]
        UI["Web UI Components (Tailwind CSS + Framer Motion)"]
        SSEClient["SSE Stream Reader (ReadableStream + AbortController)"]
        AuthCtx["AuthContext (JWT Session)"]
        ThemeCtx["ThemeContext (Dark/Light)"]
    end

    subgraph Gateway["AdaptIQ Backend API (Express.js on Node.js)"]
        Router["Express Router (/api/ai, /api/auth, /api/quiz)"]
        RateLimiter["aiRateLimiter (Sliding-Window IP Throttling)"]
        TestGuard["Academic Integrity Guard (TestMode Lock)"]
        Classifier["Deterministic Zero-Overhead Intent Classifier"]
        ModelRouter["Intelligent Model Router (AUTO / MANUAL)"]
        CircuitBreaker["Provider Circuit Breaker & Health Monitor"]
        FallbackEngine["Pre-Stream Fallback Cascade Engine"]
        SSEHandler["SSE Protocol Handler (15s :ping Heartbeats)"]
    end

    subgraph Providers["Multi-Model Generative AI Adapters"]
        Gemini["Google Gemini 3.8 Flash (@google/genai SDK v2.32)"]
        OpenAI["OpenAI GPT-4o Mini (Fetch SSE)"]
        Anthropic["Claude 3.5 Haiku (Fetch SSE)"]
        Ollama["Local Ollama Daemon (REST NDJSON)"]
    end

    subgraph DataLayer["Authoritative Dual-Database Layer"]
        Postgres[("PostgreSQL 16 via Prisma ORM\n(Users, Attempts, Questions, Gradebooks)")]
        Mongo[("MongoDB Atlas via Mongoose\n(Socratic Chat Messages, Fallback Cache)")]
    end

    UI -->|"POST /api/ai/chat/stream"| Router
    Router --> RateLimiter
    RateLimiter --> TestGuard
    TestGuard --> Classifier
    Classifier --> ModelRouter
    ModelRouter --> CircuitBreaker
    CircuitBreaker --> FallbackEngine
    FallbackEngine -->|"Primary"| Gemini
    FallbackEngine -.->|"On 503/429 Fallback"| OpenAI
    FallbackEngine -.->|"Secondary Fallback"| Anthropic
    FallbackEngine -.->|"Local Fallback"| Ollama

    Gemini -->|"Token Stream Chunks"| SSEHandler
    SSEHandler -->|"event: chunk\ndata: {chunk: '...'}"| SSEClient
    SSEClient --> UI

    Router <-->|"Authoritative ACID Records"| Postgres
    Router <-->|"Hybrid Fallback & History"| Mongo
```

---

## 2. Real-Time Server-Sent Events (SSE) Streaming Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser (React)
    participant ClientSSE as SSE Stream Reader
    participant Gateway as AdaptIQ AI Gateway
    participant Guard as TestMode Guard
    participant Router as Model Router
    participant Provider as Google Gemini 3.8 Flash
    participant DB as Hybrid DB (Postgres/Mongo)

    Student->>ClientSSE: Types question & clicks Send
    ClientSSE->>Gateway: POST /api/ai/chat/stream (JWT Bearer Token)
    Gateway->>Guard: Check for active post-test in last 60 mins
    Guard-->>Gateway: TestMode = false (Authorized)
    Gateway->>DB: Save user message in Conversation history
    Gateway->>Router: Classify intent & resolve optimal model
    Router-->>Gateway: Selected: gemini-3.8-flash (mode: auto)
    Gateway->>ClientSSE: HTTP 200 (Content-Type: text/event-stream)
    Gateway->>ClientSSE: event: metadata (routing_decision: gemini-3.8-flash)
    
    Gateway->>Provider: ai.models.generateContentStream(...)
    loop Stream Chunks (< 1000ms first token)
        Provider-->>Gateway: Yield text chunk
        Gateway->>ClientSSE: event: chunk (data: {chunk: "..."})
        ClientSSE->>Student: Real-time token rendering with blinking cursor
    end

    Note over Gateway,ClientSSE: Heartbeat (: ping\n\n) emitted every 15s to keep proxy alive

    Provider-->>Gateway: Stream completed (usageMetadata tokens)
    Gateway->>DB: Persist assistant response & token usage
    Gateway->>ClientSSE: event: metadata (usage, durationMs)
    Gateway->>ClientSSE: event: done (done: true)
    ClientSSE->>Student: Display completed message + latency badge
```

---

## 3. Assessment Lifecycle & Idempotency State Machine

```mermaid
stateDiagram-v2
    [*] --> PRE_TEST: Student Enrolls in Subject
    PRE_TEST --> DIAGNOSTIC_ANALYSIS: Complete 15 Questions
    DIAGNOSTIC_ANALYSIS --> PRACTICE_MODE: Tag Weak Topics (<60%)
    
    state PRACTICE_MODE {
        [*] --> ADAPTIVE_QUESTION: Fetch Question by BKT Mastery
        ADAPTIVE_QUESTION --> SUBMIT_ANSWER: Student Answers (Idempotency Key)
        SUBMIT_ANSWER --> EVALUATE_STREAK: Server Computes Score Authoritatively
        EVALUATE_STREAK --> PROMOTE: 3 Consecutive Correct
        EVALUATE_STREAK --> DEMOTE: 2 Consecutive Incorrect
        PROMOTE --> ADAPTIVE_QUESTION: Next Question (Harder)
        DEMOTE --> ADAPTIVE_QUESTION: Next Question (Basics)
    }

    PRACTICE_MODE --> POST_TEST: Unlock after 50 Questions Completed
    POST_TEST --> IMMUTABLE_SUBMITTED: Submit Official Exam
    IMMUTABLE_SUBMITTED --> GROWTH_REPORT: Compute Hake's Gain (g)
    GROWTH_REPORT --> [*]
```

---

## 4. Prisma PostgreSQL Entity-Relationship Model (ERD)

```mermaid
erDiagram
    USER ||--o{ CLASSROOM : teaches
    USER ||--o{ QUESTION : creates
    USER ||--o{ ASSESSMENT : creates
    USER ||--o{ AI_REQUEST : requests
    USER ||--o{ CONVERSATION : owns
    USER ||--o| STUDENT : profile

    CLASSROOM ||--o{ ENROLLMENT : contains
    CLASSROOM ||--o{ ASSESSMENT : assigns
    STUDENT ||--o{ ENROLLMENT : participates
    STUDENT ||--o{ ATTEMPT : submits
    STUDENT ||--o{ STUDENT_CREDENTIAL : has

    QUESTION ||--o{ QUESTION_VERSION : versions
    QUESTION ||--o{ ASSESSMENT_ITEM : includes
    QUESTION ||--o{ ANSWER_EVENT : records

    ASSESSMENT ||--o{ ASSESSMENT_ITEM : contains
    ASSESSMENT ||--o{ ATTEMPT : tracks

    CONVERSATION ||--o{ CONVERSATION_MESSAGE : contains
    CONVERSATION ||--o| CONVERSATION_SUMMARY : summarizes

    AI_REQUEST ||--o{ AI_GENERATED_CONTENT : generates
    AI_REQUEST ||--o{ AI_USAGE : tracks
```

