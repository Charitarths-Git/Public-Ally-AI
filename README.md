<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Public-Ally%20AI&fontSize=80&fontAlignY=35&animation=twinkling&fontColor=fff" />

<div style="background-color: #060b14; margin-top: -30px; padding: 40px 0;">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&repeat=true&width=800&height=120&lines=AI-Powered+Voice+Assistant+for+Citizens;Bridging+Government+Services+with+AI;Empowering+Public+Access+Through+Voice" alt="Typing SVG" />
  </a>
</div>

<h3>🛠️ Tech Stack</h3>
<p align="center">
  <img src="https://img.shields.io/badge/Django-5.1.0-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/Next.js-16.1.1-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/VAPI-AI-FF6B6B?style=for-the-badge&logo=ai&logoColor=white" alt="VAPI" />
  <img src="https://img.shields.io/badge/Gemini-2.5-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
</p>

<hr />
<h3>🚀 Project Links</h3>
<p align="center">
  <a href="https://github.com/Charitarths-Git/Public-Ally-AI"><b>GitHub Repository</b></a> •
  <a href="https://drive.google.com/file/d/1ZVUwnB5UE8Nv0b406zvQyzalklAOD9Y8/view?usp=drivesdk"><b>Documentation</b></a> •
  <a href="https://drive.google.com/file/d/1oTjmFBBuKeb98eHA6RqLybZRMYRj4Cie/view?usp=sharing"><b>Installation Guide</b></a>
</p>

<!-- Animated Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

</div>

## 🌟 Overview

**Public-Ally-AI** is a revolutionary AI-powered voice assistant platform designed to bridge the gap between citizens and government services.  
It enables seamless voice interactions, providing instant access to government schemes, databases, and human experts through natural language conversations.

<div align="center">

<img src="ddddgif.gif" width="45%" />
<img src="dedgif.gif" width="45%" />

</div>


<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 🎯 Problem Statement

Millions of Indian citizens face significant barriers when trying to access government services:

- **Low Digital Literacy** — Many citizens lack the skills to navigate digital platforms or smartphone apps.
- **Language Barriers** — Government services often don't support regional languages, excluding millions.
- **Overloaded Helplines** — Traditional call centers can't handle the volume of citizen queries efficiently.
- **Fragmented Systems** — Citizens must navigate multiple disconnected systems to access different services.

Public-Ally-AI addresses these challenges by providing a unified, voice-first AI platform accessible to all citizens, regardless of literacy level, language, or device.

## 🎯 Features

### 🚀 Core Capabilities

<details open>
<summary><b>🎤 Voice Interaction</b></summary>

- Multilingual voice conversations in Indian languages  
- Real-time transcription with context awareness  
- Customizable voice profiles (Indian accent support)

</details>

<details open>
<summary><b>🧠 AI Agent Intelligence</b></summary>

- Configurable AI agents with custom roles and behavior  
- RAG-based knowledge retrieval from documents  
- Multi-model AI setup for conversation and reasoning

</details>

<details open>
<summary><b>📊 Data & Knowledge Access</b></summary>

- Connect CSV, Excel, Google Sheets, and databases  
- Fuzzy search for citizen records and queries  
- AI-generated summaries and insights

</details>

<details open>
<summary><b>📞 Call Handling</b></summary>

- Automated inbound and outbound calling  
- Call history, transcripts, and session tracking  
- Webhook-based call analytics

</details>

<details open>
<summary><b>👨‍💼 Human Escalation</b></summary>

- Seamless transfer to human experts  
- Smart escalation based on query complexity  
- Expert management via dashboard

</details>

<details open>
<summary><b>🎨 Admin Dashboard</b></summary>

- Fast, modern Next.js dashboard  
- Real-time monitoring and controls  
- Responsive design with dark mode

</details>

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>


## 🏗️ Architecture
<div align="center">

<img src="Architecture.png" alt="Public-Ally-AI Architecture" width="90%"/>

</div>


## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 (React 18.3.1)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4 + Tailwind Animate
- **UI Components**: Radix UI (Accordion, Dialog, Dropdown, etc.)
- **State Management**: React Context API
- **HTTP Client**: Axios 1.13.2
- **Data Parsing**: PapaParse 5.5.3
- **Charts**: Recharts 2.15.2
- **Icons**: Lucide React 0.487.0

### Backend
- **Framework**: Django 5.1.0
- **API**: Django REST Framework 3.15.2
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Django ORM + psycopg2-binary 2.9.9
- **CORS**: django-cors-headers 4.4.0
- **Environment**: python-dotenv 1.0.1
- **Production Server**: Gunicorn 23.0.0
- **Static Files**: WhiteNoise 6.7.0

