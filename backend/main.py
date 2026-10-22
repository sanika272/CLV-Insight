from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import io

from data_loader import load_raw, apply_filters, get_filter_options
from analytics import (
    compute_kpis,
    compute_sales_trend,
    compute_category_breakdown,
    compute_region_breakdown,
    compute_payment_methods,
    compute_rfm,
    compute_customer_table,
    compute_high_value_customers,
    compute_inactive_customers,
    compute_gender_breakdown,
    compute_recommendations,
)

app = FastAPI(title="CLV Insight API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Shared helper ──────────────────────────────
def filtered_df(region=None, category=None, start_date=None, end_date=None):
    df = load_raw()
    return apply_filters(df, region=region, category=category,
                         start_date=start_date, end_date=end_date)


# ── Filter options ─────────────────────────────
@app.get("/api/filter-options")
def filter_options():
    return get_filter_options()


# ── KPIs ───────────────────────────────────────
@app.get("/api/kpis")
def kpis(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    return compute_kpis(df)


# ── Sales Trend ────────────────────────────────
@app.get("/api/sales-trend")
def sales_trend(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    return compute_sales_trend(df)


# ── Category Breakdown ─────────────────────────
@app.get("/api/category-breakdown")
def category_breakdown(
    region: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region=region, start_date=start_date, end_date=end_date)
    return compute_category_breakdown(df)


# ── Region Breakdown ───────────────────────────
@app.get("/api/region-breakdown")
def region_breakdown(
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(category=category, start_date=start_date, end_date=end_date)
    return compute_region_breakdown(df)


# ── Payment Methods ────────────────────────────
@app.get("/api/payment-methods")
def payment_methods(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    return compute_payment_methods(df)


# ── Gender Breakdown ───────────────────────────
@app.get("/api/gender-breakdown")
def gender_breakdown(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    return compute_gender_breakdown(df)


# ── RFM Segmentation ───────────────────────────
@app.get("/api/rfm-segments")
def rfm_segments(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    rfm = compute_rfm(df)
    return rfm["segment_distribution"]


# ── Customer Table ─────────────────────────────
@app.get("/api/customer-table")
def customer_table(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: str = Query(None),
    sort_by: str = Query("clv"),
    sort_order: str = Query("desc"),
):
    df = filtered_df(region, category, start_date, end_date)
    rfm = compute_rfm(df)
    customers = compute_customer_table(df, rfm)
    cdf = pd.DataFrame(customers)

    if search:
        mask = (
            cdf["customer_id"].str.contains(search, case=False, na=False) |
            cdf["segment"].str.contains(search, case=False, na=False) |
            cdf["preferred_category"].str.contains(search, case=False, na=False)
        )
        cdf = cdf[mask]

    if sort_by in cdf.columns:
        cdf = cdf.sort_values(sort_by, ascending=(sort_order == "asc"))

    total = len(cdf)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = cdf.iloc[start:end].to_dict(orient="records")

    return {"total": total, "page": page, "page_size": page_size, "data": page_data}


# ── High-Value Customers ───────────────────────
@app.get("/api/high-value-customers")
def high_value_customers(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    rfm = compute_rfm(df)
    customers = compute_customer_table(df, rfm)
    return compute_high_value_customers(customers)


# ── Inactive Customers ─────────────────────────
@app.get("/api/inactive-customers")
def inactive_customers(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    rfm = compute_rfm(df)
    customers = compute_customer_table(df, rfm)
    return compute_inactive_customers(customers)


# ── Recommendations ────────────────────────────
@app.get("/api/recommendations")
def recommendations(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    rfm = compute_rfm(df)
    kpis = compute_kpis(df)
    return compute_recommendations(df, rfm, kpis)


# ── Download CSV ───────────────────────────────
@app.get("/api/download/customers")
def download_customers(
    region: str = Query(None),
    category: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = filtered_df(region, category, start_date, end_date)
    rfm = compute_rfm(df)
    customers = compute_customer_table(df, rfm)
    cdf = pd.DataFrame(customers)
    output = io.StringIO()
    cdf.to_csv(output, index=False)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=clv_customer_report.csv"},
    )


@app.get("/")
def root():
    return {"message": "CLV Insight API is running", "docs": "/docs"}
