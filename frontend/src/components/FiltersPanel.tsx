import React from "react";
import { FilterOptions, Filters } from "../types";
import { Filter, Calendar } from "lucide-react";

interface Props {
  options: FilterOptions | null;
  filters: Filters;
  onChange: (f: Filters) => void;
}

const sel = "bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

export const FiltersPanel: React.FC<Props> = ({ options, filters, onChange }) => {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Filters</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Region</label>
          <select className={sel} value={filters.region} onChange={set("region")}>
            <option value="All">All Regions</option>
            {options?.regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Category</label>
          <select className={sel} value={filters.category} onChange={set("category")}>
            <option value="All">All Categories</option>
            {options?.categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Start Date
          </label>
          <input type="date" className={sel} value={filters.start_date}
            min={options?.date_range.min} max={options?.date_range.max}
            onChange={set("start_date")} />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
            <Calendar className="w-3 h-3" /> End Date
          </label>
          <input type="date" className={sel} value={filters.end_date}
            min={options?.date_range.min} max={options?.date_range.max}
            onChange={set("end_date")} />
        </div>
      </div>
      <button
        onClick={() => onChange({ region: "All", category: "All", start_date: "", end_date: "" })}
        className="mt-3 text-xs text-slate-400 hover:text-blue-400 transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
};
