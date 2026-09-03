# 📁 MediRAG — Complete Codebase File Guide

> A file-by-file explanation of the entire project. Use this as your interview walkthrough and reference.

---

## 📂 Root-Level Files

### [README.md](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/README.md)
**Purpose:** Project documentation — the public face of the repository.  
**Key contents:** One-liner pitch, live deployment links (Render), full tech stack table, Mermaid architecture diagram, ML pipeline descriptions with accuracy metrics (45% triage, 93.9% health plan, 96.37% CNN), and local setup instructions.

### [docker-compose.yml](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/docker-compose.yml)
**Purpose:** Multi-container Docker orchestration for the entire stack.  
**Services defined (6):**

| Service | Role | Port |
|---------|------|------|
| `frontend` | React app (Dockerfile in `./frontend`) | 3000 |
| `backend` | Express API (Dockerfile in `./backend`) | 3001 (internal) |
| `nginx` | Reverse proxy — routes `/` → frontend, `/api` → backend | 8080 |
| `mock-model` | Local mock AI server for offline dev | 8000 |
| `postgres` | PostgreSQL 15 database | 5432 |
| `pgbouncer` | Connection pooling proxy for Postgres | 6432 |

**Why this matters:** Shows you understand containerization, reverse proxying, and connection pooling — all production-ready patterns.

### [nginx.conf](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/nginx.conf)
**Purpose:** Nginx reverse proxy configuration.  
**What it does:** Listens on port 80. Routes all requests starting with `/api` to `backend:3001`, and everything else to `frontend:3000`. Uses HTTP/1.1 with WebSocket upgrade headers for future real-time support.

### [diagram.mmd](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/diagram.mmd) / [diagram2.mmd](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/diagram2.mmd)
**Purpose:** Mermaid diagram source files for architecture visualization.

### [.gitignore](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/.gitignore)
**Purpose:** Standard exclusions — `node_modules/`, `.env`, build artifacts, Python `__pycache__`, etc.

---

## 📂 Backend — Entry Points

### [backend/server.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/server.js)
**Purpose:** The application's entry point — the file Node.js actually runs.  
**What it does:**
1. Imports the configured Express `app` from `src/app.js`
2. Starts the **appointment reminder cron job** (`reminderService`)
3. Listens on the configured port (default 3001)

**Key pattern:** Separates app configuration from server startup — this is a testability best practice so you can import `app` in tests without starting the HTTP listener.

### [backend/src/app.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/app.js)
**Purpose:** Express application configuration.  
**What it does:**
1. Creates the Express instance
2. Enables CORS (cross-origin requests from the React frontend)
3. Sets JSON body limit to 1MB (for image base64 payloads)
4. Mounts all routes under the `/api` prefix

### [backend/package.json](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/package.json)
**Purpose:** Backend dependency manifest and scripts.  
**Key dependencies (and why):**

| Package | Why |
|---------|-----|
| `@google/generative-ai` | Gemini SDK for multimodal AI |
| `groq-sdk` | Groq API for fast LLM inference |
| `@prisma/client` | Database ORM |
| `bcryptjs` | Password hashing (10 salt rounds) |
| `jsonwebtoken` | JWT session management |
| `multer` | File upload handling (X-rays, PDFs) |
| `nodemailer` | SMTP email for appointment confirmations |
| `node-cron` | Scheduled appointment reminders |
| `google-auth-library` | Google OAuth token verification |
| `axios` | HTTP client for mock server + external APIs |
| `canvas` / `pdf-img-convert` | PDF → image conversion for X-ray analysis |

**Key scripts:** `npm start` → production, `npm run mock-model` → starts local AI mock server.

### [backend/Dockerfile](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/Dockerfile)
**Purpose:** Docker image definition for the backend. Installs deps and starts the server.

### [backend/mock_model_server.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/mock_model_server.js)
**Purpose:** A standalone Express server (port 8000) that simulates all AI model responses locally.  
**Why it exists:** Allows full offline development without API keys. Provides deterministic responses for image analysis, health plans, mental health chat, and symptom triage — every AI endpoint has a mock equivalent.  
**Endpoints:** `/generate` (general AI), `/chat` (mental health), `/health-plan`, `/triage`.

### [backend/AI_README.md](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/AI_README.md)
**Purpose:** Documentation for the AI integration architecture — model switching, provider setup, and fallback behavior.

### [backend/DB_README.md](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/DB_README.md)
**Purpose:** Documentation for the database schema, migrations, and Prisma workflow.

---

## 📂 Backend — Config Layer (`src/config/`)

### [config/env.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/config/env.js)
**Purpose:** Centralized environment variable management — the single source of truth for all config.  
**Key details:**
- Loads `.env` from the backend root using `dotenv`
- **Gemini key** supports both `GEMINI_API_KEY` env var AND `GEMINI_API_KEY_FILE` (for Kubernetes/Docker secrets)
- All API keys (Gemini, Groq, SMTP, Twilio, Google Places, Fast2SMS) default to `null` — the app gracefully degrades when any service is missing
- CORS origins are parsed as a comma-separated list
- `requireEnv()` utility throws descriptive errors for truly mandatory vars

