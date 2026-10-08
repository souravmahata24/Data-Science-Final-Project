# Nexora Retail — Vibe Coding & AI-Assisted Engineering Log

**Course:** Data Science for Managers  
**Project:** Applied AI & Machine Learning Capstone  
**Development Platform:** Google AI Studio Build Environment  
**Project Name:** Nexora Retail  

---

## 1. Transparency & Academic Integrity Statement

In adherence to the academic integrity standards of the *Data Science for Managers* capstone, this document provides an honest, auditable record of how generative artificial intelligence and agentic workflows were utilized during the development of **Nexora Retail**.

> **Core Principle:** AI agents accelerated code scaffolding, boilerplate generation, and UI layout structures, while our student engineering team retained strict intellectual ownership and architectural governance over machine learning formulation, leakage prevention, mathematical formulas, hyperparameter tuning, validation criteria, and business logic.

---

## 2. Tools & Environments Employed

1. **Google AI Studio (Gemini 2.5 / 3.0 Pro & Flash models):**
   - High-throughput prompt orchestration, iterative module authoring, and agentic workspace editing.
2. **Claude 3.7 Sonnet / Cursor Agent:**
   - Multi-file feature engineering refactoring and strict type annotations.
3. **Python Scientific Stack:**
   - `scikit-learn` for ML pipelines and cross-validation.
   - `xgboost` for gradient boosted trees.
   - `shap` for game-theoretic feature attribution.
   - `streamlit` and `plotly` for executive decision visualization.
4. **Git & GitHub:**
   - Branching strategy, PR reviews, automated pytest test runs, and semantic commit logging.

---

## 3. Agentic Workflow & Prompt Engineering Progression

### Phase 1: Problem Formulation & Architecture Prompting
- **Prompt Strategy:** We provided AI Studio with the comprehensive retail decision framework (the 5 core questions), prohibiting buzzwords like "AI" in product branding and mandating strict Indian Rupee (₹) formatting.
- **Agentic Scaffolding:** The agent generated the multi-module directory structure (`src/data.py`, `src/features.py`, `src/model.py`, `src/optimization.py`, etc.).
- **Human Verification:** The team reviewed the proposed pipeline to ensure separation of concerns: separating the prediction engine from the inventory decision layer.

### Phase 2: Feature Engineering & Data Leakage Prevention
- **Prompt Iteration:** Initial AI suggestions included contemporaneous features (e.g., current day sales as predictors).
- **Human Intervention:** The team intervened to eliminate target leakage. We mandated strict lag shifts (`shift(1)` for 1d, 7d, 14d, 30d lags) and rolling windows evaluated exclusively over shifted series.
- **Cross-Validation Correction:** The agent initially proposed standard `KFold`. Our team replaced this with `TimeSeriesSplit(n_splits=3)`, ensuring that chronological splits strictly simulate production deployment where only past transactions inform future forecasts.

### Phase 3: Algorithm Benchmarking & Metric Calibration
- **Model Comparison:** Evaluated Ridge Regression vs Random Forest vs XGBoost for demand regression, and Logistic Regression vs Random Forest vs XGBoost for stockout classification.
- **Metric Selection:** The agent was prompted to generate actual calculated metrics (MAE, RMSE, R², MAPE, Recall, F1, ROC-AUC) without fabrication.
- **Recall Prioritization:** For stockout classification, we adjusted the classification decision threshold to $\tau = 0.40$. The team reasoned that a False Negative (lost sales, brand damage) is exponentially more expensive to a retailer than a benign False Positive (holding an extra safety unit for 5 days).

### Phase 4: Model Explainability with SHAP
- **Implementation:** Connected `shap.TreeExplainer` and `shap.LinearExplainer` to extract true Shapley values for each individual inference.
- **Presentation Design:** Prompts were crafted to deliver a two-step UX:
  1. *Plain-English Business Narrative:* Explaining why an item is at risk in terms of recent sales and lead time.
  2. *Technical Waterfall Table:* Exposing exact numeric SHAP contributions for faculty audit.
- **Academic Caution:** Added explicit disclaimers that SHAP demonstrates feature contribution to a predictive output, not statistical causation.

### Phase 5: Inventory Optimization & Financial ROI Modeling
- **Formulation:** Defined deterministic, auditable inventory formulas:
  - $\text{Expected Daily Demand} = \text{Predicted Demand} / 7$
  - $\text{Lead-Time Demand} = \text{Daily Demand} \times \text{Lead Time}$
  - $\text{Safety Stock} = Z \times \sigma \times \sqrt{\text{Lead Time}}$
  - $\text{Recommended Order} = \max(0, \lceil \text{Reorder Point} - \text{Current Inventory} \rceil)$
- **Financial Model:** Embedded Indian numbering formatting (₹, lakhs, crores) and computed revenue protected, avoided stockout penalties, and freed working capital.

---

## 4. Human Review & Verification Matrix

| Module | AI Contribution | Human Audit & Decision | Status |
|---|---|---|---|
| `src/data.py` | Data loader boilerplate & synthetic generator | Validated realistic Indian retail SKU profiles and pricing | Verified |
| `src/column_mapper.py` | Fuzzy string matching logic | Added safety fallback: low-confidence matches default to manual mapping | Verified |
| `src/features.py` | Lag & rolling functions | Enforced `.shift(1)` across all rolling aggregations to prevent leakage | Verified |
| `src/forecasting.py` | Scikit-learn & XGBoost training scripts | Enforced `TimeSeriesSplit`, replaced random split, added MAPE | Verified |
| `src/stockout.py` | Classifier scaffolding | Tuned decision threshold ($\tau=0.40$) for Recall prioritization | Verified |
| `src/clustering.py` | K-Means execution | Added Elbow inertia & Silhouette Score curves for rigorous K justification | Verified |
| `src/explainability.py` | SHAP integration | Checked tree vs linear explainer compatibility; added causation disclaimer | Verified |
| `src/optimization.py` | Inventory calculation structure | Audited safety stock z-factor ($Z=1.645$ for 95% service level) | Verified |
| `app.py` | Streamlit layout & Plotly graphs | Refined executive tone; structured tabs around business questions | Verified |

---

## 5. Lessons Learned on AI-Assisted Development

1. **Velocity Multiplier:** AI tooling reduced routine implementation time (UI styling, Plotly layout boilerplate, input validation) by approximately 75%, allowing the team to dedicate substantially more time to econometric modeling, leakage prevention, and managerial interpretation.
2. **Need for Domain Vigilance:** Without human domain expertise, generative AI models frequently introduce subtle data leakage (e.g., standard K-Fold on time-series data or target-informed rolling statistics). Active human governance is indispensable.
3. **Authenticity in Data Science:** Purely AI-generated projects often hide behind black boxes. By decomposing our pipeline into explainable steps (Prediction $\rightarrow$ SHAP $\rightarrow$ Business Action $\rightarrow$ ROI in ₹), we established a defensible, faculty-ready capstone.
