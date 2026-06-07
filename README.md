# MediRAG

MediRAG is a healthcare workflow app for patient-facing AI assistance, structured health planning, image/document review, appointment intake, and behavioral support. 

## Live Deployment

The project is actively deployed and hosted on Render:
- **Frontend**: [https://medirag-frontend.onrender.com](https://medirag-frontend.onrender.com)
- **Backend API**: [https://medirag-backend-lrek.onrender.com](https://medirag-backend-lrek.onrender.com)

## Overview

The platform is split into a React frontend and Node.js backend with runtime model switching:

- `auto` mode prefers local model access when available
- `mock` mode forces deterministic local responses for development and CI
- `gemini` mode uses Google Gemini when quota and billing are available
- `groq` mode uses ultra-fast open-source models via the Groq API

The application features full user authentication via **Google OAuth** and securely stores data in a **PostgreSQL** database hosted on Supabase, managed via Prisma ORM.

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

## Architecture

```mermaid
flowchart LR
  U[User] --> F[React Frontend]
  F --> B[Express Backend]
  B --> M[Runtime model switch]
  M --> G[Gemini API]
  M --> Q[Groq API]
  M --> L[Local mock model]
  B --> Auth[Google OAuth]
  B --> DB[(Supabase PostgreSQL)]
```

## Tech Stack

| Layer           | Technologies                                     |
| --------------- | ------------------------------------------------ |
| Frontend        | React, TypeScript, React Router, Tailwind CSS    |
| Backend         | Node.js, Express, Prisma ORM                     |
| Database        | PostgreSQL (Supabase)                            |
| Authentication  | Google OAuth 2.0, JWT                            |
| AI Models       | Gemini, Groq (Llama), local mock server          |
| File processing | Multer, pdf-img-convert                          |
| Hosting         | Render                                           |

## Key Features

### Authentication & Profiles
- Secure Sign-in with Google OAuth
- Traditional Email/Password registration
- Secure JWT-based session management

### Image and Document Review
- Upload X-ray images or PDFs
- Receive structured findings with confidence and next steps
- Works in Gemini mode or local mock mode for development

### Health Plans
- Collect age, weight, height, activity level, dietary restrictions, and sleep concerns
- Generate diet and sleep guidance
- Server-side restriction guardrails prevent incompatible food suggestions from being returned

### Appointment Booking
- Book a medical appointment with clinician and visit type selection
- Capture reason, symptoms, and medical history
- Saved directly to the PostgreSQL database

### Mental Health Support
- Chat-based support with runtime mode control
- Auto-scroll to newest response
- Uses the same visual language as the rest of the app

## Environment Variables

Create `backend/.env` with values like:

```env
DATABASE_URL="postgresql://postgres.[YOUR-ID]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[YOUR-ID]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

JWT_SECRET="your-secure-jwt-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"

GEMINI_API_KEY="your-gemini-key"
GROQ_API_KEY="your-groq-key"

CORS_ORIGIN="http://localhost:3000"
PORT=3001
```

Create `frontend/.env` with:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

## Run Locally

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Open the app at `http://localhost:3000`.

## Current Status

- **Fully Deployed**: Hosted successfully on Render.
- **Persistent Data**: Integrated PostgreSQL database via Supabase.
- **Auth Integrated**: Google Sign-In and standard authentication workflows are complete.
- **AI Models**: Support for Gemini and ultra-fast Groq APIs added.

## Future Improvements

- Expand role-based access control for patients, clinicians, and administrators.
- Add more automated tests around model routing, compliance guardrails, and form validation.
- Add real-time chat functionality for clinician-patient communication.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit and push.
5. Open a pull request.

## Notes

This project is for healthcare workflow assistance and triage support. It does not replace clinical judgment, emergency care, or licensed medical advice.
