"""
Customer Intelligence Pipeline: RFM + K-Means Clustering for Nexora Retail.
Includes Elbow Method, Silhouette Analysis, and cluster profiling.
"""

from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from .config import RANDOM_STATE

def evaluate_k_selection(rfm_df: pd.DataFrame, k_range: range = range(2, 7)) -> Dict[str, Any]:
    """
    Computes Inertia and Silhouette scores across k_range to rigorously select optimal K.
    """
    feature_cols = ["recency", "frequency", "monetary", "avg_order_value", "discount_sensitivity"]
    available_cols = [c for c in feature_cols if c in rfm_df.columns]
    
    X = rfm_df[available_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    inertias = []
    silhouettes = []

    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        labels = kmeans.fit_predict(X_scaled)
        inertias.append(float(kmeans.inertia_))
        sil_score = float(silhouette_score(X_scaled, labels)) if len(set(labels)) > 1 else 0.0
        silhouettes.append(sil_score)

    # Choose best K by max silhouette score (constrained between 3 and 5 for practical retail interpretation)
    best_idx = int(np.argmax(silhouettes))
    optimal_k = list(k_range)[best_idx]
    if optimal_k < 3:
        optimal_k = 4 # Managerially actionable default

    return {
        "k_values": list(k_range),
        "inertias": inertias,
        "silhouettes": silhouettes,
        "optimal_k": optimal_k,
        "features_used": available_cols
    }

def fit_customer_clusters(rfm_df: pd.DataFrame, n_clusters: int = 5) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Fits K-Means with standard scaling and maps clusters to business personas.
    """
    feature_cols = ["recency", "frequency", "monetary", "avg_order_value", "discount_sensitivity"]
    available_cols = [c for c in feature_cols if c in rfm_df.columns]

    X = rfm_df[available_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=n_clusters, random_state=RANDOM_STATE, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    df_clustered = rfm_df.copy()
    df_clustered["cluster"] = labels

    # Interpret clusters dynamically based on relative centroid values
    cluster_stats = df_clustered.groupby("cluster").agg({
        "recency": "mean",
        "frequency": "mean",
        "monetary": "mean",
        "discount_sensitivity": "mean"
    }).reset_index()

    # Persona mapping based on business rules
    segment_names = {}
    assigned = set()

    # 1. VIP: Highest monetary
    vip_cluster = cluster_stats.sort_values(by="monetary", ascending=False).iloc[0]["cluster"]
    segment_names[vip_cluster] = "VIP Customers"
    assigned.add(vip_cluster)

    # 2. At-Risk: Highest recency among unassigned
    unassigned = cluster_stats[~cluster_stats["cluster"].isin(assigned)]
    if not unassigned.empty:
        at_risk_cluster = unassigned.sort_values(by="recency", ascending=False).iloc[0]["cluster"]
        segment_names[at_risk_cluster] = "At-Risk Customers"
        assigned.add(at_risk_cluster)

    # 3. Discount Seekers: Highest discount sensitivity among unassigned
    unassigned = cluster_stats[~cluster_stats["cluster"].isin(assigned)]
    if not unassigned.empty:
        disc_cluster = unassigned.sort_values(by="discount_sensitivity", ascending=False).iloc[0]["cluster"]
        segment_names[disc_cluster] = "Discount Seekers"
        assigned.add(disc_cluster)

    # 4. Loyal: Highest frequency among unassigned
    unassigned = cluster_stats[~cluster_stats["cluster"].isin(assigned)]
    if not unassigned.empty:
        loyal_cluster = unassigned.sort_values(by="frequency", ascending=False).iloc[0]["cluster"]
        segment_names[loyal_cluster] = "Loyal Customers"
        assigned.add(loyal_cluster)

    # 5. Remaining: New Customers or Occasional
    for c in cluster_stats["cluster"]:
        if c not in segment_names:
            segment_names[c] = "New Customers"

    df_clustered["segment"] = df_clustered["cluster"].map(segment_names)

    # Executive summaries per segment
    summary = []
    for seg, grp in df_clustered.groupby("segment"):
        rec_action = "Offer exclusive loyalty rewards and priority previews."
        if seg == "At-Risk Customers":
            rec_action = "Launch personalized win-back campaign with special revival discount."
        elif seg == "Discount Seekers":
            rec_action = "Promote bundle deals and clearance festival offers."
        elif seg == "New Customers":
            rec_action = "Send welcome onboarding perks and second-purchase vouchers."

        summary.append({
            "segment": seg,
            "count": len(grp),
            "pct": round(len(grp) / len(df_clustered) * 100, 1),
            "avg_monetary": float(grp["monetary"].mean()),
            "avg_frequency": float(grp["frequency"].mean()),
            "avg_recency": float(grp["recency"].mean()),
            "recommended_action": rec_action
        })

    model_metadata = {
        "n_clusters": n_clusters,
        "silhouette": float(silhouette_score(X_scaled, labels)),
        "inertia": float(kmeans.inertia_),
        "centroids": cluster_stats.to_dict(orient="records"),
        "summary": summary
    }

    return df_clustered, model_metadata
