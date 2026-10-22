import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { SalesTrendPoint } from "../types";
import { TrendingUp } from "lucide-react";

interface Props { data: SalesTrendPoint[]; loading: boolean }

const fmt = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

export const SalesTrend: React.FC<Props> = ({ data, loading }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-4">
      <TrendingUp className="w-5 h-5 text-blue-400" />
      <h2 className="text-base font-semibold text-white">Monthly Sales Trend</h2>
    </div>
    {loading ? (
      <div className="h-64 bg-slate-800 animate-pulse rounded-xl" />
    ) : (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#334155" }}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(v: number, name: string) => [
              name === "revenue" ? fmt(v) : v.toLocaleString(),
              name === "revenue" ? "Revenue" : "Orders",
            ]}
          />
          <Legend formatter={(v) => (v === "revenue" ? "Revenue" : "Orders")} />
          <Line
            type="monotone" dataKey="revenue" stroke="#3b82f6"
            strokeWidth={2.5} dot={false} activeDot={{ r: 5 }}
          />
          <Line
            type="monotone" dataKey="orders" stroke="#10b981"
            strokeWidth={2} dot={false} activeDot={{ r: 5 }} yAxisId={0}
          />
        </LineChart>
      </ResponsiveContainer>
    )}
  </div>
);
