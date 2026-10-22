import pandas as pd
import numpy as np
from pathlib import Path
from functools import lru_cache

DATA_PATH = Path(__file__).parent / "data" / "ecommerce_sales_with_clv.csv"

@lru_cache(maxsize=1)
def load_raw() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    # --- Type coercions ---
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    numeric_cols = ["price", "discount", "quantity", "total_amount",
                    "shipping_cost", "profit_margin", "customer_age", "clv",
                    "delivery_time_days"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # --- Clean ---
    df.dropna(subset=["order_id", "customer_id", "order_date", "total_amount"], inplace=True)
    df["returned"] = df["returned"].astype(str).str.strip().str.lower().map(
        {"yes": True, "no": False, "true": True, "false": False}
    ).fillna(False)
    df["category"] = df["category"].astype(str).str.strip()
    df["region"] = df["region"].astype(str).str.strip()
    df["payment_method"] = df["payment_method"].astype(str).str.strip()
    df["customer_gender"] = df["customer_gender"].astype(str).str.strip()
    return df


def apply_filters(df: pd.DataFrame, region: str = None, category: str = None,
                  start_date: str = None, end_date: str = None) -> pd.DataFrame:
    if region and region.lower() not in ("all", ""):
        df = df[df["region"].str.lower() == region.lower()]
    if category and category.lower() not in ("all", ""):
        df = df[df["category"].str.lower() == category.lower()]
    if start_date:
        df = df[df["order_date"] >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df["order_date"] <= pd.to_datetime(end_date)]
    return df


def get_filter_options() -> dict:
    df = load_raw()
    return {
        "regions": sorted(df["region"].dropna().unique().tolist()),
        "categories": sorted(df["category"].dropna().unique().tolist()),
        "payment_methods": sorted(df["payment_method"].dropna().unique().tolist()),
        "date_range": {
            "min": df["order_date"].min().strftime("%Y-%m-%d"),
            "max": df["order_date"].max().strftime("%Y-%m-%d"),
        },
    }
