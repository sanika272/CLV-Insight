import React from "react";
import { KPIs } from "../types";
import {
  ShoppingCart, Users, DollarSign, TrendingUp,
  RotateCcw, Star, Truck, BarChart2,
} from "lucide-react";

interface Props { data: KPIs | null; loading: boolean }

const fmt = (n: number, prefix = "$") =>
  n >= 1_000_000
    ? `${prefix}${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `${prefix}${(n / 1_000).toFixed(1)}K`
    : `${prefix}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cards = (d: KPIs) => [
  {
    label: "Total Revenue",
    value: fmt(d.total_revenue),
    icon: DollarSign,
    gradient: "from-blue-600 to-blue-800",
    text: "text-blue-200",
  },
  {
    label: "Total Customers",
    value: d.total_customers.toLocaleString(),
    icon: Users,
    gradient: "from-violet-600 to-violet-800",
    text: "text-violet-200",
  },
  {
    label: "Total Orders",
    value: d.total_orders.toLocaleString(),
    icon: ShoppingCart,
    gradient: "from-emerald-600 to-emerald-800",
    text: "text-emerald-200",
  },
  {
    label: "Avg Order Value",
    value: fmt(d.avg_order_value),
    icon: BarChart2,
    gradient: "from-amber-600 to-amber-800",
    text: "text-amber-200",
  },
  {
    label: "Avg CLV",
    value: fmt(d.avg_clv),
    icon: Star,
    gradient: "from-rose-600 to-rose-800",
    text: "text-rose-200",
  },
  {
    label: "Return Rate",
    value: `${d.return_rate}%`,
    icon: RotateCcw,
    gradient: "from-orange-600 to-orange-800",
    text: "text-orange-200",
  },
  {
    label: "Total Profit",
    value: fmt(d.total_profit),
    icon: TrendingUp,
    gradient: "from-teal-600 to-teal-800",
    text: "text-teal-200",
  },
  {
    label: "Avg Delivery Days",
    value: `${d.avg_delivery_days}d`,
    icon: Truck,
    gradient: "from-cyan-600 to-cyan-800",
    text: "text-cyan-200",
  },
];

export const KPICards: React.FC<Props> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards(data).map(({ label, value, icon: Icon, gradient, text }) => (
        <div key={label} className={`kpi-card bg-gradient-to-br ${gradient}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-medium ${text} uppercase tracking-wider`}>{label}</p>
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className={`p-2 rounded-xl bg-white/10`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
