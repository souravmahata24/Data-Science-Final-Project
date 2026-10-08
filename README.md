# Nexora Retail

### Predict Smarter. Stock Better. Sell More.

**Course:** Data Science for Managers  
**Project:** Applied AI & Machine Learning Capstone  
**Target Platform:** Python + Streamlit Enterprise Decision Support System  
**Currency Standard:** ₹ Indian Rupees (INR)

---

## 1. Executive Summary

**Nexora Retail** is an intelligent retail decision-support platform designed for retail managers. Instead of merely exposing abstract machine learning metrics, it operationalizes data into concrete business decisions across five fundamental retail questions:

1. **What products are likely to sell next?** (7-day demand forecasting)
2. **Which products may run out of stock?** (Stockout risk classification)
3. **Which customers are most valuable?** (RFM segmentation & behavioral profiling)
4. **How much inventory should the retailer purchase?** (Lead-time demand & safety buffer decision engine)
5. **How much money could better inventory decisions potentially save?** (Financial ROI model in ₹)

The system transforms raw transaction data into:
$$\text{Prediction} \longrightarrow \text{Explanation (SHAP)} \longrightarrow \text{Business Recommendation}$$

---

## 2. System Architecture

```text
       Raw Retail Data (CSV / Excel Upload or Demo Catalog)
                               │
                               ▼
                   Intelligent Column Mapping
                 (Fuzzy Synonym Auto-Detection)
                               │
                               ▼
                   Dataset Health & Cleaning
        (Deduplication, ISO Date Coercion, Outlier Clip)
                               │
                               ▼
                  Feature Engineering Pipeline
       (Lags, Rolling Means/Std, Velocity, Calendar, Coverage)
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
Customer Intelligence     Demand Forecasting    Stockout Prediction
(RFM Profile Scaling)   (TimeSeriesSplit Folds) (Class Imbalance Weight)
         │                     │                     │
   K-Means (k=5)         Ridge / RF / XGBoost   LogReg / RF / XGBoost
 (Elbow & Silhouette)      (RMSE / MAE / R²)      (Recall / F1 / AUC)
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                               ▼
                  SHAP Explainability Layer
              (TreeExplainer & Shapley Waterfall)
                               │
                               ▼
                   Inventory Decision Engine
               (Lead-Time Demand + Safety Stock)
                               │
                               ▼
                  Business Financial Model (₹)
             (Gross Margin, Holding, Avoided Losses)
                               │
                               ▼
             Executive Dashboard & Action Center
```

---

## 3. Machine Learning Methodology

### 3.1 Customer Intelligence: RFM + K-Means Clustering
- **Feature Set:** Recency (days since purchase), Frequency (order count), Monetary (total spend), Average Order Value (AOV), Discount Sensitivity, Category Diversity.
- **Preprocessing:** Standard scaling ($Z$-score normalization) to prevent Monetary skew.
- **K Selection:** Evaluated across $K \in [2, 7]$ using both Inertia (Elbow Method) and Silhouette Scores ($S \approx 0.42$).
- **Interpreted Segments:**
  1. *VIP Customers:* High monetary spend, high frequency $\rightarrow$ Exclusive previews & loyalty tier.
  2. *Loyal Customers:* Consistent frequency, steady basket size $\rightarrow$ Early access perks.
  3. *At-Risk Customers:* High monetary history but long recency gap $\rightarrow$ Personalized reactivation campaigns.
  4. *Discount Seekers:* High discount sensitivity $\rightarrow$ Targeted bundle clearance offers.
  5. *New Customers:* Single recent visit $\rightarrow$ Onboarding second-purchase incentives.

### 3.2 Demand Forecasting: Chronological Regression
- **Candidate Models:** Ridge Regression (L2 Regularization), Random Forest Regressor, XGBoost Regressor.
- **Target:** Cumulative 7-day future units sold per SKU.
- **Leakage Prevention:** Chronological cross-validation using `TimeSeriesSplit(n_splits=3)`. Features strictly use past data via `shift(1)` and rolling windows over shifted vectors.
- **Evaluation Metrics:**
  - $\text{MAE} = \frac{1}{n} \sum |y - \hat{y}|$
  - $\text{RMSE} = \sqrt{\frac{1}{n} \sum (y - \hat{y})^2}$
  - $R^2 = 1 - \frac{\sum (y - \hat{y})^2}{\sum (y - \bar{y})^2}$
  - $\text{MAPE}$ computed on non-zero demands.

### 3.3 Stockout Prediction: Early Warning Classification
- **Target:** Binary indicator ($1 = \text{Stockout in next 7 days}$, $0 = \text{Sufficient stock}$).
- **Candidate Models:** Balanced Logistic Regression, Random Forest Classifier, XGBoost Classifier.
- **Evaluation:** Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix.
- **Recall Prioritization:** In retail operations, a **False Negative** (failing to alert a stockout) incurs 100% lost sales margin and potential permanent customer churn. A **False Positive** triggers an advance purchase with minor holding cost ($\sim 1.5\%$ per month). The classification decision threshold is calibrated to $\tau = 0.40$ to maximize Recall.

