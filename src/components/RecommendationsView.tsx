import React, { useState } from "react";
import { ProductDecision } from "../types";
import { Lightbulb, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

interface RecommendationsViewProps {
  decisions: ProductDecision[];
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ decisions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(decisions[0]?.productId || null);

  // Sort priority: High risk first, then highest predicted demand
  const prioritized = [...decisions].sort((a, b) => {
    const riskScoreA = a.recommendation.riskLevel === "HIGH" ? 0 : a.recommendation.riskLevel === "MEDIUM" ? 1 : 2;
    const riskScoreB = b.recommendation.riskLevel === "HIGH" ? 0 : b.recommendation.riskLevel === "MEDIUM" ? 1 : 2;
    if (riskScoreA !== riskScoreB) return riskScoreA - riskScoreB;
    return b.predictedDemand7d - a.predictedDemand7d;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          Tactical Decision Center
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          What should I do next?
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Prioritized operational action plan translating machine learning predictions and SHAP explainability into immediate tasks.
        </p>
      </div>

      {/* Prioritized Recommendation Cards */}
      <div className="space-y-4">
        {prioritized.map((item, index) => {
          const rank = String(index + 1).padStart(2, "0");
          const recom = item.recommendation;
          const isExpanded = expandedId === item.productId;
          const isHigh = recom.riskLevel === "HIGH";
          const isMed = recom.riskLevel === "MEDIUM";

          return (
            <div
              key={item.productId}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
            >
              {/* Card Header Banner */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.productId)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 select-none"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-slate-400">
                    {rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.productName}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      SKU: {item.productId} • Lead Time: {recom.supplierLeadTimeDays} days • Stock: {recom.currentInventory} units
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Action Summary Pill */}
                  <div className="text-right">
                    {recom.recommendedPurchase > 0 ? (
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                        Order {recom.recommendedPurchase} units
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Maintain stock ({recom.currentInventory} units)
                      </span>
                    )}
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      Risk:{" "}
                      <strong
                        className={
                          isHigh
                            ? "text-rose-600"
                            : isMed
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {recom.riskLevel}
                      </strong>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expandable Section: Why Is Nexora Recommending This? */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    Why is Nexora recommending this?
                  </div>

                  {/* Business Explanation First */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      1. Plain-English Business Rationale
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {recom.businessExplanation}
                    </p>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">Current Stock</span>
                        <strong className="text-slate-900 text-sm">{recom.currentInventory} units</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">7-Day Demand</span>
                        <strong className="text-indigo-600 text-sm">{recom.predictedDemand7d} units</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">Lead-Time Sales</span>
                        <strong className="text-slate-900 text-sm">{recom.leadTimeDemand} units</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">Safety Buffer</span>
                        <strong className="text-slate-900 text-sm">{recom.safetyStock} units</strong>
                      </div>
                    </div>
                  </div>

                  {/* Technical Explanation Second (SHAP Waterfall) */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        2. Technical Model Explanation (SHAP Feature Contributions)
                      </div>
                      <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Model: {item.modelUsed}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {item.shapAttributions.map((attr, idx) => {
                        const isPos = attr.direction === "Positive";
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                            <span className="font-medium text-slate-700">
                              {attr.feature} (Val: {attr.featureValue})
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-mono font-bold ${
                                  isPos ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {isPos ? "+" : ""}{attr.shapValue} units
                              </span>
                              <span
                                className={`w-16 text-center py-0.5 rounded text-[10px] font-bold ${
                                  isPos
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {attr.direction}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* SHAP Academic Note */}
                    <p className="text-[11px] text-slate-400 italic mt-3 pt-2 border-t border-slate-100">
                      SHAP shows feature contribution to a model prediction. It quantifies how much each factor
                      shifted expected sales away from baseline moving averages. It does not prove causal relationships.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
