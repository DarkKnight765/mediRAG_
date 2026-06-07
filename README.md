<div align="center">
  
# 🏥 MediRAG

**AI-Powered Healthcare Workflow & Triage Assistant**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](#)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](#)

[Live Demo](https://medirag-frontend.onrender.com) · [Backend API](https://medirag-backend-lrek.onrender.com)

---

![Home screen](./Images/Home-new.png)

</div>

## ✨ Overview

MediRAG is a comprehensive healthcare workflow application designed for patient-facing AI assistance, structured health planning, medical document review, and appointment intake. The platform features a dynamic dark clinical theme and securely integrates traditional and social authentication methods.

It uniquely features **Runtime Model Switching**:
- 🧠 **Gemini Mode**: Google Gemini processing for high-tier intelligence.
- ⚡ **Groq Mode**: Ultra-fast open-source LLMs via the Groq API.
- 🔒 **Local Mode**: Secure, deterministic local mock responses for offline development.

## 🚀 Live Deployment

The project is fully containerized and hosted in production:
- 🌐 **Frontend Application**: [Live on Render](https://medirag-frontend.onrender.com)
- ⚙️ **Backend API Service**: [Live on Render](https://medirag-backend-lrek.onrender.com)

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, React Router, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL (hosted on Supabase)
- **Auth**: Google OAuth 2.0, Secure JWT Sessions
- **AI Models**: Google Gemini, Groq, local fallbacks
- **Hosting**: Render

## 🌟 Key Features

### 🔐 Secure Authentication & Profiles
- Seamless **Google OAuth** integration for instant patient sign-ins.
- Traditional Email/Password registration with secure JWT state management.

### 📄 AI Image & Document Review
- Upload complex X-ray images or PDF medical documents.
- Instantly receive structured findings with confidence metrics and next clinical steps.

### 🥗 Personalized Health Plans
- Dynamic forms capturing age, metrics, dietary restrictions, and sleep concerns.
- Server-side compliance guardrails actively prevent incompatible food suggestions (e.g., suggesting dairy to lactose-intolerant patients).

### 📅 Clinical Appointment Booking
- Intuitive booking flow selecting clinicians and visit types.
- Directly captures reasons, symptoms, and history into the persistent PostgreSQL database.

### 💬 Mental Health Support Chat
- Real-time chat interface featuring auto-scrolling and intelligent context retention.
- Powered by the chosen AI model at runtime.

## 🏗️ Architecture

```mermaid
flowchart LR
  U[Patient / User] --> F[React Frontend]
  F --> B[Express Node.js Backend]
  
  B --> M{Runtime Model Switch}
  M --> G[Gemini API]
  M --> Q[Groq Llama API]
  M --> L[Local Mock Server]
  
  B --> Auth[Google OAuth Provider]
  B --> DB[(Supabase PostgreSQL)]
```

## ⚙️ Local Development

### Environment Setup

Create `backend/.env`:
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

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### Running the App

**1. Start the Backend & Database**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**2. Start the Frontend**
```bash
cd frontend
npm install
npm start
```
Open `http://localhost:3000` in your browser.

---

*Note: This project is a portfolio piece demonstrating healthcare workflow architecture. It does not replace clinical judgment, emergency care, or licensed medical advice.*
