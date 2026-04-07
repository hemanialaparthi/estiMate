-- estiMate Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('github', 'csv', 'manual', 'seed')),
  project_type VARCHAR(30) NOT NULL CHECK (project_type IN ('feature', 'refactor', 'infrastructure', 'research', 'bugfix')),
  name VARCHAR(255),
  loc INTEGER NOT NULL,
  actual_days INTEGER NOT NULL,
  actual_people INTEGER NOT NULL,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estimation history
CREATE TABLE IF NOT EXISTS estimation_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  request_data JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data: realistic crowd projects (user_id NULL = platform seed)
INSERT INTO projects (user_id, source, project_type, name, loc, actual_days, actual_people, is_shared) VALUES
-- Features
(NULL, 'seed', 'feature', 'OAuth Integration', 1200, 8, 2, true),
(NULL, 'seed', 'feature', 'Notification System', 2500, 14, 3, true),
(NULL, 'seed', 'feature', 'Payment Checkout Flow', 3800, 22, 4, true),
(NULL, 'seed', 'feature', 'Search with Elasticsearch', 4500, 28, 3, true),
(NULL, 'seed', 'feature', 'Real-time Chat', 5200, 32, 4, true),
(NULL, 'seed', 'feature', 'Analytics Dashboard', 6000, 35, 4, true),
(NULL, 'seed', 'feature', 'Mobile App Push Notifications', 1800, 12, 2, true),
(NULL, 'seed', 'feature', 'Admin Panel CRUD', 3200, 20, 3, true),
(NULL, 'seed', 'feature', 'File Upload & Processing', 2800, 16, 2, true),
(NULL, 'seed', 'feature', 'Multi-tenant Auth', 4200, 26, 4, true),
(NULL, 'seed', 'feature', 'Email Campaign Builder', 7500, 45, 5, true),
(NULL, 'seed', 'feature', 'Reporting Engine', 8000, 50, 6, true),
(NULL, 'seed', 'feature', 'AI Recommendation Engine', 12000, 70, 6, true),
(NULL, 'seed', 'feature', 'Social Login Integration', 900, 6, 2, true),
(NULL, 'seed', 'feature', 'Subscription Billing Portal', 5500, 34, 4, true),
(NULL, 'seed', 'feature', 'Two-Factor Authentication', 1500, 10, 2, true),
(NULL, 'seed', 'feature', 'Webhook System', 2200, 14, 2, true),
(NULL, 'seed', 'feature', 'GraphQL API Layer', 6800, 42, 5, true),
(NULL, 'seed', 'feature', 'Audit Log System', 2000, 12, 2, true),
(NULL, 'seed', 'feature', 'Dark Mode', 800, 5, 1, true),

-- Refactors
(NULL, 'seed', 'refactor', 'Auth Module Rewrite', 3000, 18, 3, true),
(NULL, 'seed', 'refactor', 'Database ORM Migration', 4000, 24, 3, true),
(NULL, 'seed', 'refactor', 'Monolith to Microservices', 15000, 90, 7, true),
(NULL, 'seed', 'refactor', 'React Class to Hooks', 5000, 30, 4, true),
(NULL, 'seed', 'refactor', 'API Versioning', 2500, 16, 3, true),
(NULL, 'seed', 'refactor', 'Test Suite Overhaul', 3500, 20, 3, true),
(NULL, 'seed', 'refactor', 'Legacy PHP to Node Migration', 8000, 55, 5, true),
(NULL, 'seed', 'refactor', 'CSS-in-JS to CSS Modules', 4500, 25, 3, true),
(NULL, 'seed', 'refactor', 'Redux to Zustand', 2000, 12, 2, true),
(NULL, 'seed', 'refactor', 'REST to GraphQL', 6000, 38, 4, true),

-- Infrastructure
(NULL, 'seed', 'infrastructure', 'CI/CD Pipeline Setup', 1000, 8, 2, true),
(NULL, 'seed', 'infrastructure', 'Kubernetes Migration', 5000, 40, 4, true),
(NULL, 'seed', 'infrastructure', 'Redis Caching Layer', 2000, 14, 2, true),
(NULL, 'seed', 'infrastructure', 'Database Sharding', 4000, 30, 4, true),
(NULL, 'seed', 'infrastructure', 'AWS Lambda Functions', 3000, 20, 3, true),
(NULL, 'seed', 'infrastructure', 'Terraform Infrastructure', 2500, 18, 2, true),
(NULL, 'seed', 'infrastructure', 'Monitoring & Alerting Setup', 1500, 12, 2, true),
(NULL, 'seed', 'infrastructure', 'Multi-region Deployment', 3500, 28, 3, true),
(NULL, 'seed', 'infrastructure', 'Log Aggregation Pipeline', 2000, 16, 2, true),
(NULL, 'seed', 'infrastructure', 'Service Mesh (Istio)', 4500, 35, 4, true),

-- Research
(NULL, 'seed', 'research', 'ML Model Evaluation', 6000, 45, 3, true),
(NULL, 'seed', 'research', 'Performance Benchmarking', 2000, 20, 2, true),
(NULL, 'seed', 'research', 'Security Audit & Pentest', 3000, 25, 3, true),
(NULL, 'seed', 'research', 'Technology Feasibility Study', 1500, 15, 2, true),
(NULL, 'seed', 'research', 'User Research & Prototyping', 2500, 22, 3, true),
(NULL, 'seed', 'research', 'Data Pipeline Architecture', 5000, 38, 4, true),
(NULL, 'seed', 'research', 'LLM Integration Spike', 4000, 30, 3, true),
(NULL, 'seed', 'research', 'Compliance Framework Research', 3500, 28, 2, true),

-- Bugfix
(NULL, 'seed', 'bugfix', 'Critical Security Patch', 500, 4, 3, true),
(NULL, 'seed', 'bugfix', 'Memory Leak Investigation', 800, 6, 2, true),
(NULL, 'seed', 'bugfix', 'Race Condition Fix', 1200, 8, 2, true),
(NULL, 'seed', 'bugfix', 'Mobile Rendering Issues', 1500, 10, 2, true),
(NULL, 'seed', 'bugfix', 'Data Corruption Bug', 600, 5, 3, true);
