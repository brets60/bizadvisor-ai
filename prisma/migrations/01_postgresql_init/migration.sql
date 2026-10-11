-- BizAdvisor AI PostgreSQL / Supabase Migration
-- Matches specifications in Section 14 of MASTER FULL-STACK DEVELOPMENT PROMPT

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_token TEXT,
    reset_token TEXT,
    reset_expires TIMESTAMP WITH TIME ZONE,
    preferred_currency TEXT DEFAULT 'PHP' NOT NULL,
    country TEXT DEFAULT 'Philippines' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS business_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT,
    industry TEXT,
    business_stage TEXT,
    budget_range TEXT,
    target_market TEXT,
    goals TEXT,
    challenge TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    is_saved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS business_ideas (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    concept TEXT NOT NULL,
    target_market TEXT NOT NULL,
    startup_cost_estimate TEXT NOT NULL,
    assumptions TEXT NOT NULL,
    risks TEXT NOT NULL,
    status TEXT DEFAULT 'saved' NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_business_ideas_user_id ON business_ideas(user_id);

CREATE TABLE IF NOT EXISTS business_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_idea_id TEXT REFERENCES business_ideas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_business_plans_user_id ON business_plans(user_id);

CREATE TABLE IF NOT EXISTS marketing_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_plan_id TEXT REFERENCES business_plans(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_marketing_plans_user_id ON marketing_plans(user_id);

CREATE TABLE IF NOT EXISTS financial_calculations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculation_type TEXT NOT NULL,
    title TEXT,
    inputs JSONB NOT NULL,
    results JSONB NOT NULL,
    ai_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_financial_calculations_user_id ON financial_calculations(user_id);

CREATE TABLE IF NOT EXISTS action_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    target_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'medium' NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    success_metric TEXT NOT NULL,
    expected_resources TEXT,
    risks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);

CREATE TABLE IF NOT EXISTS saved_resources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_saved_resources_user_id ON saved_resources(user_id);

CREATE TABLE IF NOT EXISTS research_notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    industry TEXT NOT NULL,
    location TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    competitors JSONB,
    pricing_info TEXT,
    research_questions TEXT,
    verified_sources JSONB,
    user_inputs JSONB,
    ai_hypotheses JSONB,
    checklist JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_research_notes_user_id ON research_notes(user_id);
