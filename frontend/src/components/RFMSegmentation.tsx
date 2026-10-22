import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { RFMSegment } from "../types";
import { Users } from "lucide-react";

interface Props { data: RFMSegment[]; loading: boolean }

const COLORS: Record<string, string> = {
  Champions: "#10b981",
  "Loyal Customers": "#3b82f6",
  "Potential Loyalists": "#8b5cf6",
  "At Risk": "#f59e0b",
  "Can't Lose Them": "#ef4444",
  Hibernating: "#64748b",
  Lost: "#dc2626",
};

const RECS: Record<string, string> = {
  Champions: "High value, high frequency",
  "Loyal Customers": "Buy regularly",
  "Potential Loyalists": "Recent, low frequency",
  "At Risk": "Declining engagement",
  "Can't Lose Them": "High spend, inactive",
  Hibernating: "Low engagement",
  Lost: "No recent purchases",
};

export const RFMSegmentation: React.FC<Props> = ({ data, loading }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-4">
      <Users className="w-5 h-5 text-violet-400" />
      <h2 className="text-base font-semibold text-white">RFM Customer Segmentation</h2>
    </div>
    {loading ? (
      <div className="h-64 bg-slate-800 animate-pulse rounded-xl" />
    ) : (
      <div className="flex flex-col md:flex-row gap-4">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data} dataKey="count" nameKey="segment"
              cx="50%" cy="50%" outerRadius={100} innerRadius={50}
              paddingAngle={3}
            >
              {data.map((s) => (
                <Cell key={s.segment} fill={COLORS[s.segment] ?? "#6366f1"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v: number, name: string) => [`${v} customers`, name]}
            />
            <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 min-w-[200px]">
          {data.map((s) => (
            <div key={s.segment} className="flex items-center justify-between gap-3 bg-slate-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[s.segment] ?? "#6366f1" }} />
                <div>
                  <p className="text-xs font-medium text-slate-200">{s.segment}</p>
                  <p className="text-[10px] text-slate-500">{RECS[s.segment]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">{s.count.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">{s.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
