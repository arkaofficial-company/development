-- ===========================================
-- Arcadiamond Lab Connect - 初期スキーマ（認証なし版）
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- 1. experiments テーブル
-- =========================================
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  measurer_name TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  conditions TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiments_date ON experiments(experiment_date DESC);

-- =========================================
-- 2. experiment_results テーブル
-- =========================================
CREATE TABLE IF NOT EXISTS experiment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL DEFAULT '',
  value_1 NUMERIC,
  value_2 NUMERIC,
  value_3 NUMERIC,
  value_4 NUMERIC,
  value_5 NUMERIC,
  value_6 NUMERIC,
  value_7 NUMERIC,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_results_experiment ON experiment_results(experiment_id);

-- =========================================
-- 3. analysis_reports テーブル
-- =========================================
CREATE TABLE IF NOT EXISTS analysis_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL DEFAULT 'single' CHECK (report_type IN ('single', 'comparative', 'trend')),
  summary_text TEXT NOT NULL DEFAULT '',
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  chart_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  statistics JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_model TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_experiment ON analysis_reports(experiment_id);

-- =========================================
-- 4. ocr_uploads テーブル
-- =========================================
CREATE TABLE IF NOT EXISTS ocr_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL DEFAULT '',
  raw_text TEXT NOT NULL DEFAULT '',
  parsed_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ocr_experiment ON ocr_uploads(experiment_id);

-- =========================================
-- updated_at 自動更新トリガー
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON experiment_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
