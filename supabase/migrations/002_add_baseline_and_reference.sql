-- ===========================================
-- 002: 基本値(baseline)カラムと基準値(reference)カラムの追加
-- ===========================================

-- experiment_results に基本値列を追加
ALTER TABLE experiment_results ADD COLUMN IF NOT EXISTS baseline_value NUMERIC;

-- experiments に基準値行（7列＋基本値）を保存するJSONBカラムを追加
ALTER TABLE experiments ADD COLUMN IF NOT EXISTS reference_values JSONB NOT NULL DEFAULT '{}';

-- experiment_results に時刻列を追加
ALTER TABLE experiment_results ADD COLUMN IF NOT EXISTS measurement_time TEXT NOT NULL DEFAULT '';

-- experiment_results にカット列を追加
ALTER TABLE experiment_results ADD COLUMN IF NOT EXISTS cut_type TEXT NOT NULL DEFAULT '';
