"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExperimentForm } from "@/components/experiments/experiment-form";
import { db } from "@/lib/db";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditExperimentPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await db.getExperiment(id);
        if (data) {
          setInitialData(data);
        } else {
          router.push("/experiments");
        }
      }
    };
    fetchData();
  }, [id, router]);

  if (!initialData) {
    return <div className="p-24 flex flex-col items-center justify-center gap-4 text-slate-500"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /><p>データベース情報を取得中...</p></div>;
  }

  return (
    <div className="space-y-6 fade-in duration-500">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 pl-1">
        <Link href="/experiments">
          <Button variant="ghost" size="icon" className="hover:bg-slate-200 mt-1">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">実験データの編集</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Supabaseから取得した実験データを修正・追記しています。
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <ExperimentForm experimentId={id} initialData={initialData} />
      </div>
    </div>
  );
}
