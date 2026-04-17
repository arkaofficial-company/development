"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Trash2, Edit, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ExperimentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const result = await db.getExperiments();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if(confirm("この実験データを削除しますか？")) {
      try {
        await db.deleteExperiment(id);
        toast.success("削除しました");
        loadData();
      } catch (err) {
        toast.error("削除に失敗しました");
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.subject || "").includes(query) || (item.measurer_name || "").includes(query)
  );

  return (
    <div className="space-y-6 fade-in duration-500 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">実験データ一覧</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Supabaseに保存された実験データ履歴を確認・編集できます。</p>
        </div>
        <Link href="/experiments/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
            <PlusCircle className="w-4 h-4" />
            新規データ
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-5 h-5 text-slate-400" />
        <Input 
          placeholder="被験者名・プロジェクト名・測定者で検索..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-10 w-full"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f8fafc] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs border-r border-slate-200">測定日時</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs border-r border-slate-200">被験者 / プロジェクト</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs border-r border-slate-200">測定者</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center border-r border-slate-200">データ数</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                 <td colSpan={5} className="px-6 py-16 text-center text-slate-500 font-medium">
                   <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                   データベースから読み込み中...
                 </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">データがありません。右上の新規追加ボタンからデータを作成するか、SQLスクリプトを実行してください。</td>
              </tr>
            ) : filteredData.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-600 border-r border-slate-100">
                  {item.experiment_date ? format(new Date(item.experiment_date), "yyyy/MM/dd HH:mm") : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 border-r border-slate-100">{item.subject || '-'}</td>
                <td className="px-6 py-4 text-slate-600 border-r border-slate-100">{item.measurer_name || '-'}</td>
                <td className="px-6 py-4 text-center border-r border-slate-100">
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">
                    {item.rows?.length || 0} 行
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/experiments/${item.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 font-bold shadow-sm border border-slate-200 bg-white">
                        <Edit className="w-4 h-4 mr-1.5" /> 編集
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 font-bold shadow-sm border border-slate-200 bg-white">
                      <Trash2 className="w-4 h-4 mr-1.5" /> 削除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
