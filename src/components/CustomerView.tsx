import React from "react";
import { CustomerSegment } from "../types";
import { formatINR } from "../utils/currency";
import { Users, Crown, HeartHandshake, AlertCircle, Tag, Sparkles } from "lucide-react";

interface CustomerViewProps {
  segments: CustomerSegment[];
}

export const CustomerView: React.FC<CustomerViewProps> = ({ segments }) => {
  const totalCustomers = segments.reduce((sum, s) => sum + s.count, 0);
  const vipSegment = segments.find(s => s.name.includes("VIP")) || segments[0];
  const atRiskSegment = segments.find(s => s.name.includes("At-Risk")) || segments[2];
  const overallAvgSpending = Math.round(
    segments.reduce((sum, s) => sum + s.avgMonetary * s.count, 0) / Math.max(1, totalCustomers)
  );

  const getSegmentIcon = (name: string) => {
    if (name.includes("VIP")) return <Crown className="w-5 h-5 text-amber-500" />;
    if (name.includes("Loyal")) return <HeartHandshake className="w-5 h-5 text-indigo-500" />;
    if (name.includes("At-Risk")) return <AlertCircle className="w-5 h-5 text-rose-500" />;
    if (name.includes("Discount")) return <Tag className="w-5 h-5 text-emerald-500" />;
    return <Sparkles className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Users className="w-3.5 h-3.5" />
          Customer Intelligence & K-Means Segmentation
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Which customers should I focus on?
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          RFM behavioral clustering grouping customers into actionable purchasing segments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Active Customers
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalCustomers}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Profiled across 90-day transactions
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            VIP Customers
          </div>
          <div className="text-3xl font-black text-amber-600 tracking-tight">
            {vipSegment?.count || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Generates {vipSegment?.percentage}% of repeat retail volume
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Average Customer Spend
          </div>
          <div className="text-3xl font-black text-indigo-600 tracking-tight">
            {formatINR(overallAvgSpending)}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            VIP Spend: {formatINR(vipSegment?.avgMonetary || 0)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            At-Risk Customers
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">
            {atRiskSegment?.count || 0}
          </div>
          <div className="text-xs text-rose-600 mt-2 font-medium">
            High past spend • Long recency inactivity
          </div>
        </div>
      </div>

      {/* Business Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
        Customers have been grouped into <strong>5 meaningful purchasing patterns</strong> using
        standardized RFM feature vectors and K-Means clustering ($K=5$ selected via Silhouette analysis).
      </div>

      {/* Customer Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getSegmentIcon(seg.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{seg.name}</h3>
                    <span className="text-xs text-slate-500">
                      {seg.count} buyers ({seg.percentage}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* RFM Metrics */}
              <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Average Spend (M):</span>
                  <span className="font-bold text-slate-900">{formatINR(seg.avgMonetary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Order Frequency (F):</span>
                  <span className="font-bold text-slate-900">{seg.avgFrequency} orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Recency Gap (R):</span>
                  <span className="font-bold text-slate-900">{seg.avgRecency} days ago</span>
                </div>
              </div>
            </div>

            {/* Strategic Action */}
            <div className="mt-4 pt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Recommended Strategy:</span>
              <p className="text-slate-600 leading-relaxed">{seg.recommendedAction}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
