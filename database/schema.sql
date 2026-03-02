-- JANSEVA Digital Platform - PostgreSQL Schema
-- Run: psql -U postgres -d janseva_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'admin')),
  aadhaar_number VARCHAR(12) UNIQUE,
  address TEXT,
  district VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Maharashtra',
  pincode VARCHAR(6),
  profile_photo VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  refresh_token TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- =====================
-- SERVICES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  name_hi VARCHAR(200),
  description TEXT,
  description_hi TEXT,
  category VARCHAR(100) NOT NULL,
  required_docs JSONB DEFAULT '[]',
  processing_days INTEGER DEFAULT 7,
  fee DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

-- =====================
-- APPLICATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number VARCHAR(20) UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  service_type VARCHAR(100) NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled')),
  remarks TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  submitted_offline BOOLEAN DEFAULT false,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_applications_citizen ON applications(citizen_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_service ON applications(service_type);
CREATE INDEX idx_applications_number ON applications(application_number);

-- Auto-generate application number
CREATE SEQUENCE IF NOT EXISTS app_seq START 1000;

CREATE OR REPLACE FUNCTION generate_app_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.application_number := 'JAN' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('app_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_app_number
BEFORE INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION generate_app_number();

-- =====================
-- NOTIFICATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =====================
-- OFFLINE SYNC QUEUE
-- =====================
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- =====================
-- AUDIT LOGS
-- =====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- =====================
-- SEED DEFAULT SERVICES
-- =====================
INSERT INTO services (name, name_hi, description, category, required_docs, processing_days) VALUES
  ('Birth Certificate', 'जन्म प्रमाणपत्र', 'Apply for official birth certificate', 'civil', '["Hospital discharge summary", "Parent Aadhaar"]', 7),
  ('Income Certificate', 'आय प्रमाणपत्र', 'Annual income certificate from tehsildar', 'revenue', '["Aadhaar Card", "Ration Card", "Self Declaration"]', 10),
  ('Caste Certificate', 'जाति प्रमाणपत्र', 'SC/ST/OBC caste certificate', 'social', '["Aadhaar Card", "School Leaving Certificate", "Affidavit"]', 15),
  ('Domicile Certificate', 'अधिवास प्रमाणपत्र', 'Maharashtra domicile proof', 'revenue', '["Aadhaar Card", "School Certificate", "Residence Proof"]', 10),
  ('Water Connection', 'नल कनेक्शन', 'Apply for municipal water connection', 'municipal', '["Property Documents", "Aadhaar Card", "Site Plan"]', 21)
ON CONFLICT DO NOTHING;
