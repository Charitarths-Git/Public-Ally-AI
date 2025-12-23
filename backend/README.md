# LokMitra AI Backend

Django backend for LokMitra AI with Supabase integration.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# VAPI
VAPI_API_KEY=ab5825a3-963d-4e84-8964-8ef3e5dc62e0
VAPI_BASE_URL=https://api.vapi.ai
PHONE_NUMBER_ID=3ea911a0-32da-43e5-a0e2-86fc880a676c

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Start Server

```bash
python manage.py runserver
```

### 5. Start Background Task (in a separate terminal)

```bash
python manage.py start_calling_simulation
```

## API Endpoints

- `POST /api/start-calling/` - Start the calling agent
- `GET /api/call-history/` - Get all call history
- `POST /api/upload-document/` - Upload document (stub)
- `POST /api/connect-database/` - Connect database (stub)
- `POST /api/add-number/` - Add number to calling list (stub)

## Features

- ✅ Supabase database integration
- ✅ Call history tracking
- ✅ Simulated calls every 2 minutes
- ✅ VAPI integration
- ✅ CORS enabled for frontend
- ✅ RESTful API
