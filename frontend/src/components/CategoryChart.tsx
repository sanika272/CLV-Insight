import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { CategoryBreakdown } from "../types";
import { Tag } from "lucide-react";

interface Props { data: CategoryBreakdown[]; loading: boolean }

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
const fmt = (v: number) => `$${(v / 1000).toFixed(0)}K`;

export const CategoryChart: React.FC<Props> = ({ data, loading }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-4">
      <Tag className="w-5 h-5 text-amber-400" />
      <h2 className="text-base font-semibold text-white">Revenue by Category</h2>
    </div>
    {loading ? (
      <div className="h-56 bg-slate-800 animate-pulse rounded-xl" />
    ) : (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tickFormatter={fmt}
            tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="category" width={90}
            tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            formatter={(v: number, name: string) => [
              name === "revenue" ? `$${v.toLocaleString()}` : v,
              name === "revenue" ? "Revenue" : name,
            ]}
          />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
      {data.map((c, i) => (
        <div key={c.category} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
          <div>
            <p className="text-xs text-slate-300">{c.category}</p>
            <p className="text-[10px] text-slate-500">Return: {c.return_rate}%</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
