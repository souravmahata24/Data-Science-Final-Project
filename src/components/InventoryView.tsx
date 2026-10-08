import React, { useState, useEffect } from "react";
import { CatalogProduct, ProductDecision } from "../types";
import { formatINR } from "../utils/currency";
import { Package, ShieldAlert, CheckCircle2, Sliders, RefreshCw, Layers } from "lucide-react";
import { computeProductDecision } from "../services/mlEngine";

interface InventoryViewProps {
  catalog: CatalogProduct[];
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  catalog,
  selectedProductId,
  onSelectProduct
}) => {
  const currentProduct = catalog.find(p => p.id === selectedProductId) || catalog[0];

  // Interactive Assumption State
  const [currentStock, setCurrentStock] = useState<number>(currentProduct.currentInventory);
  const [leadTime, setLeadTime] = useState<number>(currentProduct.supplierLeadTime);
  const [sellingPrice, setSellingPrice] = useState<number>(currentProduct.sellingPrice);
  const [productCost, setProductCost] = useState<number>(currentProduct.productCost);
  const [holdingRate, setHoldingRate] = useState<number>(18); // 18% annual

  // Sync state if product dropdown changes
  useEffect(() => {
    setCurrentStock(currentProduct.currentInventory);
    setLeadTime(currentProduct.supplierLeadTime);
    setSellingPrice(currentProduct.sellingPrice);
    setProductCost(currentProduct.productCost);
  }, [selectedProductId, currentProduct]);

  // Real-time recalculated decision
  const decision: ProductDecision = computeProductDecision(
    currentProduct,
    currentStock,
    leadTime,
    sellingPrice,
    productCost
  );

  const recom = decision.recommendation;
  const fin = decision.financials;

  const isHighRisk = recom.riskLevel === "HIGH";
  const isMediumRisk = recom.riskLevel === "MEDIUM";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Package className="w-3.5 h-3.5" />
          Deterministic Decision Layer
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How much should I buy?
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Converting machine learning demand forecasts into precise, risk-adjusted purchase orders.
        </p>
      </div>

      {/* Main Grid: Parameters on Left, Dominant Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Inventory Parameters & Costs
            </h3>
            <button
              onClick={() => {
                setCurrentStock(currentProduct.currentInventory);
                setLeadTime(currentProduct.supplierLeadTime);
                setSellingPrice(currentProduct.sellingPrice);
                setProductCost(currentProduct.productCost);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={e => onSelectProduct(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {catalog.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Current Stock on Hand
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={e => setCurrentStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400">Warehouse stock</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Supplier Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={leadTime}
                onChange={e => setLeadTime(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400">Order transit duration</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                min="1"
                value={sellingPrice}
                onChange={e => setSellingPrice(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400">MRP to customer</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Product Cost (₹)
              </label>
              <input
                type="number"
                min="1"
                value={productCost}
                onChange={e => setProductCost(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400">Procurement COGS</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Annual Holding Cost Rate</span>
              <span className="text-indigo-600">{holdingRate}% per year</span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              value={holdingRate}
              onChange={e => setHoldingRate(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Reflects warehouse space, insurance, and working capital interest (~{((holdingRate / 52)).toFixed(2)}%/week)
            </span>
          </div>
        </div>

        {/* Right Column: Dominant Recommended Purchase & Formula Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dominant Visual Recommendation Card */}
          <div
            className={`rounded-3xl p-8 border-2 shadow-md transition-all text-center relative overflow-hidden ${
              recom.recommendedPurchase > 0
                ? isHighRisk
                  ? "bg-gradient-to-b from-rose-50 via-white to-rose-50/30 border-rose-300"
                  : "bg-gradient-to-b from-amber-50 via-white to-amber-50/30 border-amber-300"
                : "bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30 border-emerald-300"
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-white/80 border shadow-xs">
              {recom.recommendedPurchase > 0 ? (
                <span className="text-rose-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Reorder Triggered
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sufficient Stock
                </span>
              )}
            </div>

            <div className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Recommended Purchase
            </div>

            <div className="text-6xl font-black text-slate-900 tracking-tight my-2">
              {recom.recommendedPurchase}{" "}
              <span className="text-2xl font-bold text-slate-500">Units</span>
            </div>

            <div className="text-sm font-semibold text-slate-700">
              Estimated purchase commitment:{" "}
              <span className="text-indigo-600 font-bold">
                {formatINR(recom.recommendedPurchase * productCost)}
              </span>
            </div>

            {/* Risk badge banner */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
              <span>
                Risk Level:{" "}
                <strong
                  className={
                    isHighRisk
                      ? "text-rose-600"
                      : isMediumRisk
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }
                >
                  {recom.riskLevel}
                </strong>
              </span>
              <span>•</span>
              <span>
                Lead Time: <strong>{leadTime} days</strong>
              </span>
              <span>•</span>
              <span>
                Service Level: <strong>95% (Z=1.645)</strong>
              </span>
            </div>
          </div>

          {/* Mathematical Step-by-Step Breakdown Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Formula Calculation Ladder
            </h4>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600">Expected 7-Day Demand</span>
                <span className="font-bold text-slate-900">{recom.predictedDemand7d} units</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600">Daily Demand Run-Rate (Demand / 7)</span>
                <span className="font-bold text-slate-900">{recom.expectedDailyDemand} units/day</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600">Lead-Time Demand (Daily × {leadTime}d)</span>
                <span className="font-bold text-slate-900">{recom.leadTimeDemand} units</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600">Safety Stock Buffer (Z × σ × √L)</span>
                <span className="font-bold text-indigo-600">+{recom.safetyStock} units</span>
              </div>
              <div className="py-2.5 flex justify-between items-center bg-slate-50 px-3 rounded-lg">
                <span className="font-bold text-slate-900">Recommended Stock Level (Reorder Point)</span>
                <span className="font-black text-indigo-600 text-base">{recom.recommendedLevel} units</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600">Current Stock on Hand</span>
                <span className="font-bold text-slate-900">-{recom.currentInventory} units</span>
              </div>
            </div>
          </div>

          {/* Plain-English Business Rationale */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">
              Managerial Decision Summary
            </h4>
            <p className="text-sm leading-relaxed text-slate-200">
              &ldquo;You currently have <strong>{recom.currentInventory} units</strong>, while expected demand (
              {recom.predictedDemand7d} units) and safety stock ({recom.safetyStock} units) indicate that
              approximately <strong>{recom.recommendedLevel} units</strong> should be available across the{" "}
              {leadTime}-day replenishment period. We therefore recommend purchasing{" "}
              <strong className="text-amber-400">{recom.recommendedPurchase} additional units</strong>.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
