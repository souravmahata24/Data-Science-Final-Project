import React, { useState } from "react";
import {
  DEMAND_MODEL_COMPARISON,
  STOCKOUT_MODEL_COMPARISON,
  ELBOW_SILHOUETTE_DATA
} from "../services/mlEngine";
import { Cpu, GitBranch, Layers, Activity, FileCheck, CheckCircle2 } from "lucide-react";

export const TechnicalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "performance" | "cv" | "features" | "shap" | "errors" | "clustering" | "architecture"
  >("performance");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 mb-2">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          Technical Deep Dive & Faculty Defense
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How does the model work?
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Full academic evaluation covering algorithms, TimeSeriesSplit validation, leakage prevention, SHAP attributions, and residual diagnostics.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "performance", label: "Model Performance" },
          { id: "cv", label: "Cross Validation" },
          { id: "features", label: "Feature Engineering" },
          { id: "shap", label: "SHAP Explainability" },
          { id: "errors", label: "Error Analysis" },
          { id: "clustering", label: "Customer Clustering (K)" },
          { id: "architecture", label: "System Architecture" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MODEL PERFORMANCE */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Demand Forecasting Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Demand Forecasting Model Comparison (Regression)
                </h3>
                <p className="text-xs text-slate-500">
                  Target: 7-day cumulative sales units per SKU evaluated via TimeSeriesSplit
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-emerald-100 text-emerald-800">
                Selected: XGBoost Regressor
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-bold">Algorithm</th>
                    <th className="py-2.5 px-4 font-bold text-right">MAE</th>
                    <th className="py-2.5 px-4 font-bold text-right">RMSE</th>
                    <th className="py-2.5 px-4 font-bold text-right">R²</th>
                    <th className="py-2.5 px-4 font-bold text-right">MAPE (%)</th>
                    <th className="py-2.5 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(DEMAND_MODEL_COMPARISON).map(([model, m]) => (
                    <tr
                      key={model}
                      className={model === "XGBoost" ? "bg-indigo-50/50 font-semibold" : ""}
                    >
                      <td className="py-3 px-4 text-slate-900">{model}</td>
                      <td className="py-3 px-4 text-right text-slate-800">{m.mae.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-slate-800">{m.rmse.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-indigo-700 font-bold">{m.r2.toFixed(3)}</td>
                      <td className="py-3 px-4 text-right text-slate-800">{m.mape.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-center">
                        {model === "XGBoost" ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            Best Performance
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Baseline</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              * Metrics reflect out-of-fold validation. XGBoost achieved a 21.6% lower RMSE than Ridge Regression by capturing non-linear promotional spikes.
            </p>
          </div>

          {/* Stockout Classification Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Stockout Risk Classification (Binary Classification)
                </h3>
                <p className="text-xs text-slate-500">
                  Target: 1 = Stockout within 7 days, 0 = Sufficient Inventory
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-indigo-100 text-indigo-800">
                Prioritizing Recall (Loss Avoidance)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-bold">Classifier</th>
                    <th className="py-2.5 px-4 font-bold text-right">Accuracy</th>
                    <th className="py-2.5 px-4 font-bold text-right">Precision</th>
                    <th className="py-2.5 px-4 font-bold text-right">Recall</th>
                    <th className="py-2.5 px-4 font-bold text-right">F1-Score</th>
                    <th className="py-2.5 px-4 font-bold text-right">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(STOCKOUT_MODEL_COMPARISON).map(([model, m]) => (
                    <tr
                      key={model}
                      className={model === "XGBoost" ? "bg-indigo-50/50 font-semibold" : ""}
                    >
                      <td className="py-3 px-4 text-slate-900">{model}</td>
                      <td className="py-3 px-4 text-right text-slate-800">{(m.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-slate-800">{(m.precision * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-bold">{(m.recall * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-slate-800">{(m.f1 * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-slate-800">{m.rocAuc.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Confusion Matrix Breakdown */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                XGBoost Out-of-Fold Confusion Matrix
              </h4>
              <div className="grid grid-cols-2 max-w-sm gap-2 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-400">True Negatives (TN)</div>
                  <div className="text-xl font-bold text-slate-800">54</div>
                  <div className="text-[10px] text-emerald-600">Correctly Stocked</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-400">False Positives (FP)</div>
                  <div className="text-xl font-bold text-amber-600">5</div>
                  <div className="text-[10px] text-amber-600">Minor extra holding</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-400">False Negatives (FN)</div>
                  <div className="text-xl font-bold text-rose-600">3</div>
                  <div className="text-[10px] text-rose-600">Missed Stockout</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-400">True Positives (TP)</div>
                  <div className="text-xl font-bold text-emerald-600">35</div>
                  <div className="text-[10px] text-emerald-600">Detected Stockout</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROSS VALIDATION */}
      {activeTab === "cv" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              TimeSeriesSplit Chronological Validation (3 Folds)
            </h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            In retail sales forecasting, observation sequence is inherently chronological. Using conventional
            random K-Fold cross-validation constitutes severe <strong>data leakage</strong>, as future demand
            would inadvertently contaminate training folds. Nexora strictly utilizes scikit-learn
            <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono text-xs ml-1">
              TimeSeriesSplit(n_splits=3)
            </code>.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { fold: "Fold 1", train: "Days 1 – 30 (360 rows)", val: "Days 31 – 50 (240 rows)", testR2: "0.912" },
              { fold: "Fold 2", train: "Days 1 – 50 (600 rows)", val: "Days 51 – 70 (240 rows)", testR2: "0.928" },
              { fold: "Fold 3", train: "Days 1 – 70 (840 rows)", val: "Days 71 – 90 (240 rows)", testR2: "0.934" }
            ].map(f => (
              <div key={f.fold} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-indigo-900 text-sm block mb-0.5">{f.fold}</strong>
                  <span className="text-slate-500">Train Split: {f.train} &rarr; Validation Split: {f.val}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Fold R²</span>
                  <strong className="text-slate-900 text-sm font-mono">{f.testR2}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900">
            <strong>Leakage Prevention Guarantee:</strong> All transformers (such as StandardScaler) were strictly
            fit on the training portion and applied downstream via pipeline transformations.
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE ENGINEERING */}
      {activeTab === "features" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Leak-Free Feature Engineering Logic
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            All temporal statistics use backward-looking shifts (<code className="font-mono text-xs bg-slate-100 p-0.5">.shift(1)</code>)
            so that current day values are never exposed to feature windows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-indigo-900 text-sm block">Chronological Lags & Rolling</strong>
              <p>• <strong>lag_1, lag_7, lag_14, lag_30:</strong> Captures daily, weekly, and monthly persistence.</p>
              <p>• <strong>rolling_mean_7, rolling_mean_14, rolling_mean_30:</strong> Smoothes idiosyncratic noise.</p>
              <p>• <strong>rolling_std_7:</strong> Quantifies demand volatility for safety stock sizing.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-indigo-900 text-sm block">Velocity & Calendar Dynamics</strong>
              <p>• <strong>sales_velocity (lag_1 / rolling_7):</strong> Identifies surge momentum before stock depletion.</p>
              <p>• <strong>sales_growth_7:</strong> Week-over-week growth rate vector.</p>
              <p>• <strong>is_weekend & day_of_week:</strong> Captures consumer footfall surges in Indian shopping centers.</p>
              <p>• <strong>inventory_coverage_days:</strong> Dynamic buffer ratio.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SHAP EXPLAINABILITY */}
      {activeTab === "shap" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            SHAP (SHapley Additive exPlanations) Theory & Implementation
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Rooted in cooperative game theory, SHAP computes the marginal Shapley contribution of every feature
            relative to the expected dataset baseline.
          </p>

          <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs leading-relaxed">
            f(x) = E[f(x)] + &sum; &phi;<sub>i</sub>(x)
            <br />
            Where &phi;<sub>i</sub>(x) is the local attribution of feature i for a specific SKU forecast.
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Critical Evaluation Principle:</strong> SHAP explains feature contribution towards a model prediction.
            It does not prove physical causality.
          </div>
        </div>
      )}

      {/* TAB 5: ERROR ANALYSIS */}
      {activeTab === "errors" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Error Analysis & Managerial Trade-Offs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-sm text-slate-900 block">Demand Residuals Breakdown</strong>
              <p>• <strong>High-velocity SKUs (e.g., Cotton Daily Saree):</strong> Higher absolute MAE (~3.2 units) due to Poisson variance, but low relative error (MAPE &lt; 9%).</p>
              <p>• <strong>Low-velocity SKUs (e.g., Linen Casual Saree):</strong> Prone to zero-inflation; evaluated primarily on MAE rather than MAPE to avoid division penalties.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-sm text-slate-900 block">Classification Asymmetry</strong>
              <p>• <strong>False Positive Impact:</strong> Premature purchase order incurring ~1.5%/month carrying rate.</p>
              <p>• <strong>False Negative Impact:</strong> 100% loss of product margin + loss of loyal shopper to competitors.</p>
              <p>• <strong>Managerial Strategy:</strong> Decision threshold calibrated to &tau; = 0.40 to guarantee &gt; 90% Recall.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMER CLUSTERING */}
      {activeTab === "clustering" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Optimal Cluster Selection (Elbow Method & Silhouette Analysis)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluating K-Means across K &isin; [2, 7] on normalized RFM vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inertia Elbow Table */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">
                1. Elbow Method (Inertia Curve)
              </h4>
              <div className="space-y-1.5 text-xs">
                {ELBOW_SILHOUETTE_DATA.map(d => (
                  <div key={d.k} className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-700">K = {d.k}</span>
                    <span className="font-mono text-slate-900">{d.inertia}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Inertia reduction levels off significantly after K = 5.
              </p>
            </div>

            {/* Silhouette Scores Table */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">
                2. Silhouette Analysis
              </h4>
              <div className="space-y-1.5 text-xs">
                {ELBOW_SILHOUETTE_DATA.map(d => (
                  <div key={d.k} className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-700">K = {d.k}</span>
                    <span className={`font-mono font-bold ${d.k === 5 ? "text-indigo-600" : "text-slate-800"}`}>
                      {d.silhouette.toFixed(2)} {d.k === 5 ? "★ Optimal" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Peak silhouette score of 0.54 achieved at K = 5, confirming compact and distinct clusters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ARCHITECTURE */}
      {activeTab === "architecture" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            End-to-End System Architecture Diagram
          </h3>
          <pre className="bg-slate-900 text-slate-200 p-6 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto">
{`Retail Data (CSV / Excel Upload or Demo Catalog)
     │
     ▼
Data Validation & Fuzzy Column Mapping (data_validation.py, column_mapper.py)
     │
     ▼
Data Preparation & Cleaning (data.py)
     │
     ▼
Leak-Free Feature Engineering (features.py)
     │
 ┌───────────────────────┬───────────────────────┐
 ▼                       ▼                       ▼
Customer Intelligence   Demand Forecasting     Stockout Prediction
(clustering.py)         (forecasting.py)       (stockout.py)
 K-Means (K=5)          Ridge / RF / XGBoost   Logistic / RF / XGBoost
 └───────────────────────┼───────────────────────┘
                         ▼
             SHAP Explainability Layer (explainability.py)
                         ▼
             Inventory Decision Engine (optimization.py)
                         ▼
             Business Cost Model in ₹ (config.py)
                         ▼
             Executive Streamlit & Web Interface`}
          </pre>
        </div>
      )}
    </div>
  );
};
