import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RegionBreakdown } from "../types";
import { MapPin } from "lucide-react";

interface Props { data: RegionBreakdown[]; loading: boolean }

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
const fmt = (v: number) => `$${(v / 1000).toFixed(0)}K`;

export const RegionChart: React.FC<Props> = ({ data, loading }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-4">
      <MapPin className="w-5 h-5 text-emerald-400" />
      <h2 className="text-base font-semibold text-white">Revenue by Region</h2>
    </div>
    {loading ? (
      <div className="h-56 bg-slate-800 animate-pulse rounded-xl" />
    ) : (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="region" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#334155" }} />
          <YAxis tickFormatter={fmt} tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            formatter={(v: number, name: string) => [
              name === "revenue" ? `$${v.toLocaleString()}` : v.toLocaleString(),
              name.charAt(0).toUpperCase() + name.slice(1),
            ]}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
    <div className="mt-3 grid grid-cols-2 gap-2">
      {data.map((r, i) => (
        <div key={r.region} className="bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
          <div>
            <p className="text-xs font-medium text-slate-200">{r.region}</p>
            <p className="text-[10px] text-slate-500">{r.customers.toLocaleString()} customers</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
