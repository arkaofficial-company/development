// ===========================================
// Arcadiamond Lab Connect - 型定義
// ===========================================

export interface Experiment {
  id: string;
  experiment_date: string;
  measurer_name: string;
  subject: string;
  content: string;
  conditions: string;
  status: 'draft' | 'confirmed';
  reference_values: ReferenceValues;
  created_at: string;
  updated_at: string;
  results?: ExperimentResult[];
}

export interface ReferenceValues {
  baseline: number | null;
  values: (number | null)[];
}

export interface ExperimentResult {
  id: string;
  experiment_id: string;
  target_name: string;
  baseline_value: number | null;
  value_1: number | null;
  value_2: number | null;
  value_3: number | null;
  value_4: number | null;
  value_5: number | null;
  value_6: number | null;
  value_7: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisReport {
  id: string;
  experiment_id: string | null;
  report_type: 'single' | 'comparative' | 'trend';
  summary_text: string;
  insights: AnalysisInsight[];
  chart_config: ChartConfig;
  statistics: ExperimentStatistics;
  ai_model: string;
  created_at: string;
}

export interface AnalysisInsight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  importance: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'radar' | 'scatter';
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  labels?: Record<string, string>;
}

export interface ExperimentStatistics {
  totalExperiments: number;
  totalSubjects: number;
  averages: Record<string, number>;
  stdDeviations: Record<string, number>;
  trends: TrendData[];
}

export interface TrendData {
  date: string;
  label: string;
  values: Record<string, number>;
}

export interface OcrUpload {
  id: string;
  experiment_id: string;
  image_url: string;
  raw_text: string;
  parsed_data: OcrParsedRow[];
  confidence: number;
  created_at: string;
}

export interface OcrParsedRow {
  target_name: string;
  baseline_value: number | null;
  values: (number | null)[];
  confidence: number;
}

// Data Grid types
export interface GridCell {
  row: number;
  col: number;
}

export interface GridRow {
  id: string;
  measurement_time: string;
  cut_type: string;
  target_name: string;
  baseline_value: number | null;
  values: (number | null)[];
}

// Form types
export interface ExperimentFormData {
  experiment_date: string;
  measurer_name: string;
  subject: string;
  content: string;
  conditions: string;
  reference_values: ReferenceValues;
  rows: GridRow[];
}

// Export types
export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeCharts: boolean;
  includeAnalysis: boolean;
  experimentIds?: string[];
  dateRange?: { from: string; to: string };
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
