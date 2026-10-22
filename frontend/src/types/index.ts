export interface KPIs {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  avg_order_value: number;
  return_rate: number;
  total_profit: number;
  avg_clv: number;
  avg_delivery_days: number;
}

export interface SalesTrendPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
  return_rate: number;
}

export interface RegionBreakdown {
  region: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface PaymentMethod {
  payment_method: string;
  count: number;
  percentage: number;
}

export interface GenderBreakdown {
  customer_gender: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface RFMSegment {
  segment: string;
  count: number;
  percentage: number;
}

export interface Customer {
  customer_id: string;
  total_spend: number;
  order_count: number;
  last_order_date: string;
  avg_order_value: number;
  return_count: number;
  return_rate: number;
  clv: number;
  region: string;
  customer_age: number;
  customer_gender: string;
  preferred_category: string;
  preferred_payment: string;
  recency_days: number;
  segment: string;
  r_score: number;
  f_score: number;
  m_score: number;
}

export interface CustomerTableResponse {
  total: number;
  page: number;
  page_size: number;
  data: Customer[];
}

export interface Recommendation {
  id: number;
  priority: "High" | "Medium" | "Low";
  segment: string;
  title: string;
  insight: string;
  action: string;
}

export interface FilterOptions {
  regions: string[];
  categories: string[];
  payment_methods: string[];
  date_range: { min: string; max: string };
}

export interface Filters {
  region: string;
  category: string;
  start_date: string;
  end_date: string;
}