### [config/runtime.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/config/runtime.js)
**Purpose:** The runtime model switching state machine — the heart of the multi-model architecture.  
**Three exported functions:**
- `setMode(m)` — Validates and sets the active mode. Returns `true`/`false` for valid/invalid values.
- `getMode()` — Returns current mode: `"auto"` | `"mock"` | `"gemini"` | `"groq"`
- `getLocalModelUrl()` — Returns the mock server URL, or `null` if mode is `gemini`/`groq`

**Default:** `auto` (or from `RUNTIME_MODEL_MODE` env var).  
**Why this is important:** The mode is stored in a module-level `let` variable — this means it's **process-scoped** and can be changed at runtime without a restart via the API.

### [config/db.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/config/db.js)
**Purpose:** Singleton Prisma client instance. Initializes with `DATABASE_URL` from env. All controllers import this single instance.

### [config/gemini.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/config/gemini.js)
**Purpose:** Lazy initialization of the Google Gemini client.  
**Key pattern:** Only creates the `GoogleGenerativeAI` instance if `GEMINI_API_KEY` is present. Wrapped in try/catch so the app boots even if the SDK fails to load. Exports `null` when unavailable — all consumers check for `null` before calling.

### [config/groq.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/config/groq.js)
**Purpose:** Identical pattern to `gemini.js` but for the Groq SDK. Lazy init, null-safe, fail-tolerant.

---

## 📂 Backend — Middleware (`src/middlewares/`)

### [middlewares/authMiddleware.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/middlewares/authMiddleware.js)
**Purpose:** JWT authentication guard for protected routes.  
**How it works:**
1. Extracts the `Bearer <token>` from the `Authorization` header
2. Verifies the JWT using `env.jwtSecret`
3. Attaches `{ id, email }` to `req.user` for downstream controllers
4. Returns `401` with specific messages for missing tokens, expired tokens, and invalid tokens

**Where it's used:** Applied globally to all protected routes in the route index (`/api/user/*`, `/api/appointments/*`, `/api/chat/*`, etc.)

