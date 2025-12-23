# 🚀 Quick Start: Supabase Integration

## ⚡ 3-Minute Setup

### 1️⃣ Get Supabase Credentials (2 min)
Visit: https://supabase.com/dashboard → Your Project → Settings

**Copy these 5 values:**
- Project URL: `https://xxx.supabase.co`
- Anon Key: `eyJhbGc...`
- DB Host: Settings → Database → Connection string → Extract host
- DB Password: Your project password
- DB Port: `5432` (default)

### 2️⃣ Update .env File (30 sec)
```bash
cd backend
# Edit .env file and paste your Supabase values
```

### 3️⃣ Run SQL Schema (30 sec)
1. Supabase Dashboard → SQL Editor
2. Copy all from `backend/supabase_schema.sql`
3. Paste → Run

### 4️⃣ Install & Migrate (1 min)
```bash
pip install psycopg2-binary
python manage.py migrate
```

### 5️⃣ Start & Test ✅
```bash
python manage.py runserver
# In new terminal:
python manage.py start_calling_simulation
```

**Done! Check http://localhost:5173 for data!** 🎉

---

## 📝 Quick Reference

### .env Template
```env
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_KEY=YOUR-ANON-KEY
SUPABASE_DB_HOST=db.YOUR-PROJECT.supabase.co
SUPABASE_DB_PASSWORD=YOUR-PASSWORD
```

### Verify Connection
```bash
python manage.py check
```

### View Data
**Supabase:** Dashboard → Table Editor → `api_callhistory`  
**Frontend:** http://localhost:5173 → Call History section

---

**Full guide:** `SUPABASE-SETUP.md`
