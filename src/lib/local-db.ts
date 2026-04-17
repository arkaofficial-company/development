import { ExperimentFormData } from "@/types";

const DB_KEY = "arcadiamond_experiments";

export const localDb = {
  getExperiments: (): (ExperimentFormData & { id: string })[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  getExperiment: (id: string): (ExperimentFormData & { id: string }) | null => {
    if (typeof window === "undefined") return null;
    const items = localDb.getExperiments();
    return items.find((item) => item.id === id) || null;
  },

  saveExperiment: (data: ExperimentFormData, id?: string) => {
    if (typeof window === "undefined") return;
    const items = localDb.getExperiments();
    
    if (id) {
      const index = items.findIndex((item) => item.id === id);
      if (index >= 0) {
        items[index] = { ...data, id };
        localStorage.setItem(DB_KEY, JSON.stringify(items));
        return id;
      }
    }
    
    const newId = crypto.randomUUID();
    items.push({ ...data, id: newId });
    localStorage.setItem(DB_KEY, JSON.stringify(items));
    return newId;
  },

  deleteExperiment: (id: string) => {
    if (typeof window === "undefined") return;
    let items = localDb.getExperiments();
    items = items.filter((item) => item.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(items));
  }
};