### AI & ML
- **LLM**: Google Gemini 2.5 Flash (langchain-google-genai 4.1.2)
- **Conversation**: OpenAI GPT-4.1 Nano (via VAPI)
- **Transcription**: Gemini 2.0 Flash / Deepgram Nova-3
- **Voice**: VAPI Voice Platform (Neha voice)
- **Search**: RapidFuzz 3.9.4 (fuzzy matching)

### Data Processing
- **Spreadsheets**: Pandas 2.2.2, OpenPyXL 3.1.5
- **Google Sheets**: gspread 6.1.2, oauth2client 4.1.3
- **Supabase**: supabase SDK 2.12.0+

### DevOps
- **Containerization**: Docker + Docker Compose
- **Cloud**: AWS Lambda (serverless functions)
- **Version Control**: Git
- **Package Management**: npm (frontend), pip (backend)

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 📊 Project Structure

```
Public-Ally-AI/
├── 📁 backend/                    # Django Backend
│   ├── 📁 api/                    # Main API Application
│   │   ├── 📄 models.py          # Database Models
│   │   ├── 📄 views.py           # API Views & Endpoints
│   │   ├── 📄 vapi_service.py    # VAPI Integration
│   │   ├── 📄 serializers.py     # DRF Serializers
│   │   ├── 📄 utils.py           # Utility Functions
│   │   └── 📄 structured_output.py # LLM Output Schemas
│   ├── 📁 lokmitra_backend/       # Django Settings Package
│   │   ├── 📄 settings.py        # Configuration
│   │   ├── 📄 urls.py            # URL Routing
│   │   └── 📄 wsgi.py            # WSGI Config
│   ├── 📁 aws_lambda/             # AWS Lambda Functions
│   ├── 📁 history/                # Call Transcripts
│   ├── 📄 manage.py              # Django CLI
│   ├── 📄 requirements.txt       # Python Dependencies
│   ├── 📄 Dockerfile             # Backend Container
│   └── 📄 .env                   # Environment Variables (not committed)
│
├── 📁 frontend/                   # Next.js Frontend
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js App Router
│   │   │   ├── 📄 layout.tsx    # Root Layout
│   │   │   └── 📄 page.tsx      # Home Page
│   │   ├── 📁 components/        # React Components
│   │   │   ├── 📄 LoginPage.tsx
│   │   │   ├── 📄 Dashboard.tsx
│   │   │   ├── 📄 HomePage.tsx
│   │   │   ├── 📄 DatabasesPage.tsx
│   │   │   ├── 📄 HistoryPage.tsx
│   │   │   ├── 📄 KnowledgePage.tsx
│   │   │   ├── 📄 AgentConfigPage.tsx
│   │   │   └── 📁 ui/           # Radix UI Components
│   │   ├── 📁 contexts/          # React Contexts
│   │   │   └── 📄 SessionContext.tsx
│   │   ├── 📁 lib/               # Utilities
│   │   │   └── 📄 utils.ts
│   │   ├── 📁 styles/            # Global Styles
│   │   │   └── 📄 globals.css
│   │   └── 📁 types/             # TypeScript Types
│   ├── 📄 package.json           # Node Dependencies
│   ├── 📄 tsconfig.json          # TypeScript Config
│   ├── 📄 tailwind.config.ts     # Tailwind Config
│   ├── 📄 next.config.ts         # Next.js Config
│   ├── 📄 Dockerfile             # Frontend Container
│   └── 📄 .env.local             # Environment Variables (not committed)
│
├── 📁 eKYC/                       # E-KYC Verification Module
│   ├── 📄 app.py                 # Flask App
│   └── 📄 ekyc.py               # KYC Logic
│
├── 📁 Scripts/                    # Utility Scripts
│
├── 📁 Research Data/              # Documentation & Research
│
├── 📄 docker-compose.yaml         # Docker Orchestration
├── 📄 .gitignore                 # Git Ignore Rules
└── 📄 README.md                  # This File
```

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker & Docker Compose (optional, for containerized setup)
- A Supabase account (for PostgreSQL database)
- VAPI account (for voice AI)
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Charitarths-Git/Public-Ally-AI.git
cd Public-Ally-AI
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Docker Setup (Alternative)

```bash
docker-compose up --build
```

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 🔐 Environment Configuration

### Backend (`backend/.env`)

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# Supabase Database
SUPABASE_DB_HOST=your-supabase-host
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-db-password
SUPABASE_DB_PORT=5432

