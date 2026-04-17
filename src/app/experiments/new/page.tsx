import { ExperimentForm } from "@/components/experiments/experiment-form";

export default function NewExperimentPage() {
  return (
    <div className="space-y-6 fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Registration</h2>
        <p className="text-muted-foreground mt-1">
          新しい実験データを記録します。保存後、AIが自動的に傾向を分析します。
        </p>
      </div>
      
      <div className="mt-8">
        <ExperimentForm />
      </div>
    </div>
  );
}