### [middlewares/uploadMiddleware.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/middlewares/uploadMiddleware.js)
**Purpose:** File upload configuration using Multer.  
**Key details:**
- Storage: Disk-based in `backend/uploads/` directory (auto-created if missing)
- Filename: Timestamp + original extension (prevents collisions)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`
- Max file size: **10 MB**

---

## 📂 Backend — Routes (`src/routes/`)

### [routes/index.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/index.js)
**Purpose:** Central route registry — maps URL prefixes to controllers.  
**Route structure:**

| Prefix | Auth Required | Route File |
|--------|:---:|------------|
| `/api/auth/*` | ❌ | `authRoutes.js` |
| `/api/test` | ❌ | `testRoutes.js` |
| `/api/model/*` | ❌ | `modelRoutes.js` |
| `/api/doctors/*` | ❌ | `doctorDiscoveryRoutes.js` |
| `/api/user/*` | ✅ | `userRoutes.js` |
| `/api/chat` | ✅ | `chatRoutes.js` |
| `/api/health-plan` | ✅ | `healthPlanRoutes.js` |
| `/api/analyze-image` | ✅ | `imageAnalysisRoutes.js` |
| `/api/appointments/*` | ✅ | `appointmentRoutes.js` |
| `/api/slots/*` | ✅ | `slotRoutes.js` |
| `/api/symptoms/analyze` | ✅ | Inline (symptomAnalysisController) |

### Individual Route Files

Each file in this directory is a thin Express Router that maps HTTP methods to controller functions:

- [authRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/authRoutes.js) — `POST /signup`, `POST /login`, `POST /google`, `GET /me`
- [appointmentRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/appointmentRoutes.js) — Full CRUD: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id/cancel`, `DELETE /:id`, `GET /:id/ics`
- [chatRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/chatRoutes.js) — `POST /chat`
- [healthPlanRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/healthPlanRoutes.js) — `POST /health-plan`
- [imageAnalysisRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/imageAnalysisRoutes.js) — `POST /analyze-image` (with multer upload middleware)
- [modelRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/modelRoutes.js) — `GET /health`, `GET /mode`, `POST /mode`
- [doctorDiscoveryRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/doctorDiscoveryRoutes.js) — `GET /search`, `GET /:placeId`
- [slotRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/slotRoutes.js) — `GET /available`
- [userRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/userRoutes.js) — `GET /profile`
- [testRoutes.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/routes/testRoutes.js) — `GET /test` (smoke test)

---

## 📂 Backend — Controllers (`src/controllers/`)

### [controllers/authController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/authController.js)
**Purpose:** All authentication logic — signup, login, Google OAuth, and session management.  
**Key functions:**
- **`signup`** — Validates email/password, checks for existing user, hashes password with `bcrypt` (10 rounds), creates user in DB, returns JWT (7-day expiry).
- **`login`** — Finds user by email, special-cases Google-only accounts (no password), compares bcrypt hash, returns JWT.
- **`googleLogin`** — Receives Google ID token from frontend → verifies via `google-auth-library` → if user exists by `googleId`, updates avatar/name; if email matches an existing password user, **links** the Google account; if brand new, creates user. All paths converge to the same JWT response.
- **`getMe`** — Returns the current authenticated user's profile.

**Why this is interview-worthy:** The Google OAuth flow handles 3 distinct cases (existing Google user, existing email user linking, brand new user) in a single endpoint.

### [controllers/healthPlanController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/healthPlanController.js)
**Purpose:** Generates personalized health plans using a 3-tier strategy.  
**Processing pipeline:**
1. Receives patient data: age, weight, height, activity level, dietary restrictions, sleep issues
2. **Tier 1 — ML Model:** Tries the trained scikit-learn health plan recommender first (93.9% accuracy)
3. **Tier 2 — LLM:** If ML fails, constructs a detailed prompt and calls `aiService.generateHealthPlan()`
4. **Tier 3 — Hardcoded Fallback:** Returns a sensible default plan if all else fails
5. **Post-processing:** ALL outputs pass through `sanitizeHealthPlanForRestrictions()` — the compliance guardrail

**`sanitizeHealthPlanForRestrictions()` — THE INTERVIEW STAR:**
- Parses dietary restriction strings to detect `vegan`/`vegetarian`
- Defines banned regex patterns: `/chicken/i`, `/salmon/i`, `/beef/i`, `/yogurt/i`, `/milk/i`, etc.
- Deep-clones the plan and replaces violating items with safe alternatives
- Works independently of AI model output — **defense-in-depth**

**`extractJsonObject()`** — Robust JSON parser that handles LLM quirks: strips markdown code fences, finds JSON substring boundaries.

**`saveHealthPlanToDB()`** — Persists every generated plan with the engine that produced it (ML/LLM/Fallback) for auditing.

### [controllers/imageAnalysisController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/imageAnalysisController.js)
**Purpose:** Handles X-ray and medical document uploads.  
**Processing pipeline:**
1. Validates file presence
2. If PDF → converts to PNG using `imageService.convertPdfToImage()`, then deletes the original PDF
3. If not PDF and not a valid image format → rejects with 400
4. Calls `aiService.analyzeImageWithAI(imagePath)` for AI analysis
5. Parses the raw AI text through `responseParser.parseAIResponse()` to extract structured fields
6. Cleans up the uploaded file from disk
7. Returns both structured fields and raw AI analysis

### [controllers/chatController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/chatController.js)
**Purpose:** Mental health support chat endpoint.  
**How it works:**
1. Receives user message from request body
2. Adds it to the in-memory conversation history (`conversationState`)
3. Calls `aiService.chatWithAssistant()` with the full history
4. Adds the AI reply to conversation history
5. **Trims history to last 11 messages** (keeps system prompt + last 10) — prevents token overflow

### [controllers/symptomAnalysisController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/symptomAnalysisController.js)
**Purpose:** NLP-based symptom triage — predicts the appropriate medical specialty.  
**Two-tier strategy:**
1. **Tier 1 — Local ML Model:** Calls `triageSymptoms()` which runs the trained TF-IDF + Logistic Regression model. Returns confidence scores, alternative specialties, and urgency levels.
2. **Tier 2 — LLM Fallback:** If ML model is unavailable, constructs a detailed prompt asking the LLM to return structured JSON with specialty, confidence, reasoning, alternatives, and urgency.
3. Tags every response with the `engine` field so the frontend knows which model produced the result.

### [controllers/appointmentController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/appointmentController.js)
**Purpose:** Full CRUD for clinical appointments.  
**Key functions:**
- **`listAppointments`** — Returns all appointments for the authenticated user, ordered by date descending
- **`getAppointment`** — Fetches a single appointment with ownership verification
- **`createAppointment`** — Validates 9 required fields, creates in DB with status `SCHEDULED`, then fires off **3 async notifications** (email, SMS, WhatsApp) using fire-and-forget pattern (`.catch(console.error)`)
- **`updateAppointment`** — Whitelist-based field update (only allows specific safe fields), validates status against `VALID_STATUSES` enum
- **`cancelAppointment`** — Sets status to `CANCELLED` with idempotency check
- **`deleteAppointment`** — Hard delete with ownership verification
- **`getAppointmentICS`** — Generates a downloadable `.ics` calendar file with proper VCALENDAR/VEVENT format

**Status workflow:** `SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED` (or `CANCELLED` at any point)

### [controllers/doctorDiscoveryController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/doctorDiscoveryController.js)
**Purpose:** Location-based doctor/clinic search with dual API strategy.  
**Two search backends:**
1. **Google Places API** (if `GOOGLE_PLACES_API_KEY` is set) — Geocodes the location, then searches for doctors/hospitals within 10km radius. Returns name, address, rating, photos, distance.
2. **OpenStreetMap Fallback** (free, no key needed) — Uses Nominatim for geocoding + Overpass API for querying healthcare facilities tagged in OSM. If Overpass returns nothing, generates curated sample doctors.

**`calculateDistance()`** — Haversine formula for great-circle distance between two lat/lng coordinates.  
**`generateSampleDoctors()`** — Creates realistic mock doctor profiles for locations with no OSM data.

### [controllers/modelController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/modelController.js)
**Purpose:** Runtime model management API.
- **`health`** — Returns the status of all 3 AI backends (local model: `ok`/`unreachable`/`not-configured`; gemini: `ok`/`not-configured`; groq: `ok`/`not-configured`), plus the current mode and available modes.
- **`setMode`** — Changes the runtime AI mode without server restart.
- **`getMode`** — Returns the current mode.

### [controllers/slotController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/slotController.js)
**Purpose:** Appointment time slot availability engine.  
**How it works:**
1. Generates all 30-minute slots from 9:00 AM to 5:00 PM (16 slots total)
2. Queries the DB for already-booked non-cancelled appointments for the given doctor and date
3. Marks each slot as `available: true/false` based on conflicts
4. Formats times to 12-hour display format

### [controllers/userController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/userController.js)
**Purpose:** User profile data aggregation. Returns the user's profile with their appointments, health plans, and last 5 conversations — all in a single query using Prisma's relational includes.

### [controllers/testController.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/controllers/testController.js)
**Purpose:** Smoke test endpoint. Calls `aiService.testAssistant()` with "What is the capital of France?" to verify the AI pipeline is working end-to-end.

---

## 📂 Backend — Services (`src/services/`)

### [services/aiService.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/services/aiService.js)
**Purpose:** ⭐ THE CORE FILE — Central AI routing and orchestration layer (553 lines).  
**This is the file that implements the Runtime Model Switching architecture.**

**Exported functions:**

| Function | Purpose |
|----------|---------|
| `analyzeImageWithAI(imagePath)` | Multimodal X-ray/image analysis |
| `generateHealthPlan(prompt)` | Text-based health plan generation |
| `chatWithAssistant(history)` | Multi-turn mental health chat |
| `testAssistant()` | Simple smoke test ("capital of France?") |

**Cascade fallback pattern (for each function):**
```
Mode Check → Groq (if groq/auto) → Local Mock Server → Gemini → Hardcoded Fallback
```

**Key implementation details:**
- **`fileToGenerativePart()`** — Converts local image files to Gemini's `inlineData` format (base64 + MIME type)
- **`callGroq(prompt, system)`** — Wraps the Groq SDK chat completion API. Returns `null` on failure (never throws).
- **`callGroqChat(history, system)`** — Multi-turn variant that maps conversation history to Groq's message format, converting `"model"` role to `"assistant"`.
- **`doPostWithRetry(axios, url, data, retries=3, backoff=200)`** — HTTP POST with **exponential backoff**: 200ms → 400ms → 800ms retry delays. 5-second timeout per attempt.
- **`buildFallbackHealthPlan()`** — Returns a sensible default health plan (oatmeal breakfast, salmon dinner, 10:30 PM bedtime) when all providers fail.

**Image analysis specifics:**
- Gemini gets the **actual image** as base64 inline data (true multimodal)
- Groq gets only the **filename** (text-only — it cannot process images)
- Mock server gets a text prompt

### [services/conversationService.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/services/conversationService.js)
**Purpose:** Database persistence for conversations and messages.
- `createConversation(title)` — Creates a new conversation record
- `addMessage(conversationId, role, content)` — Appends a message
- `attachModelOutput(messageId, engine, raw)` — Links an AI model's raw response to a specific message for auditing

### [services/healthPlanRecommender.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/services/healthPlanRecommender.js)
**Purpose:** Node.js ↔ Python bridge for the ML health plan model.  
**How it works:**
1. Locates the Python predict script at `ml/health_plan_recommender/predict.py`
2. Finds the Python executable (checks `PYTHON_EXECUTABLE` env var → `.venv/Scripts/python.exe` → `python`)
3. Runs the script as a **synchronous child process** (`spawnSync`) with the patient profile as JSON on stdin
4. Parses the stdout JSON response
5. Returns `null` if the script doesn't exist, errors, or produces invalid JSON
6. **15-second timeout** to prevent hanging

### [services/symptomTriageRecommender.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/services/symptomTriageRecommender.js)
**Purpose:** Node.js ↔ Python bridge for the symptom triage NLP model. Identical architecture to `healthPlanRecommender.js` but calls `ml/symptom_triage/predict.py`.

### [services/imageService.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/services/imageService.js)
**Purpose:** Image processing utilities.
- `convertPdfToImage(pdfPath)` — Converts a PDF's first page to PNG using `pdf-img-convert`. Dynamically requires the library (fails gracefully if `canvas` native module isn't installed).
- `getImageDataUrl(imagePath)` — Reads an image from disk and returns a base64 data URL.

### [services/reminderService.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/services/reminderService.js)
**Purpose:** Cron-based appointment reminder system.  
**How it works:**
- Runs **every hour** (`0 * * * *` cron expression)
- Queries for all `CONFIRMED` appointments where `reminderSent` is `false`
- For each appointment that falls within 24 hours from now:
  - Sends SMS reminder via Fast2SMS
  - Sends email reminder via nodemailer
  - Sets `reminderSent: true` to prevent duplicate notifications

---

## 📂 Backend — Utilities (`src/utils/`)

### [utils/conversationState.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/utils/conversationState.js)
**Purpose:** In-memory chat session state for the mental health feature.
- Maintains a `conversationHistory` array with a system prompt as the first message
- `addMessage(msg)` — Pushes to history
- `trimHistory(limit)` — Keeps the system prompt (index 0) and the last `limit-1` messages, discarding the middle. This is a sliding window that prevents token overflow.

**Note:** This is server-scoped (not per-user) — a known limitation mentioned in the interview prep.

### [utils/responseParser.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/utils/responseParser.js)
**Purpose:** Parses free-text AI responses into structured diagnosis objects.  
**Extracts:** `primaryDiagnosis`, `confidenceLevel` (as integer), `additionalFindings` (as array), `recommendedActions`. Uses line-by-line string matching with case-insensitive lookups. Provides sensible defaults when fields are missing.

### [utils/sendAppointmentEmail.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/utils/sendAppointmentEmail.js)
**Purpose:** Sends styled HTML appointment confirmation emails via SMTP (nodemailer).  
**Key details:**
- Uses a dark-themed HTML email template matching the app's aesthetic
- Includes a table with appointment ID, doctor, specialty, date, time, location, status
- **Attaches an `.ics` calendar file** so patients can add the appointment to their calendar with one click
- Fails silently if SMTP is not configured — never blocks the booking flow

### [utils/sendSMS.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/utils/sendSMS.js)
**Purpose:** Sends appointment SMS confirmations via Fast2SMS API (India-focused).
- Strips `+91` country code prefix if present
- Constructs a concise confirmation message with doctor name, date, time, and appointment ID
- Fails silently — never blocks the booking

### [utils/sendWhatsApp.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/src/utils/sendWhatsApp.js)
**Purpose:** Sends WhatsApp appointment confirmations via Twilio.
- Dynamically requires the `twilio` package (only when needed)
- Formats a rich WhatsApp message with bold markdown and emojis
- Handles Indian phone number formatting (prepends `+91` if missing)
- Fails silently — never blocks the booking

---

## 📂 Backend — Database (`prisma/`)

### [prisma/schema.prisma](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/prisma/schema.prisma)
**Purpose:** The database schema definition — 5 models with their relationships.

**Models:**

| Model | Key Fields | Relationships |
|-------|--------|---------------|
| **User** | id, email (unique), password?, googleId? (unique), avatar?, name | → Conversations[], Appointments[], HealthPlans[] |
| **Conversation** | id, title?, userId? | → User, → Messages[] |
| **Message** | id, conversationId, role, content | → Conversation, → ModelOutput? |
| **ModelOutput** | id, messageId (unique), engine, raw | → Message (1:1) |
| **Appointment** | id, userId, patientName, email, phone, doctor, specialty, appointmentType, date, time, reasonForVisit, symptoms?, medicalHistory?, status, location?, address?, lat?, lng?, consultationFee?, consultationMode, reminderSent24h, reminderSent1h | → User |
| **HealthPlan** | id, userId, input, result, engine | → User |

**Key design decisions:**
- `User.password` is **nullable** — supports Google-only accounts
- `User.googleId` is **nullable + unique** — allows linking and prevents duplicate Google accounts
- `ModelOutput.messageId` is **unique** — enforces 1:1 with Message (each message has at most one AI output)
- `ModelOutput.engine` tracks which AI provider generated the response (audit trail)
- `Appointment.status` uses String instead of enum (SQLite compatibility) with application-layer validation

### [prisma/dev.db](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/prisma/dev.db)
**Purpose:** Local SQLite development database (used during dev before Supabase PostgreSQL).

---

## 📂 Backend — Machine Learning (`ml/`)

### [ml/run_all_training.py](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/run_all_training.py)
**Purpose:** Master training script that orchestrates all ML pipeline training. Runs both the symptom triage and health plan recommender training in sequence.

### [ml/evaluation_report.md](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/evaluation_report.md)
**Purpose:** Formal ML evaluation documentation with classification reports and confusion matrices for both models.

---

### Symptom Triage Pipeline (`ml/symptom_triage/`)

### [symptom_triage/training_data.csv](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/symptom_triage/training_data.csv)
**Purpose:** Labeled training dataset — symptom descriptions mapped to 15 medical specialties (Cardiology, Neurology, Pediatrics, Orthopedics, etc.).

### [symptom_triage/train.py](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/symptom_triage/train.py)
**Purpose:** Training script for the symptom triage NLP model.  
**Pipeline:** CSV → text preprocessing → TF-IDF Vectorization → Logistic Regression (multinomial) → `joblib` serialization.  
**Evaluation:** Generates classification reports and confusion matrices, saved to `artifacts/`.

### [symptom_triage/predict.py](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/symptom_triage/predict.py)
**Purpose:** Inference script called by Node.js via `spawnSync`.  
**How it works:**
1. Reads JSON from stdin: `{ "symptoms": "chest pain and shortness of breath" }`
2. Loads the trained `joblib` model from `artifacts/`
3. Runs TF-IDF transform + prediction
4. Outputs JSON to stdout with: `recommendedSpecialty`, `confidence`, `alternativeSpecialties` (top 3), `urgencyLevel`, `reasoning`

### [symptom_triage/requirements.txt](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/symptom_triage/requirements.txt)
**Purpose:** Python dependencies: `scikit-learn`, `pandas`, `numpy`.

### Symptom Triage Artifacts (`symptom_triage/artifacts/`)
- **`symptom_triage_model.joblib`** — The serialized trained model (TF-IDF vectorizer + classifier pipeline)
- **`symptom_triage_model.metadata.json`** — Model metadata: accuracy (45%), F1 (0.45), class labels, training date
- **`symptom_triage_classification_report.txt`** — Per-class precision/recall/F1 scores
- **`symptom_triage_confusion_matrix.csv`** — Full confusion matrix

---

### Health Plan Recommender Pipeline (`ml/health_plan_recommender/`)

### [health_plan_recommender/training_data.csv](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/health_plan_recommender/training_data.csv)
**Purpose:** Labeled training dataset — patient profiles (age, weight, height, activity, restrictions, sleep issues) mapped to plan categories.

### [health_plan_recommender/train.py](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/health_plan_recommender/train.py)
**Purpose:** Training script for the health plan recommender.  
**Pipeline:** CSV → feature encoding → Logistic Regression → 5-fold stratified cross-validation → `joblib` serialization.  
**Performance:** 93.9% accuracy, 0.94 weighted F1.

### [health_plan_recommender/predict.py](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/health_plan_recommender/predict.py)
**Purpose:** Inference script called by Node.js.  
**How it works:**
1. Reads JSON from stdin with patient profile
2. Loads the trained model + `plan_templates.json`
3. Predicts the best plan category
4. Returns the full structured plan (diet + sleep) from the template

### [health_plan_recommender/plan_templates.json](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/health_plan_recommender/plan_templates.json)
**Purpose:** Predefined health plan templates for each category the ML model can predict. Each template includes caloric intake, macronutrient percentages, meal plans (breakfast/lunch/dinner with times and items), and sleep routines.

### Health Plan Artifacts (`health_plan_recommender/artifacts/`)
- **`health_plan_model.joblib`** — The serialized trained model
- **`health_plan_model.metadata.json`** — Metadata: accuracy (93.9%), F1 (0.94), training date
- **`health_plan_classification_report.txt`** — Per-class metrics
- **`health_plan_confusion_matrix.csv`** — Full confusion matrix

---

### X-Ray Vision Pipeline (`ml/xray_vision/`)

### [xray_vision/train_xray_model_colab.ipynb](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/ml/xray_vision/train_xray_model_colab.ipynb)
**Purpose:** Jupyter notebook for training the CNN X-ray classifier on Google Colab (cloud GPU).  
**Architecture:** ResNet18 (transfer learning from ImageNet).  
**Dataset:** MedMNIST (PneumoniaMNIST) — binary classification: Normal vs. Pneumonia.  
**Result:** 96.37% validation accuracy. Weights exported for future integration into the backend.

---

## 📂 Backend — Tests (`test/`)

### [test/run_ai_integration_test.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/test/run_ai_integration_test.js)
**Purpose:** Integration test that verifies the full AI pipeline (calls actual AI services).

### [test/test_analyze_image.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/test/test_analyze_image.js)
**Purpose:** Targeted test for the image analysis endpoint.

### [test/unit/aiService.unit.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/test/unit/aiService.unit.js)
**Purpose:** Unit tests for `aiService.js` — tests the cascade fallback logic and model switching.

### [backend/test_api.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/backend/test_api.js)
**Purpose:** Quick standalone API test script.

---

## 📂 Frontend — Entry Points

### [frontend/package.json](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/package.json)
**Purpose:** Frontend dependency manifest. React 18 + TypeScript + Tailwind CSS + React Router + Axios + Google OAuth.

### [frontend/tsconfig.json](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/tsconfig.json)
**Purpose:** TypeScript configuration for the React app.

### [frontend/tailwind.config.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/tailwind.config.js)
**Purpose:** Tailwind CSS configuration — custom theme extensions for the dark clinical design.

### [frontend/postcss.config.js](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/postcss.config.js)
**Purpose:** PostCSS configuration for Tailwind processing.

### [frontend/Dockerfile](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/Dockerfile)
**Purpose:** Docker image for the React frontend build.

### [frontend/public/index.html](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/public/index.html)
**Purpose:** HTML shell with meta tags, favicon, and root div for React mounting.

---

## 📂 Frontend — Source (`src/`)

### [src/index.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/index.tsx)
**Purpose:** React entry point — renders the `App` component into the DOM root.

### [src/App.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/App.tsx)
**Purpose:** ⭐ Root application component — defines the entire routing structure.  
**Architecture:**
- Wraps everything in `GoogleOAuthProvider` (for Google Sign-In)
- Wraps in `AuthProvider` (for JWT session context)
- Wraps in `SiteLayout` (for persistent navbar/footer)
- Defines **7 public routes** and **6 protected routes** (wrapped in `ProtectedRoute`)

**Route map:**

| Path | Component | Auth |
|------|-----------|:----:|
| `/` | `HomePage` | ❌ |
| `/services` | `ServicesPage` | ❌ |
| `/about` | `AboutPage` | ❌ |
| `/contact` | `ContactPage` | ❌ |
| `/privacy` | `PrivacyPolicy` | ❌ |
| `/login` | `LoginPage` | ❌ |
| `/signup` | `SignupPage` | ❌ |
| `/xray-diagnosis` | `XrayDiagnosis` | ✅ |
| `/health-plans` | `HealthPlans` | ✅ |
| `/appointments` | `AppointmentScheduling` | ✅ |
| `/doctors/:placeId` | `DoctorProfile` | ✅ |
| `/mental-health` | `MentalHealthSupport` | ✅ |
| `/profile` | `ProfilePage` | ✅ |

### [src/App.css](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/App.css)
**Purpose:** Global app-level CSS overrides.

### [src/index.css](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/index.css)
**Purpose:** Global CSS foundation — Tailwind base imports, custom scrollbar styles, dark theme defaults.

### [src/styles/animations.css](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/styles/animations.css)
**Purpose:** Custom CSS keyframe animations for UI transitions and micro-interactions.

---

## 📂 Frontend — API Layer (`src/api/`)

### [api/config.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/api/config.ts)
**Purpose:** Axios configuration — the central HTTP client setup.  
**Key details:**
- Sets base URL from `REACT_APP_API_URL` env var (default: `http://localhost:3001/api`)
- **Request interceptor:** Auto-attaches JWT from `localStorage` as `Bearer` token on every outgoing request
- **Response interceptor:** On 401 responses, clears the stored token and redirects to `/login` (but only if not already on login/signup page — prevents redirect loops)

### [api/appointmentApi.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/api/appointmentApi.ts)
**Purpose:** Typed API functions for appointment CRUD — `fetchAppointments()`, `createAppointment()`, `cancelAppointment()`, `deleteAppointment()`.

### [api/doctorApi.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/api/doctorApi.ts)
**Purpose:** API functions for doctor discovery — `searchDoctors()`, `getDoctorDetails()`.

---

## 📂 Frontend — Components (`src/components/`)

### [components/AuthContext.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/AuthContext.tsx)
**Purpose:** React Context for global authentication state.  
**Provides:** `user`, `token`, `login()`, `logout()`, `isAuthenticated` to the entire component tree.  
**Persists:** Token in `localStorage` under `medirag_token` key.

### [components/ProtectedRoute.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/ProtectedRoute.tsx)
**Purpose:** Route guard component. Checks `isAuthenticated` from AuthContext — if not authenticated, redirects to `/login`.

### [components/SiteLayout.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/SiteLayout.tsx)
**Purpose:** Persistent layout wrapper (~26KB) — contains the **navigation bar** (with responsive mobile menu) and **footer**. Wraps all page content.

### [components/HomePage.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/HomePage.tsx)
**Purpose:** Landing page with hero section, feature cards, and call-to-action buttons. Showcases all platform capabilities.

### [components/LoginPage.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/LoginPage.tsx)
**Purpose:** Login form with email/password fields AND Google Sign-In button. Handles both auth flows and redirects to home on success.

### [components/SignupPage.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/SignupPage.tsx)
**Purpose:** Registration form with name, email, password fields plus Google Sign-In. Includes client-side validation (password length, email format).

### [components/XrayDiagnosis.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/XrayDiagnosis.tsx)
**Purpose:** X-ray/medical document upload and analysis UI. File upload with drag-and-drop, preview, upload progress, and structured results display (diagnosis, confidence meter, findings, recommended actions).

### [components/HealthPlans.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/HealthPlans.tsx)
**Purpose:** Dynamic form for generating personalized health plans. Captures age, weight, height, activity level, dietary restrictions (dropdown), and sleep issues. Displays the AI/ML-generated plan with diet breakdown and sleep routine.

### [components/AppointmentScheduling.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/AppointmentScheduling.tsx)
**Purpose:** The most complex frontend component (~28KB). Multi-step appointment booking flow:
1. Doctor search by location + specialty
2. Doctor selection with profile cards
3. Date/time slot selection (shows availability)
4. Patient details form (name, email, phone, symptoms, medical history)
5. Confirmation view with calendar download (.ics)

Also includes appointment management (list, cancel, delete existing appointments).

### [components/MentalHealthSupport.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/MentalHealthSupport.tsx)
**Purpose:** Real-time chat interface for mental health support. Features auto-scrolling, message bubbles, typing indicators, and context-aware conversation retention. Sends messages to the backend chat API.

### [components/ProfilePage.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/ProfilePage.tsx)
**Purpose:** The largest component (~34KB). Comprehensive user dashboard showing:
- Profile information (avatar, name, email, join date)
- Appointment history with status badges and actions
- Health plan history
- Recent conversations
- Settings and preferences

### [components/DoctorProfile.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/DoctorProfile.tsx)
**Purpose:** Detailed doctor/clinic profile page. Shows name, specialty, rating, reviews, opening hours, map location, and a "Book Appointment" button.

### [components/ServicesPage.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/ServicesPage.tsx)
**Purpose:** Services overview page with cards for each feature (X-ray Analysis, Health Plans, Mental Health, Appointments). Each card links to the corresponding protected route.

### [components/AboutPage.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/AboutPage.tsx)
**Purpose:** About page with project description, team info, and mission statement.

### [components/ContactPage.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/ContactPage.tsx)
**Purpose:** Contact form with name, email, subject, and message fields.

### [components/PrivacyPolicy.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/PrivacyPolicy.tsx)
**Purpose:** Privacy policy page.

### [components/ui/formTheme.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/components/ui/formTheme.ts)
**Purpose:** Shared form styling constants — consistent input styles, button styles, and card styles used across all form components.

---

## 📂 Frontend — Routes (`src/routes/`)

These files define typed route paths for type-safe navigation:

- [appointmentRoutes.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/routes/appointmentRoutes.ts) — Appointment-related route definitions
- [diagnosisRoutes.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/routes/diagnosisRoutes.ts) — X-ray diagnosis route definitions
- [healthPlanRoutes.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/routes/healthPlanRoutes.ts) — Health plan route definitions
- [mentalHealthRoutes.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/routes/mentalHealthRoutes.ts) — Mental health route definitions

---

## 📂 Frontend — Supporting Files

| File | Purpose |
|------|---------|
| [src/cors.d.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/cors.d.ts) | TypeScript type declarations for the CORS module |
| [src/server.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/server.ts) | SSR/proxy server configuration (if used) |
| [src/react-app-env.d.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/react-app-env.d.ts) | Create React App type references |
| [src/reportWebVitals.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/reportWebVitals.ts) | Web Vitals performance monitoring setup |
| [src/setupTests.ts](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/setupTests.ts) | Jest test setup (imports `@testing-library/jest-dom`) |
| [src/App.test.tsx](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/App.test.tsx) | Basic smoke test for the App component |
| [src/logo.svg](file:///d:/PROJECTS%20__%20DEV/medirag/medirag/frontend/src/logo.svg) | SVG logo asset |

---

## 📊 File Count Summary

| Layer | Files | Lines (approx) |
|-------|:-----:|:----------:|
| Root config (docker, nginx, etc.) | 6 | ~120 |
| Backend config | 5 | ~130 |
| Backend middlewares | 2 | ~75 |
| Backend routes | 11 | ~200 |
| Backend controllers | 11 | ~1,250 |
| Backend services | 6 | ~800 |
| Backend utilities | 5 | ~340 |
| Prisma schema | 1 | 92 |
| ML pipelines (Python) | 7 | ~600+ |
| ML artifacts | 8 | N/A (binary + reports) |
| Backend tests | 4 | ~100 |
| Frontend components | 16 | ~3,500+ |
| Frontend API/config | 3 | ~90 |
| Frontend routes | 4 | ~40 |
| Frontend supporting | 9 | ~100 |
| **Total** | **~98 files** | **~7,500+ lines** |
