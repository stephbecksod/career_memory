-- 002: companies table
CREATE TABLE IF NOT EXISTS companies (
  company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  name TEXT NOT NULL,
  industry TEXT,
  role_title TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_is_current ON companies(user_id, is_current) WHERE is_current = true;
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NULL;

-- Add FK from users.current_company_id to companies
ALTER TABLE users ADD CONSTRAINT fk_users_current_company
  FOREIGN KEY (current_company_id) REFERENCES companies(company_id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_select_own" ON companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "companies_insert_own" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Soft delete only — no hard deletes
CREATE POLICY "companies_delete_own" ON companies
  FOR DELETE USING (false);