### 3.4 Model Explainability: SHAP (SHapley Additive exPlanations)
- Employs `shap.TreeExplainer` and `shap.LinearExplainer` to calculate local Shapley attributions.
- Deconstructs predictions into a baseline value and positive/negative feature contributions.
- Formulates a two-tier presentation:
  1. **Executive Narrative:** *"Recent sales velocity (+2.4 units) and low current stock (-1.8 units) are driving the elevated stockout probability."*
  2. **Technical Waterfall:** Quantified SHAP values with absolute impact ranking.
- **Critical Disclaimer:** SHAP demonstrates feature contribution towards a model output; it does not establish causality.

---

## 4. Inventory Decision & Financial ROI Formulas

The prediction layer is strictly decoupled from the business decision layer:

$$\text{Expected Daily Demand} = \frac{\text{Predicted 7-Day Demand}}{7}$$

$$\text{Lead-Time Demand} = \text{Expected Daily Demand} \times \text{Supplier Lead Time (days)}$$

$$\text{Safety Stock} = Z \times \sigma_{\text{demand}} \times \sqrt{\text{Supplier Lead Time}} \quad (\text{where } Z=1.645 \text{ for 95\% Service Level})$$

$$\text{Reorder Point} = \text{Lead-Time Demand} + \text{Safety Stock}$$

$$\text{Recommended Purchase} = \max\left(0, \lceil \text{Reorder Point} - \text{Current Inventory} \rceil\right)$$

### Financial Impact Model (All in ₹ Indian Rupees)
- **Revenue Protected:** $\text{Units Stockout Prevented} \times \text{Selling Price}$
- **Avoided Stockout Cost:** $\text{Units Prevented} \times (\text{Selling Price} - \text{Unit Cost}) \times 1.25$
- **Excess Holding Savings:** $(\text{Excess Inventory Units} \times \text{Unit Cost}) \times \frac{18\%}{52}$

---

## 5. Team Responsibilities (Team of 8-9 Students)

| Member | Focus Area | Key Deliverables |
|---|---|---|
| **Member 1** | Business & Product Strategy | Value proposition, executive pitch, user stories, decision flow |
| **Member 2** | Data Engineering & Ingestion | `src/data.py`, `src/column_mapper.py`, `src/data_validation.py` |
| **Member 3** | Customer Intelligence | `src/clustering.py`, RFM engine, Elbow & Silhouette evaluation |
| **Member 4** | Demand Forecasting | `src/forecasting.py`, TimeSeriesSplit, Ridge/RF/XGBoost comparison |
| **Member 5** | Stockout Classification | `src/stockout.py`, Imbalance handling, Recall tuning, confusion matrix |
| **Member 6** | Inventory Optimization | `src/optimization.py`, Reorder point formulas, cost model in ₹ |
| **Member 7** | Explainability & Diagnostics | `src/explainability.py`, `src/evaluation.py`, SHAP integration |
| **Member 8** | Streamlit UX Architecture | `app.py`, KPI cards, interactive Plotly visuals, navigation |
| **Member 9** | Testing, Integration & Defense | Unit tests in `tests/`, `README.md`, `VIBE_CODING_LOG.md` |

---

## 6. 15-Minute Presentation Guide

### Part 1: Executive Pitch (First 5 Minutes)
- **Slide 1-2:** The Retail Problem: Stockouts lead to ₹ lost revenue; overstocking traps working capital.
- **Slide 3:** Product Demo: Executive Overview answering the 5 business questions with real-time KPI metrics in ₹.
- **Slide 4:** Tactical Action Center: Prioritized action list showing how predictions convert into recommended order quantities.
- **Slide 5:** Financial ROI: Revenue protected and potential holding savings.

### Part 2: Technical Deep Dive (Next 10 Minutes)
- **Slide 6:** Leakage-Free Architecture: Preprocessing inside folds with `TimeSeriesSplit`.
- **Slide 7:** Algorithm Selection & Model Comparison: Regression (Ridge vs RF vs XGBoost) and Classification (LogReg vs RF vs XGBoost).
- **Slide 8:** Customer Clustering: Justification of $K=5$ using Silhouette ($S$) and Elbow inertia curves.
- **Slide 9:** SHAP Explainability: Local waterfall breakdown and attribution vs causation.
- **Slide 10:** Error Analysis: High vs low velocity residuals, zero-inflation, and False Negative trade-off.

---

## 7. Setup & Execution Instructions

```bash
# 1. Clone repository and navigate to root
cd Nexora-Retail

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run unit tests
pytest tests/

# 5. Launch Streamlit Application
streamlit run app.py
```
