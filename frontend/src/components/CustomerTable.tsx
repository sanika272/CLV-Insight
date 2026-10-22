import React, { useState } from "react";
import { Customer, Filters } from "../types";
import { Download, Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { getDownloadUrl } from "../api/client";

interface Props {
  data: Customer[];
  total: number;
  loading: boolean;
  page: number;
  onPageChange: (p: number) => void;
  onSearch: (s: string) => void;
  onSort: (col: string, order: "asc" | "desc") => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  filters: Filters;
  title?: string;
}

const segmentColor: Record<string, string> = {
  Champions: "bg-emerald-500/20 text-emerald-300",
  "Loyal Customers": "bg-blue-500/20 text-blue-300",
  "Potential Loyalists": "bg-violet-500/20 text-violet-300",
  "At Risk": "bg-amber-500/20 text-amber-300",
  "Can't Lose Them": "bg-red-500/20 text-red-300",
  Hibernating: "bg-slate-500/20 text-slate-300",
  Lost: "bg-rose-600/20 text-rose-300",
  Unknown: "bg-slate-700/20 text-slate-400",
};

const fmt$ = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const Col: React.FC<{ label: string; col: string; sortBy: string; sortOrder: "asc"|"desc"; onSort: (c: string, o: "asc"|"desc") => void }> = ({
  label, col, sortBy, sortOrder, onSort,
}) => {
  const active = sortBy === col;
  return (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap"
      onClick={() => onSort(col, active && sortOrder === "desc" ? "asc" : "desc")}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          sortOrder === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );
};

export const CustomerTable: React.FC<Props> = ({
  data, total, loading, page, onPageChange, onSearch, onSort, sortBy, sortOrder, filters, title = "Customer Analytics",
}) => {
  const [search, setSearch] = useState("");
  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (v: string) => { setSearch(v); onSearch(v); };

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search customer, segment…"
              value={search} onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
          <a
            href={getDownloadUrl(filters)} download="clv_report.csv"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </a>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-800 animate-pulse rounded-xl" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <Col label="Customer ID" col="customer_id" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <Col label="CLV ($)" col="clv" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <Col label="Total Spend" col="total_spend" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <Col label="Orders" col="order_count" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <Col label="Avg Order" col="avg_order_value" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <Col label="Recency (d)" col="recency_days" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <Col label="Return %" col="return_rate" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Segment</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Region</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.map((c) => (
                <tr key={c.customer_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs text-slate-300">{c.customer_id}</td>
                  <td className="px-3 py-3 font-semibold text-emerald-400">{fmt$(c.clv)}</td>
                  <td className="px-3 py-3 text-slate-300">{fmt$(c.total_spend)}</td>
                  <td className="px-3 py-3 text-slate-300">{c.order_count}</td>
                  <td className="px-3 py-3 text-slate-300">{fmt$(c.avg_order_value)}</td>
                  <td className="px-3 py-3 text-slate-300">{c.recency_days}d</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium ${c.return_rate > 30 ? "text-red-400" : "text-slate-300"}`}>
                      {c.return_rate}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${segmentColor[c.segment] ?? segmentColor.Unknown}`}>
                      {c.segment}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{c.region}</td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{c.preferred_category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-400">{total.toLocaleString()} customers total</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-slate-400">{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
