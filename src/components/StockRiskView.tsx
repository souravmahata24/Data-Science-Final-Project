import React, { useState } from "react";
import { ProductDecision } from "../types";
import { AlertTriangle, ShieldCheck, AlertCircle, ArrowUpDown } from "lucide-react";

interface StockRiskViewProps {
  decisions: ProductDecision[];
  onSelectProductForInventory: (id: string) => void;
}

export const StockRiskView: React.FC<StockRiskViewProps> = ({
  decisions,
  onSelectProductForInventory
}) => {
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  const highRisk = decisions.filter(d => d.recommendation.riskLevel === "HIGH");
  const mediumRisk = decisions.filter(d => d.recommendation.riskLevel === "MEDIUM");
  const lowRisk = decisions.filter(d => d.recommendation.riskLevel === "LOW");

  const filteredDecisions = decisions.filter(d => {
    if (filterRisk === "ALL") return true;
    return d.recommendation.riskLevel === filterRisk;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          Early-Warning Stockout Classification
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Which products may run out?
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Proactive 7-day stockout classification to protect store revenue and prevent customer churn.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          onClick={() => setFilterRisk(filterRisk === "HIGH" ? "ALL" : "HIGH")}
          className={`bg-white rounded-2xl p-6 border text-left transition-all ${
            filterRisk === "HIGH"
              ? "border-rose-500 ring-2 ring-rose-200 shadow-md"
              : "border-slate-200 hover:border-rose-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              High Risk Products
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-4xl font-black text-rose-600 tracking-tight">
            {highRisk.length}
          </div>
          <div className="text-xs text-rose-700 mt-2 font-medium">
            Stock &lt; Lead-time demand • Immediate reorder required
          </div>
        </button>

        <button
          onClick={() => setFilterRisk(filterRisk === "MEDIUM" ? "ALL" : "MEDIUM")}
          className={`bg-white rounded-2xl p-6 border text-left transition-all ${
            filterRisk === "MEDIUM"
              ? "border-amber-500 ring-2 ring-amber-200 shadow-md"
              : "border-slate-200 hover:border-amber-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Medium Risk Products
            </span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-4xl font-black text-amber-600 tracking-tight">
            {mediumRisk.length}
          </div>
          <div className="text-xs text-amber-700 mt-2 font-medium">
            Stock &lt; Safety buffer • Monitor vendor deliveries
          </div>
        </button>

        <button
          onClick={() => setFilterRisk(filterRisk === "LOW" ? "ALL" : "LOW")}
          className={`bg-white rounded-2xl p-6 border text-left transition-all ${
            filterRisk === "LOW"
              ? "border-emerald-500 ring-2 ring-emerald-200 shadow-md"
              : "border-slate-200 hover:border-emerald-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Low Risk Products
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-4xl font-black text-emerald-600 tracking-tight">
            {lowRisk.length}
          </div>
          <div className="text-xs text-emerald-700 mt-2 font-medium">
            Adequately stocked for expected demand
          </div>
        </button>
      </div>

      {/* Clean Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Stockout Risk Assessment Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredDecisions.length} products (Filter: {filterRisk})
            </p>
          </div>
          {filterRisk !== "ALL" && (
            <button
              onClick={() => setFilterRisk("ALL")}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Product</th>
                <th className="py-3 px-4 font-bold text-right">Current Stock</th>
                <th className="py-3 px-4 font-bold text-right">Expected Demand</th>
                <th className="py-3 px-4 font-bold text-center">Stockout Risk</th>
                <th className="py-3 px-4 font-bold text-center">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDecisions.map(d => {
                const recom = d.recommendation;
                const risk = recom.riskLevel;
                const isHigh = risk === "HIGH";
                const isMed = risk === "MEDIUM";

                return (
                  <tr
                    key={d.productId}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectProductForInventory(d.productId)}
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">{d.productName}</div>
                      <div className="text-xs text-slate-400">
                        {d.productId} • {d.category}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      {recom.currentInventory} units
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-indigo-700">
                      {recom.predictedDemand7d} units
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isHigh
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : isMed
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {risk}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {recom.recommendedPurchase > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                          Order {recom.recommendedPurchase}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          No action needed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
