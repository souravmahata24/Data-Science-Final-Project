import React from "react";
import { ProductDecision } from "../types";
import { formatINR } from "../utils/currency";
import {
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  PiggyBank,
  ArrowRight,
  TrendingDown,
  Sparkles
} from "lucide-react";

interface OverviewViewProps {
  decisions: ProductDecision[];
  onNavigateTo: (tab: string, productId?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  decisions,
  onNavigateTo
}) => {
  const highRiskItems = decisions.filter(d => d.recommendation.riskLevel === "HIGH");
  const mediumRiskItems = decisions.filter(d => d.recommendation.riskLevel === "MEDIUM");
  const strongDemandItems = [...decisions].sort((a, b) => b.predictedDemand7d - a.predictedDemand7d).slice(0, 3);
  const slowMovingItems = decisions.filter(d => d.predictedDemand7d < 10).slice(0, 2);

  const totalExpectedSalesINR = decisions.reduce(
    (acc, d) => acc + d.predictedDemand7d * d.financials.sellingPrice,
    0
  );
  const totalRevenueProtectedINR = decisions.reduce(
    (acc, d) => acc + d.financials.revenueProtected,
    0
  );
  const totalPotentialSavingsINR = decisions.reduce(
    (acc, d) => acc + d.financials.potentialSavings,
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Executive Decision Support
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How is the business performing?
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Real-time synthesis of machine learning demand forecasts, stockout risks, and inventory economics.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Expected Sales (7 Days)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {formatINR(totalExpectedSalesINR)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <span>Sum across {decisions.length} catalog products</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Products at Stock Risk
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">
            {highRiskItems.length + mediumRiskItems.length}
          </div>
          <div className="text-xs text-rose-600 mt-2 font-medium">
            {highRiskItems.length} critical • {mediumRiskItems.length} warning
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Revenue Protected
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">
            {formatINR(totalRevenueProtectedINR)}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Lost sales avoided through reorders
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Potential Inventory Savings
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">
            {formatINR(totalPotentialSavingsINR)}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Stockout penalties + holding reduction
          </div>
        </div>
      </div>

      {/* What Needs Your Attention? */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              What Needs Your Attention?
            </h3>
            <p className="text-sm text-slate-500">
              High-priority signals generated by machine learning models converted into immediate manager actions.
            </p>
          </div>
          <button
            onClick={() => onNavigateTo("recommendations")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            View all recommendations
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: High Stock Risk */}
          <div className="bg-gradient-to-b from-rose-50/70 to-white rounded-2xl p-6 border border-rose-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 uppercase tracking-wide">
                High Stock Risk
              </span>
              <AlertOctagon className="w-5 h-5 text-rose-500" />
            </div>
            {highRiskItems.length > 0 ? (
              <div>
                <h4 className="text-lg font-bold text-slate-900">{highRiskItems[0].productName}</h4>
                <p className="text-xs text-slate-500 mb-3">{highRiskItems[0].category} • {highRiskItems[0].productId}</p>
                <div className="bg-white/80 rounded-xl p-3 border border-rose-100 mb-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Current Stock:</span>
                    <span className="font-semibold text-rose-600">{highRiskItems[0].recommendation.currentInventory} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected 7d Demand:</span>
                    <span className="font-semibold text-slate-800">{highRiskItems[0].predictedDemand7d} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplier Lead Time:</span>
                    <span className="font-semibold text-slate-800">{highRiskItems[0].recommendation.supplierLeadTimeDays} days</span>
                  </div>
                </div>
                <div className="bg-rose-600 text-white rounded-xl p-3 text-center mb-3">
                  <div className="text-[11px] font-medium text-rose-100 uppercase">Recommended Action</div>
                  <div className="text-lg font-extrabold">Order {highRiskItems[0].recommendation.recommendedPurchase} units</div>
                </div>
                <button
                  onClick={() => onNavigateTo("inventory", highRiskItems[0].productId)}
                  className="w-full text-xs font-semibold text-rose-700 hover:text-rose-800 py-1.5 text-center flex items-center justify-center gap-1"
                >
                  Inspect Inventory Engine &rarr;
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No urgent stockout alerts at this moment.</p>
            )}
          </div>

          {/* Card 2: Strong Demand */}
          <div className="bg-gradient-to-b from-indigo-50/70 to-white rounded-2xl p-6 border border-indigo-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                Strong Demand
              </span>
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
            {strongDemandItems.length > 0 ? (
              <div>
                <h4 className="text-lg font-bold text-slate-900">{strongDemandItems[0].productName}</h4>
                <p className="text-xs text-slate-500 mb-3">{strongDemandItems[0].category} • {strongDemandItems[0].productId}</p>
                <div className="bg-white/80 rounded-xl p-3 border border-indigo-100 mb-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Projected 7d Sales:</span>
                    <span className="font-semibold text-indigo-700">{strongDemandItems[0].predictedDemand7d} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Revenue:</span>
                    <span className="font-semibold text-slate-800">{formatINR(strongDemandItems[0].predictedDemand7d * strongDemandItems[0].financials.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Velocity Driver:</span>
                    <span className="font-semibold text-slate-800">{strongDemandItems[0].shapAttributions[0]?.feature || "High repeat sales"}</span>
                  </div>
                </div>
                <div className="bg-indigo-600 text-white rounded-xl p-3 text-center mb-3">
                  <div className="text-[11px] font-medium text-indigo-100 uppercase">Recommended Action</div>
                  <div className="text-lg font-extrabold">Maintain {strongDemandItems[0].recommendation.recommendedLevel} units buffer</div>
                </div>
                <button
                  onClick={() => onNavigateTo("forecast", strongDemandItems[0].productId)}
                  className="w-full text-xs font-semibold text-indigo-700 hover:text-indigo-800 py-1.5 text-center flex items-center justify-center gap-1"
                >
                  View Demand Forecast &rarr;
                </button>
              </div>
            ) : null}
          </div>

          {/* Card 3: Slow Moving */}
          <div className="bg-gradient-to-b from-amber-50/70 to-white rounded-2xl p-6 border border-amber-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                Slow Moving
              </span>
              <TrendingDown className="w-5 h-5 text-amber-500" />
            </div>
            {slowMovingItems.length > 0 ? (
              <div>
                <h4 className="text-lg font-bold text-slate-900">{slowMovingItems[0].productName}</h4>
                <p className="text-xs text-slate-500 mb-3">{slowMovingItems[0].category} • {slowMovingItems[0].productId}</p>
                <div className="bg-white/80 rounded-xl p-3 border border-amber-100 mb-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Current Inventory:</span>
                    <span className="font-semibold text-slate-800">{slowMovingItems[0].recommendation.currentInventory} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected 7d Sales:</span>
                    <span className="font-semibold text-amber-700">{slowMovingItems[0].predictedDemand7d} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage:</span>
                    <span className="font-semibold text-slate-800">
                      {Math.round(slowMovingItems[0].recommendation.currentInventory / Math.max(0.5, slowMovingItems[0].recommendation.expectedDailyDemand))} days
                    </span>
                  </div>
                </div>
                <div className="bg-amber-600 text-white rounded-xl p-3 text-center mb-3">
                  <div className="text-[11px] font-medium text-amber-100 uppercase">Recommended Action</div>
                  <div className="text-lg font-extrabold">Halt purchases / Reposition</div>
                </div>
                <button
                  onClick={() => onNavigateTo("inventory", slowMovingItems[0].productId)}
                  className="w-full text-xs font-semibold text-amber-700 hover:text-amber-800 py-1.5 text-center flex items-center justify-center gap-1"
                >
                  Review Holding Costs &rarr;
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Inventory turns are balanced across lines.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
