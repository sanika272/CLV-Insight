import pandas as pd
import numpy as np
from datetime import datetime


# ─────────────────────────────────────────────
#  KPIs
# ─────────────────────────────────────────────
def compute_kpis(df: pd.DataFrame) -> dict:
    total_orders = len(df)
    total_revenue = float(df["total_amount"].sum())
    total_customers = df["customer_id"].nunique()
    avg_order_value = float(df["total_amount"].mean()) if total_orders else 0
    return_rate = float(df["returned"].sum() / total_orders * 100) if total_orders else 0
    total_profit = float(df["profit_margin"].sum())
    avg_clv = float(df.groupby("customer_id")["clv"].first().mean())
    avg_delivery = float(df["delivery_time_days"].mean())

    return {
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_customers": total_customers,
        "avg_order_value": round(avg_order_value, 2),
        "return_rate": round(return_rate, 2),
        "total_profit": round(total_profit, 2),
        "avg_clv": round(avg_clv, 2),
        "avg_delivery_days": round(avg_delivery, 1),
    }


# ─────────────────────────────────────────────
#  Sales Trend
# ─────────────────────────────────────────────
def compute_sales_trend(df: pd.DataFrame) -> list:
    df = df.copy()
    df["month"] = df["order_date"].dt.to_period("M")
    trend = (
        df.groupby("month")
        .agg(revenue=("total_amount", "sum"), orders=("order_id", "count"))
        .reset_index()
    )
    trend["month"] = trend["month"].astype(str)
    return trend.sort_values("month").to_dict(orient="records")


# ─────────────────────────────────────────────
#  Category Breakdown
# ─────────────────────────────────────────────
def compute_category_breakdown(df: pd.DataFrame) -> list:
    cat = (
        df.groupby("category")
        .agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "count"),
            avg_order_value=("total_amount", "mean"),
            return_rate=("returned", lambda x: round(x.sum() / len(x) * 100, 2)),
        )
        .reset_index()
    )
    cat["revenue"] = cat["revenue"].round(2)
    cat["avg_order_value"] = cat["avg_order_value"].round(2)
    return cat.sort_values("revenue", ascending=False).to_dict(orient="records")


# ─────────────────────────────────────────────
#  Region Breakdown
# ─────────────────────────────────────────────
def compute_region_breakdown(df: pd.DataFrame) -> list:
    reg = (
        df.groupby("region")
        .agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "count"),
            customers=("customer_id", "nunique"),
        )
        .reset_index()
    )
    reg["revenue"] = reg["revenue"].round(2)
    return reg.sort_values("revenue", ascending=False).to_dict(orient="records")


# ─────────────────────────────────────────────
#  Payment Methods
# ─────────────────────────────────────────────
def compute_payment_methods(df: pd.DataFrame) -> list:
    pm = df["payment_method"].value_counts().reset_index()
    pm.columns = ["payment_method", "count"]
    pm["percentage"] = (pm["count"] / pm["count"].sum() * 100).round(2)
    return pm.to_dict(orient="records")