# Supabase SDK
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# VAPI (Voice AI)
VAPI_API_KEY=your-vapi-key
PHONE_NUMBER_ID=your-vapi-phone-id

# Google APIs
GEMINI_API_KEY=your-gemini-key
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Deployment
DEPLOYED_URL=https://your-backend-url.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Note:** Never commit `.env` files to version control. All secrets must be provided via environment variables in production.

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 🚀 Usage

### Running Locally

**Backend:**
```bash
cd backend
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:8000`.

### Key Workflows

1. **Login** — Select your organization type (Government Body, Political Party, Company, or Organization).
2. **Configure AI Agent** — Set the agent name, description, and upload knowledge documents.
3. **Connect Databases** — Upload CSV/Excel files or connect Supabase/Google Sheets for real-time data.
4. **Start Calling** — Initiate outbound campaigns or activate inbound agent handling.
5. **Monitor & Escalate** — Track call history, transcripts, and escalate to human experts when needed.

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 🔌 API Endpoints

### 📞 Call Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/start-outbound-calling/` | Initiate outbound call |
| `POST` | `/api/start-inbound-agent/` | Activate inbound agent |
| `POST` | `/api/stop-calling/` | Stop active calling session |
| `GET` | `/api/get-session-status/` | Get current session status |
| `POST` | `/api/vapi-webhook/` | VAPI webhook handler |

### 📚 Knowledge Base

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload-document/` | Upload knowledge document |
| `GET` | `/api/get-documents/` | List all documents |
| `DELETE` | `/api/delete-document/<file_id>/` | Delete document |

### 🗄️ Database Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/connect-database/` | Upload CSV/Excel database |
| `POST` | `/api/connect-supabase/` | Connect Supabase database |
| `POST` | `/api/connect-google-sheet/` | Connect Google Sheet |
| `GET` | `/api/get-connected-databases/` | List all databases |
| `DELETE` | `/api/delete-database/` | Delete database |
| `POST` | `/api/execute-db-query/` | Execute database query |

### 👥 Human Experts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/add-human-expert/` | Add expert for escalation |
| `GET` | `/api/get-human-experts/` | List all experts |
| `DELETE` | `/api/remove-human-expert/<id>/` | Remove expert |

### ⚙️ Agent Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/get-agent-config/` | Get agent configuration |
| `POST` | `/api/update-agent-config/` | Update agent settings |
| `POST` | `/api/update-tool-settings/` | Update tool enablement |

### 📊 Call History

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/get-call-history/` | Retrieve call history |
| `GET` | `/api/call-history/` | List call records (DRF) |

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 👥 Team

This project was built as a group project.

| Name | GitHub |
|------|--------|
| Charitarths-Git | [@Charitarths-Git](https://github.com/Charitarths-Git) |
| Karandeep Singh | [@karancoderg](https://github.com/karancoderg) |
| Kartavya Mahesh Suryawanshi | [@Kartavya728](https://github.com/Kartavya728) |
| Blackcoat123 | [@Blackcoat123](https://github.com/Blackcoat123) |
| Noor | — |

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 📈 Repository Stats

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/Charitarths-Git/Public-Ally-AI?style=for-the-badge&logo=github)
![GitHub stars](https://img.shields.io/github/stars/Charitarths-Git/Public-Ally-AI?style=for-the-badge&logo=github)
![GitHub forks](https://img.shields.io/github/forks/Charitarths-Git/Public-Ally-AI?style=for-the-badge&logo=github)
![GitHub issues](https://img.shields.io/github/issues/Charitarths-Git/Public-Ally-AI?style=for-the-badge&logo=github)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Charitarths-Git/Public-Ally-AI?style=for-the-badge&logo=github)
![GitHub contributors](https://img.shields.io/github/contributors/Charitarths-Git/Public-Ally-AI?style=for-the-badge&logo=github)
![GitHub last commit](https://img.shields.io/github/last-commit/Charitarths-Git/Public-Ally-AI?style=for-the-badge&logo=github)

</div>

<div align="center">
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
</div>

## 🔒 Security Notes

- All API keys and secrets must be provided via environment variables — never commit `.env` files.
- The Django `SECRET_KEY` default fallback in `settings.py` must be replaced with a strong, unique key before production deployment.
- CORS origins are configured in `backend/lokmitra_backend/settings.py` — update for your deployment URLs.

## 📄 License

This project is a group academic/hackathon project. Licensing terms are to be determined by the team.

---

<!-- Animated Footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" />

</div>
