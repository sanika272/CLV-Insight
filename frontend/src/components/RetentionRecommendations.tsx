import React from "react";
import { Recommendation } from "../types";
import { Lightbulb, AlertTriangle, Info } from "lucide-react";

interface Props { data: Recommendation[]; loading: boolean }

const priorityConfig = {
  High: { color: "border-red-500/40 bg-red-500/5", badge: "bg-red-500/20 text-red-300", icon: AlertTriangle, iconColor: "text-red-400" },
  Medium: { color: "border-amber-500/40 bg-amber-500/5", badge: "bg-amber-500/20 text-amber-300", icon: Lightbulb, iconColor: "text-amber-400" },
  Low: { color: "border-blue-500/40 bg-blue-500/5", badge: "bg-blue-500/20 text-blue-300", icon: Info, iconColor: "text-blue-400" },
};

const segmentBadge: Record<string, string> = {
  "Champions": "bg-emerald-500/20 text-emerald-300",
  "At Risk": "bg-amber-500/20 text-amber-300",
  "Lost": "bg-red-500/20 text-red-300",
  "All": "bg-slate-500/20 text-slate-300",
  "Potential Loyalists": "bg-violet-500/20 text-violet-300",
};

export const RetentionRecommendations: React.FC<Props> = ({ data, loading }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-5">
      <Lightbulb className="w-5 h-5 text-amber-400" />
      <h2 className="text-base font-semibold text-white">Retention Recommendations</h2>
      <span className="ml-auto text-xs text-slate-400">Based on your actual data</span>
    </div>

    {loading ? (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 animate-pulse rounded-xl" />
        ))}
      </div>
    ) : (
      <div className="grid md:grid-cols-2 gap-3">
        {data.map((rec) => {
          const cfg = priorityConfig[rec.priority];
          const Icon = cfg.icon;
          return (
            <div key={rec.id} className={`rounded-xl border p-4 ${cfg.color}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                      {rec.priority}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${segmentBadge[rec.segment] ?? "bg-slate-600/20 text-slate-400"}`}>
                      {rec.segment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{rec.insight}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="text-blue-400 font-medium">→ </span>{rec.action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