# ─────────────────────────────────────────────
#  RFM Segmentation
# ─────────────────────────────────────────────
def compute_rfm(df: pd.DataFrame) -> dict:
    snapshot_date = df["order_date"].max() + pd.Timedelta(days=1)

    rfm = (
        df.groupby("customer_id")
        .agg(
            recency=("order_date", lambda x: (snapshot_date - x.max()).days),
            frequency=("order_id", "count"),
            monetary=("total_amount", "sum"),
        )
        .reset_index()
    )

    # Score each dimension 1-5
    rfm["r_score"] = pd.qcut(rfm["recency"], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
    rfm["f_score"] = pd.qcut(rfm["frequency"].rank(method="first"), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    rfm["m_score"] = pd.qcut(rfm["monetary"].rank(method="first"), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    rfm["rfm_score"] = rfm["r_score"].astype(str) + rfm["f_score"].astype(str) + rfm["m_score"].astype(str)
    rfm["rfm_total"] = rfm["r_score"] + rfm["f_score"] + rfm["m_score"]

    def segment(row):
        r, f, m = row["r_score"], row["f_score"], row["m_score"]
        if r >= 4 and f >= 4 and m >= 4:
            return "Champions"
        elif r >= 3 and f >= 3:
            return "Loyal Customers"
        elif r >= 4 and f <= 2:
            return "Potential Loyalists"
        elif r <= 2 and f >= 4:
            return "At Risk"
        elif r <= 2 and f >= 3 and m >= 3:
            return "Can't Lose Them"
        elif r <= 2 and f <= 2:
            return "Lost"
        else:
            return "Hibernating"

    rfm["segment"] = rfm.apply(segment, axis=1)
    rfm["monetary"] = rfm["monetary"].round(2)

    segment_counts = rfm["segment"].value_counts().reset_index()
    segment_counts.columns = ["segment", "count"]
    segment_counts["percentage"] = (segment_counts["count"] / len(rfm) * 100).round(2)

    return {
        "segment_distribution": segment_counts.to_dict(orient="records"),
        "rfm_table": rfm.to_dict(orient="records"),
    }


# ─────────────────────────────────────────────
#  Customer Analytics Table
# ─────────────────────────────────────────────
def compute_customer_table(df: pd.DataFrame, rfm_data: dict) -> list:
    snapshot_date = df["order_date"].max() + pd.Timedelta(days=1)

    customer = (
        df.groupby("customer_id")
        .agg(
            total_spend=("total_amount", "sum"),
            order_count=("order_id", "count"),
            last_order_date=("order_date", "max"),
            avg_order_value=("total_amount", "mean"),
            return_count=("returned", "sum"),
            clv=("clv", "first"),
            region=("region", "first"),
            customer_age=("customer_age", "first"),
            customer_gender=("customer_gender", "first"),
            preferred_category=("category", lambda x: x.mode()[0] if len(x) > 0 else ""),
            preferred_payment=("payment_method", lambda x: x.mode()[0] if len(x) > 0 else ""),
        )
        .reset_index()
    )

    customer["recency_days"] = (snapshot_date - customer["last_order_date"]).dt.days
    customer["return_rate"] = (customer["return_count"] / customer["order_count"] * 100).round(2)
    customer["total_spend"] = customer["total_spend"].round(2)
    customer["avg_order_value"] = customer["avg_order_value"].round(2)
    customer["last_order_date"] = customer["last_order_date"].dt.strftime("%Y-%m-%d")

    # Merge segments
    rfm_df = pd.DataFrame(rfm_data["rfm_table"])[["customer_id", "segment", "r_score", "f_score", "m_score"]]
    customer = customer.merge(rfm_df, on="customer_id", how="left")
    customer["segment"] = customer["segment"].fillna("Unknown")

    return customer.to_dict(orient="records")


# ─────────────────────────────────────────────
#  High-Value Customers (top 20% by CLV)
# ─────────────────────────────────────────────
def compute_high_value_customers(customer_table: list) -> list:
    df = pd.DataFrame(customer_table)
    threshold = df["clv"].quantile(0.80)
    high_value = df[df["clv"] >= threshold].sort_values("clv", ascending=False)
    return high_value.head(50).to_dict(orient="records")


# ─────────────────────────────────────────────
#  Inactive Customers
# ─────────────────────────────────────────────
def compute_inactive_customers(customer_table: list) -> list:
    df = pd.DataFrame(customer_table)
    inactive = df[(df["recency_days"] > 90) & (df["order_count"] < 3)]
    return inactive.sort_values("recency_days", ascending=False).head(50).to_dict(orient="records")


# ─────────────────────────────────────────────
#  Gender Breakdown
# ─────────────────────────────────────────────
def compute_gender_breakdown(df: pd.DataFrame) -> list:
    gender = (
        df.groupby("customer_gender")
        .agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "count"),
            customers=("customer_id", "nunique"),
        )
        .reset_index()
    )
    gender["revenue"] = gender["revenue"].round(2)
    return gender.to_dict(orient="records")


# ─────────────────────────────────────────────
#  Retention Recommendations
# ─────────────────────────────────────────────
def compute_recommendations(df: pd.DataFrame, rfm_data: dict, kpis: dict) -> list:
    recommendations = []
    rfm_df = pd.DataFrame(rfm_data["rfm_table"])

    # Lost customers count
    lost = len(rfm_df[rfm_df["segment"] == "Lost"])
    at_risk = len(rfm_df[rfm_df["segment"] == "At Risk"])
    champions = len(rfm_df[rfm_df["segment"] == "Champions"])
    total_customers = len(rfm_df)

    # High return rate categories
    cat_returns = (
        df.groupby("category")
        .agg(return_rate=("returned", lambda x: x.sum() / len(x) * 100))
        .reset_index()
        .sort_values("return_rate", ascending=False)
    )
    highest_return_cat = cat_returns.iloc[0]["category"] if len(cat_returns) else "Unknown"
    highest_return_rate = cat_returns.iloc[0]["return_rate"] if len(cat_returns) else 0

    # Best region
    region_rev = df.groupby("region")["total_amount"].sum()
    best_region = region_rev.idxmax() if len(region_rev) else "Unknown"

    # Avg recency of at-risk
    at_risk_df = rfm_df[rfm_df["segment"] == "At Risk"]
    avg_at_risk_recency = int(at_risk_df["recency"].mean()) if len(at_risk_df) else 0

    # Low frequency customers
    low_freq = len(rfm_df[rfm_df["frequency"] == 1])

    recommendations = [
        {
            "id": 1,
            "priority": "High",
            "segment": "Lost",
            "title": "Re-engage Lost Customers",
            "insight": f"{lost} customers ({round(lost/total_customers*100, 1)}%) are classified as Lost.",
            "action": "Launch a 'We Miss You' email campaign with a 15-20% discount coupon targeted at lost customers. Focus on their previously purchased categories.",
        },
        {
            "id": 2,
            "priority": "High",
            "segment": "At Risk",
            "title": "Prevent At-Risk Customer Churn",
            "insight": f"{at_risk} customers haven't purchased in an avg of {avg_at_risk_recency} days and show declining frequency.",
            "action": "Trigger personalized push notifications or SMS with exclusive loyalty rewards. Offer free shipping on next purchase.",
        },
        {
            "id": 3,
            "priority": "Medium",
            "segment": "Champions",
            "title": "Reward Champion Customers",
            "insight": f"{champions} customers ({round(champions/total_customers*100, 1)}%) are Champions — your highest-value segment.",
            "action": "Create a VIP loyalty program with early access to new products, exclusive deals, and a dedicated support line.",
        },
        {
            "id": 4,
            "priority": "Medium",
            "segment": "All",
            "title": f"Reduce Returns in {highest_return_cat}",
            "insight": f"{highest_return_cat} has the highest return rate of {round(highest_return_rate, 1)}%.",
            "action": "Improve product descriptions and images. Add size guides or comparison tools. Follow up with post-purchase satisfaction surveys.",
        },
        {
            "id": 5,
            "priority": "Low",
            "segment": "Potential Loyalists",
            "title": "Convert One-Time Buyers",
            "insight": f"{low_freq} customers have placed only 1 order — a large untapped segment for repeat sales.",
            "action": "Send a follow-up email 7 days after first purchase with product recommendations. Offer a 10% discount on second purchase.",
        },
        {
            "id": 6,
            "priority": "Low",
            "segment": "All",
            "title": f"Scale Up in {best_region} Region",
            "insight": f"The {best_region} region generates the highest revenue in your portfolio.",
            "action": "Increase marketing spend and inventory in this region. Launch region-specific promotions and referral programs.",
        },
        {
            "id": 7,
            "priority": "Medium",
            "segment": "All",
            "title": "Optimize Overall Return Rate",
            "insight": f"Overall return rate is {kpis['return_rate']}%. Each return erodes margin and CLV.",
            "action": "Implement a post-return feedback loop. Use return reason data to fix product quality issues. Offer exchange instead of refund to retain revenue.",
        },
    ]

    return recommendations
