import axios from "axios";
import {
  KPIs, SalesTrendPoint, CategoryBreakdown, RegionBreakdown,
  PaymentMethod, GenderBreakdown, RFMSegment, CustomerTableResponse,
  Customer, Recommendation, FilterOptions, Filters,
} from "../types";

const BASE_URL = "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

const params = (filters: Partial<Filters>) => {
  const p: Record<string, string> = {};
  if (filters.region && filters.region !== "All") p.region = filters.region;
  if (filters.category && filters.category !== "All") p.category = filters.category;
  if (filters.start_date) p.start_date = filters.start_date;
  if (filters.end_date) p.end_date = filters.end_date;
  return p;
};

export const fetchFilterOptions = (): Promise<FilterOptions> =>
  api.get("/api/filter-options").then((r) => r.data);

export const fetchKPIs = (f: Partial<Filters>): Promise<KPIs> =>
  api.get("/api/kpis", { params: params(f) }).then((r) => r.data);

export const fetchSalesTrend = (f: Partial<Filters>): Promise<SalesTrendPoint[]> =>
  api.get("/api/sales-trend", { params: params(f) }).then((r) => r.data);

export const fetchCategoryBreakdown = (f: Partial<Filters>): Promise<CategoryBreakdown[]> =>
  api.get("/api/category-breakdown", { params: params(f) }).then((r) => r.data);

export const fetchRegionBreakdown = (f: Partial<Filters>): Promise<RegionBreakdown[]> =>
  api.get("/api/region-breakdown", { params: params(f) }).then((r) => r.data);

export const fetchPaymentMethods = (f: Partial<Filters>): Promise<PaymentMethod[]> =>
  api.get("/api/payment-methods", { params: params(f) }).then((r) => r.data);

export const fetchGenderBreakdown = (f: Partial<Filters>): Promise<GenderBreakdown[]> =>
  api.get("/api/gender-breakdown", { params: params(f) }).then((r) => r.data);

export const fetchRFMSegments = (f: Partial<Filters>): Promise<RFMSegment[]> =>
  api.get("/api/rfm-segments", { params: params(f) }).then((r) => r.data);

export const fetchCustomerTable = (
  f: Partial<Filters>,
  page = 1,
  pageSize = 50,
  search = "",
  sortBy = "clv",
  sortOrder = "desc"
): Promise<CustomerTableResponse> =>
  api.get("/api/customer-table", {
    params: { ...params(f), page, page_size: pageSize, search, sort_by: sortBy, sort_order: sortOrder },
  }).then((r) => r.data);

export const fetchHighValueCustomers = (f: Partial<Filters>): Promise<Customer[]> =>
  api.get("/api/high-value-customers", { params: params(f) }).then((r) => r.data);

export const fetchInactiveCustomers = (f: Partial<Filters>): Promise<Customer[]> =>
  api.get("/api/inactive-customers", { params: params(f) }).then((r) => r.data);

export const fetchRecommendations = (f: Partial<Filters>): Promise<Recommendation[]> =>
  api.get("/api/recommendations", { params: params(f) }).then((r) => r.data);

export const getDownloadUrl = (f: Partial<Filters>): string => {
  const p = new URLSearchParams(params(f));
  return `${BASE_URL}/api/download/customers?${p.toString()}`;
};
