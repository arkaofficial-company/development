-- ===========================================
-- 003: 実験テンプレートテーブル
-- ===========================================

CREATE TABLE IF NOT EXISTS experiment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT '',
  measurer_name TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  conditions TEXT NOT NULL DEFAULT '',
  reference_values JSONB NOT NULL DEFAULT '{}',
  default_rows JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON experiment_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
