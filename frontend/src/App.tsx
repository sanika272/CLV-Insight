import React, { useEffect, useState, useCallback } from "react";
import { KPICards } from "./components/KPICards";
import { FiltersPanel } from "./components/FiltersPanel";
import { SalesTrend } from "./components/SalesTrend";
import { RFMSegmentation } from "./components/RFMSegmentation";
import { CategoryChart } from "./components/CategoryChart";
import { RegionChart } from "./components/RegionChart";
import { PaymentMethodChart } from "./components/PaymentMethodChart";
import { CustomerTable } from "./components/CustomerTable";
import { RetentionRecommendations } from "./components/RetentionRecommendations";
import {
  fetchFilterOptions, fetchKPIs, fetchSalesTrend, fetchCategoryBreakdown,
  fetchRegionBreakdown, fetchPaymentMethods, fetchRFMSegments,
  fetchCustomerTable, fetchRecommendations,
} from "./api/client";
import type {
  KPIs, SalesTrendPoint, CategoryBreakdown, RegionBreakdown,
  PaymentMethod, RFMSegment, CustomerTableResponse, Recommendation,
  FilterOptions, Filters, Customer,
} from "./types";
import { BarChart2, RefreshCw } from "lucide-react";

const DEFAULT_FILTERS: Filters = { region: "All", category: "All", start_date: "", end_date: "" };

type Tab = "overview" | "customers" | "recommendations";

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [regions, setRegions] = useState<RegionBreakdown[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [rfmSegments, setRfmSegments] = useState<RFMSegment[]>([]);
  const [customerTable, setCustomerTable] = useState<CustomerTableResponse>({ total: 0, page: 1, page_size: 50, data: [] });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("clv");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [loading, setLoading] = useState({
    kpis: true, trend: true, category: true, region: true,
    payment: true, rfm: true, customers: true, recs: true,
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load filter options once
  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const setLoad = (k: keyof typeof loading, v: boolean) =>
    setLoading((prev) => ({ ...prev, [k]: v }));

  const loadAll = useCallback(() => {
    setLoad("kpis", true);
    setLoad("trend", true);
    setLoad("category", true);
    setLoad("region", true);
    setLoad("payment", true);
    setLoad("rfm", true);
    setLoad("recs", true);

    fetchKPIs(filters).then((d) => { setKpis(d); setLoad("kpis", false); }).catch(() => setLoad("kpis", false));
    fetchSalesTrend(filters).then((d) => { setSalesTrend(d); setLoad("trend", false); }).catch(() => setLoad("trend", false));
    fetchCategoryBreakdown(filters).then((d) => { setCategories(d); setLoad("category", false); }).catch(() => setLoad("category", false));
    fetchRegionBreakdown(filters).then((d) => { setRegions(d); setLoad("region", false); }).catch(() => setLoad("region", false));
    fetchPaymentMethods(filters).then((d) => { setPayments(d); setLoad("payment", false); }).catch(() => setLoad("payment", false));
    fetchRFMSegments(filters).then((d) => { setRfmSegments(d); setLoad("rfm", false); }).catch(() => setLoad("rfm", false));
    fetchRecommendations(filters).then((d) => { setRecommendations(d); setLoad("recs", false); }).catch(() => setLoad("recs", false));
    setLastRefresh(new Date());
  }, [filters]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadCustomers = useCallback(() => {
    setLoad("customers", true);
    fetchCustomerTable(filters, page, 50, search, sortBy, sortOrder)
      .then((d) => { setCustomerTable(d); setLoad("customers", false); })
      .catch(() => setLoad("customers", false));
  }, [filters, page, search, sortBy, sortOrder]);

  useEffect(() => { if (activeTab === "customers") loadCustomers(); }, [loadCustomers, activeTab]);

  const handleSort = (col: string, order: "asc" | "desc") => {
    setSortBy(col); setSortOrder(order); setPage(1);
  };
  const handleSearch = (s: string) => { setSearch(s); setPage(1); };
  const handleFilterChange = (f: Filters) => { setFilters(f); setPage(1); };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "📊 Overview" },
    { id: "customers", label: "👥 Customers" },
    { id: "recommendations", label: "💡 Recommendations" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">CLV Insight</h1>
              <p className="text-[10px] text-slate-400 hidden md:block">Customer Lifetime Value & Retention Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-500 hidden md:block">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
            <button
              onClick={loadAll}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Filters – always shown */}
        <FiltersPanel options={filterOptions} filters={filters} onChange={handleFilterChange} />

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <KPICards data={kpis} loading={loading.kpis} />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesTrend data={salesTrend} loading={loading.trend} />
              </div>
              <div>
                <RFMSegmentation data={rfmSegments} loading={loading.rfm} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <CategoryChart data={categories} loading={loading.category} />
              <RegionChart data={regions} loading={loading.region} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <PaymentMethodChart data={payments} loading={loading.payment} />
              {/* Mini summary */}
              <div className="card">
                <h2 className="text-base font-semibold text-white mb-4">📈 Quick Insights</h2>
                {kpis && (
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span className="text-slate-300">
                        Average Customer Lifetime Value is <span className="text-white font-semibold">${kpis.avg_clv.toLocaleString()}</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span className="text-slate-300">
                        Total revenue from <span className="text-white font-semibold">{kpis.total_customers.toLocaleString()}</span> unique customers across <span className="text-white font-semibold">{kpis.total_orders.toLocaleString()}</span> orders
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={kpis.return_rate > 20 ? "text-red-400 mt-0.5" : "text-amber-400 mt-0.5"}>•</span>
                      <span className="text-slate-300">
                        Return rate is <span className={`font-semibold ${kpis.return_rate > 20 ? "text-red-400" : "text-amber-400"}`}>{kpis.return_rate}%</span> — {kpis.return_rate > 20 ? "above average, needs attention" : "within acceptable range"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span className="text-slate-300">
                        Average order value: <span className="text-white font-semibold">${kpis.avg_order_value.toLocaleString()}</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span className="text-slate-300">
                        Average delivery time: <span className="text-white font-semibold">{kpis.avg_delivery_days} days</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-0.5">•</span>
                      <span className="text-slate-300">
                        Total profit margin: <span className={`font-semibold ${kpis.total_profit < 0 ? "text-red-400" : "text-teal-400"}`}>${kpis.total_profit.toLocaleString()}</span>
                      </span>
                    </li>
                  </ul>
                )}
                {loading.kpis && <div className="h-40 bg-slate-800 animate-pulse rounded-xl" />}
              </div>
            </div>
          </>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <CustomerTable
            data={customerTable.data}
            total={customerTable.total}
            loading={loading.customers}
            page={page}
            onPageChange={setPage}
            onSearch={handleSearch}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            filters={filters}
          />
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === "recommendations" && (
          <RetentionRecommendations data={recommendations} loading={loading.recs} />
        )}
      </main>
    </div>
  );
}
