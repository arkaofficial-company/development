import { createClient } from "@supabase/supabase-js";
import { ExperimentFormData } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  getExperiments: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('experiments')
      .select(`*, rows:experiment_results(*)`)
      .order('experiment_date', { ascending: false });
    if (error) {
      console.error("Fetch error:", error);
      return [];
    }
    
    return data.map(exp => ({
      ...exp,
      reference_values: exp.reference_values || { baseline: null, values: Array(7).fill(null) },
      rows: exp.rows.map((r: any) => ({
        id: r.id,
        measurement_time: r.measurement_time || "",
        cut_type: r.cut_type || "",
        target_name: r.target_name,
        baseline_value: r.baseline_value ?? null,
        values: [r.value_1, r.value_2, r.value_3, r.value_4, r.value_5, r.value_6, r.value_7]
      }))
    }));
  },

  getExperiment: async (id: string): Promise<any> => {
    const { data, error } = await supabase
      .from('experiments')
      .select(`*, rows:experiment_results(*)`)
      .eq('id', id)
      .single();
    if (error) {
      console.error("Fetch single error:", error);
      return null;
    }
    return {
      ...data,
      reference_values: data.reference_values || { baseline: null, values: Array(7).fill(null) },
      rows: data.rows.map((r: any) => ({
        id: r.id,
        measurement_time: r.measurement_time || "",
        cut_type: r.cut_type || "",
        target_name: r.target_name,
        baseline_value: r.baseline_value ?? null,
        values: [r.value_1, r.value_2, r.value_3, r.value_4, r.value_5, r.value_6, r.value_7]
      }))
    };
  },

  saveExperiment: async (formData: ExperimentFormData, id?: string) => {
    const expData = {
      experiment_date: formData.experiment_date,
      measurer_name: formData.measurer_name,
      subject: formData.subject,
      content: formData.content,
      conditions: formData.conditions,
      reference_values: formData.reference_values || { baseline: null, values: Array(7).fill(null) },
    };
    
    let experimentId = id;
    
    if (id) {
      const { error: expError } = await supabase
        .from('experiments')
        .update(expData)
        .eq('id', id);
      if (expError) throw expError;
      
      await supabase.from('experiment_results').delete().eq('experiment_id', id);
    } else {
      const { data: newExp, error: expError } = await supabase
        .from('experiments')
        .insert([expData])
        .select()
        .single();
      if (expError) throw expError;
      experimentId = newExp.id;
    }
    
    if (formData.rows && formData.rows.length > 0) {
      const rowsData = formData.rows.map(r => ({
        experiment_id: experimentId,
        measurement_time: r.measurement_time || "",
        cut_type: r.cut_type || "",
        target_name: r.target_name,
        baseline_value: r.baseline_value ?? null,
        value_1: r.values[0] ?? null,
        value_2: r.values[1] ?? null,
        value_3: r.values[2] ?? null,
        value_4: r.values[3] ?? null,
        value_5: r.values[4] ?? null,
        value_6: r.values[5] ?? null,
        value_7: r.values[6] ?? null,
      }));
      
      const { error: rowError } = await supabase
        .from('experiment_results')
        .insert(rowsData);
      if (rowError) throw rowError;
    }
    
    return experimentId;
  },

  deleteExperiment: async (id: string) => {
    const { error } = await supabase
      .from('experiments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── テンプレート ──
  getTemplates: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('experiment_templates')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) { console.error('Template fetch error:', error); return []; }
    return data;
  },

  saveTemplate: async (template: {
    name: string;
    measurer_name: string;
    subject: string;
    content: string;
    conditions: string;
    reference_values: any;
    default_rows: any;
  }, id?: string) => {
    if (id) {
      const { error } = await supabase.from('experiment_templates').update(template).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('experiment_templates').insert([template]);
      if (error) throw error;
    }
  },

  deleteTemplate: async (id: string) => {
    const { error } = await supabase.from('experiment_templates').delete().eq('id', id);
    if (error) throw error;
  }
};
