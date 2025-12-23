-- ============================================
-- LokMitra-AI Supabase Database Schema
-- ============================================
-- Instructions:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL code
-- 4. Click "Run" to create the tables
-- ============================================

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS api_callhistory CASCADE;
DROP TABLE IF EXISTS api_callingsession CASCADE;

-- ============================================
-- Table: api_callhistory
-- Stores all call records with details
-- ============================================
CREATE TABLE api_callhistory (
    id BIGSERIAL PRIMARY KEY,
    call_id VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    duration INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    summary TEXT,
    transcript TEXT,
    recording_url TEXT,
    assistant_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_call_history_call_id ON api_callhistory(call_id);
CREATE INDEX idx_call_history_status ON api_callhistory(status);
CREATE INDEX idx_call_history_created_at ON api_callhistory(created_at DESC);
CREATE INDEX idx_call_history_phone_number ON api_callhistory(phone_number);

-- Add constraint for status values
ALTER TABLE api_callhistory 
ADD CONSTRAINT check_status 
CHECK (status IN ('queued', 'ringing', 'in-progress', 'forwarding', 'ended', 'busy', 'no-answer', 'failed', 'canceled'));

-- ============================================
-- Table: api_callingsession
-- Tracks calling sessions
-- ============================================
CREATE TABLE api_callingsession (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    total_calls INTEGER NOT NULL DEFAULT 0,
    successful_calls INTEGER NOT NULL DEFAULT 0,
    failed_calls INTEGER NOT NULL DEFAULT 0
);

-- Create index for session queries
CREATE INDEX idx_calling_session_is_active ON api_callingsession(is_active);
CREATE INDEX idx_calling_session_started_at ON api_callingsession(started_at DESC);

-- ============================================
-- Trigger to auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_callhistory_updated_at
    BEFORE UPDATE ON api_callhistory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data

/*
INSERT INTO api_callhistory 
    (call_id, phone_number, customer_name, status, duration, summary, started_at, ended_at)
VALUES
    ('call_sample_001', '+919876543210', 'Rajesh Kumar', 'ended', 156, 
     'Citizen inquired about PM Kisan scheme eligibility. Provided information about required documents and application process.', 
     NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '156 seconds'),
    
    ('call_sample_002', '+919876543211', 'Priya Sharma', 'ended', 89, 
     'Query regarding Ayushman Bharat card application. Explained the registration procedure and benefits.', 
     NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '89 seconds'),
    
    ('call_sample_003', '+919876543212', 'Amit Patel', 'busy', 0, 
     NULL, 
     NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');

INSERT INTO api_callingsession 
    (session_id, is_active, started_at, total_calls, successful_calls, failed_calls)
VALUES
    ('session_demo_001', FALSE, NOW() - INTERVAL '3 hours', 10, 8, 2);
*/

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify tables were created correctly:

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('api_callhistory', 'api_callingsession');

-- Check table structures
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'api_callhistory' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'api_callingsession' 
ORDER BY ordinal_position;

-- ============================================
-- Grant permissions (if needed for specific users)
-- ============================================
-- GRANT ALL PRIVILEGES ON api_callhistory TO postgres;
-- GRANT ALL PRIVILEGES ON api_callingsession TO postgres;
-- GRANT USAGE, SELECT ON SEQUENCE api_callhistory_id_seq TO postgres;
-- GRANT USAGE, SELECT ON SEQUENCE api_callingsession_id_seq TO postgres;

-- ============================================
-- Success! Your tables are now created.
-- ============================================
