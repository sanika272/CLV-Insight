import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PaymentMethod } from "../types";
import { CreditCard } from "lucide-react";

interface Props { data: PaymentMethod[]; loading: boolean }

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export const PaymentMethodChart: React.FC<Props> = ({ data, loading }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-4">
      <CreditCard className="w-5 h-5 text-cyan-400" />
      <h2 className="text-base font-semibold text-white">Payment Methods</h2>
    </div>
    {loading ? (
      <div className="h-56 bg-slate-800 animate-pulse rounded-xl" />
    ) : (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="payment_method"
            cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            formatter={(v: number, name: string) => [`${v.toLocaleString()} orders`, name]}
          />
          <Legend
            formatter={(v, e: any) => (
              <span className="text-slate-300 text-xs">
                {v} ({e.payload?.percentage ?? 0}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>
);
