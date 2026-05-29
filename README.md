# MediRAG

MediRAG is a healthcare workflow app for patient-facing AI assistance, structured health planning, image/document review, appointment intake, and behavioral support. The current UI uses a dark clinical theme with shared form styling across all pages.

## Overview

The platform is split into a React frontend and Node.js backend with runtime model switching:

- `auto` mode prefers local model access when available
- `mock` mode forces deterministic local responses for development and CI
- `gemini` mode uses Google Gemini when quota and billing are available

The backend also exposes health and mode endpoints so the UI can show current model status and allow switching at runtime.

## Current UI

The current product pages are:

- Home
- Services
- Health Plans
- Appointment Booking
- Mental Health Support
- Image / X-ray Diagnosis
- About
- Contact

All input surfaces use a shared dark form system for consistency.

## Screenshots

### Home

![Home screen](./Images/Home-new.png)

### Health Plans

![Health plans screen](./Images/HealthPlans-new.png)

### Mental Health Support

![Mental health support screen](./Images/MentalHealth-new.png)

Other pages follow the same UI system and are available in the app, but only these three screenshots are shown here to keep the README concise.

## Architecture

```mermaid
flowchart LR
  U[User] --> F[React Frontend]
  F --> B[Express Backend]
  B --> M[Runtime model switch]
  M --> G[Gemini]
  M --> L[Local mock model]
  L --> O[Optional Ollama proxy]
  B --> DB[(PostgreSQL)]
```

## Tech Stack

| Layer           | Technologies                                     |
| --------------- | ------------------------------------------------ |
| Frontend        | React, TypeScript, React Router, Tailwind CSS    |
| Backend         | Node.js, Express                                 |
| AI              | Gemini, local mock server, optional Ollama proxy |
| File processing | Multer, pdf-img-convert                          |
| HTTP            | Axios                                            |
| UI icons        | Lucide React                                     |

## Key Features

### Image and document review

- Upload X-ray images or PDFs
- Receive structured findings with confidence and next steps
- Works in Gemini mode or local mock mode for development

### Health plans

- Collect age, weight, height, activity level, dietary restrictions, and sleep concerns
- Generate diet and sleep guidance
- Server-side restriction guardrails prevent incompatible food suggestions from being returned

### Appointment booking

- Book a medical appointment with clinician and visit type selection
- Capture reason, symptoms, and medical history
- Confirmation UI keeps the flow clear and consistent

### Mental health support

- Chat-based support with runtime mode control
- Auto-scroll to newest response
- Uses the same visual language as the rest of the app

## Environment Variables

Create `backend/.env` with values like:

```env
DATABASE_URL=postgres://medirag:medirag@localhost:5432/medirag
GEMINI_API_KEY=your_key_here
GEMINI_API_KEY_FILE=
LOCAL_MODEL_URL=http://localhost:8000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
MODEL_NAME=gemini-2.0-flash
PORT=3001
```

Notes:

- `GEMINI_API_KEY` is optional at startup, but required for Gemini mode to work.
- `LOCAL_MODEL_URL` points the backend to the local mock server.
- `OLLAMA_BASE_URL` and `OLLAMA_MODEL` are optional and let the mock server proxy to Ollama when available.

## Run Locally

### Backend

```bash
cd backend
npm install
npm run mock-model
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Open the app at `http://localhost:3000`.

### Full stack with Docker

```bash
docker-compose up --build
```

## API Routes

| Route                     | Method   | Purpose                        |
| ------------------------- | -------- | ------------------------------ |
| `/api/analyze-image`      | POST     | Analyze images or PDFs         |
| `/api/HealthPlans`        | POST     | Generate a health plan         |
| `/api/mental-health-chat` | POST     | Chat support                   |
| `/api/test`               | GET      | Backend connectivity check     |
| `/api/appointments`       | Various  | Appointment CRUD               |
| `/api/model/health`       | GET      | Model availability status      |
| `/api/model/mode`         | GET/POST | Read or set runtime model mode |

## Model Behavior

- Gemini is used when quota and billing allow it.
- Mock mode is the safest default for development and CI.
- Ollama can be used as the local model backend when configured.
- The health-plan controller applies a dietary restriction safety pass before returning results.

## Current Status

- The UI has been restyled with a shared dark healthcare theme.
- The backend supports runtime model switching and health checks.
- The README screenshots now match the current app pages.
- Health-plan responses are guarded against non-compliant food suggestions.

## Future Improvements

- Add a persistent database layer for appointments, user profiles, chat history, and health-plan records.
- Add user authentication so patients and clinicians can sign in securely and access the right workflow.
- Expand role-based access control for patients, clinicians, and administrators.
- Add more automated tests around model routing, compliance guardrails, and form validation.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit and push.
5. Open a pull request.

## Notes

This project is for healthcare workflow assistance and triage support. It does not replace clinical judgment, emergency care, or licensed medical advice.
