"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Skeleton className="h-[350px] w-full rounded-xl" />;

  return (
    <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden h-full">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-base font-bold text-slate-800">50への収束推移</CardTitle>
        <CardDescription className="text-xs text-slate-500 font-medium">直近実験の全7項目平均値 — 青い点線が理想値(50)</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tickMargin={12} stroke="#94a3b8" />
              <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" domain={[0, 100]} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)", fontSize: "12px" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "15px", color: "#64748b" }} />
              <ReferenceLine y={50} stroke="#3b82f6" strokeDasharray="6 3" strokeWidth={2} label={{ value: "理想値", fill: "#3b82f6", fontSize: 10, position: "right" }} />
              <Line type="monotone" dataKey="avg" name="全項目平均" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 5 }} dot={{ r: 3.5, fill: "#3b82f6" }} />
              <Line type="monotone" dataKey="deviation" name="平均偏差|値-50|" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" activeDot={{ r: 4 }} dot={{ r: 2.5, fill: "#ef4444" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
