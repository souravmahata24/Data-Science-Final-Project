import React, { useState, useMemo } from "react";
import { CustomerSegment, CustomerRecord } from "../types";
import { formatINR } from "../utils/currency";
import { DEMO_CUSTOMERS } from "../services/customerData";
import {
  Users,
  Crown,
  HeartHandshake,
  AlertCircle,
  Tag,
  Sparkles,
  Search,
  Filter,
  Download,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  ArrowUpDown,
  CheckCircle2,
  X,
  ExternalLink
} from "lucide-react";

interface CustomerViewProps {
  segments: CustomerSegment[];
}

export const CustomerView: React.FC<CustomerViewProps> = ({ segments }) => {
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"monetary" | "recency" | "frequency" | "aov">("monetary");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

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

  const getSegmentBadgeStyle = (segment: string) => {
    switch (segment) {
      case "VIP Customers":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "At-Risk Customers":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "Loyal Customers":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Discount Seekers":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default:
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  // Filter and sort actual individual customer records
  const filteredCustomers = useMemo(() => {
    return DEMO_CUSTOMERS.filter(cust => {
      const matchesSegment =
        selectedSegmentFilter === "ALL" || cust.segment === selectedSegmentFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        cust.id.toLowerCase().includes(query) ||
        cust.name.toLowerCase().includes(query) ||
        cust.city.toLowerCase().includes(query) ||
        cust.favoriteProduct.toLowerCase().includes(query);

      return matchesSegment && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "monetary") return b.totalMonetary - a.totalMonetary;
      if (sortBy === "recency") return a.recencyDays - b.recencyDays; // lowest recency (most recent) first
      if (sortBy === "frequency") return b.orderFrequency - a.orderFrequency;
      if (sortBy === "aov") return b.avgOrderValue - a.avgOrderValue;
      return 0;
    });
  }, [selectedSegmentFilter, searchQuery, sortBy]);

  // Export filtered customer list as CSV
  const handleExportCSV = () => {
    const headers = [
      "Customer ID",
      "Customer Name",
      "Segment",
      "City",
      "Total Spend (INR)",
      "Order Count",
      "Avg Order Value",
      "Recency (Days)",
      "Last Purchase Date",
      "Discount Sensitivity (%)",
      "Favorite Product",
      "Recommended Action"
    ];

    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.segment}"`,
      `"${c.city}"`,
      c.totalMonetary,
      c.orderFrequency,
      c.avgOrderValue,
      c.recencyDays,
      c.lastPurchaseDate,
      `${c.discountSensitivityPct}%`,
      `"${c.favoriteProduct}"`,
      `"${c.customerAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexora_customers_${selectedSegmentFilter.toLowerCase().replace(/\s+/g, "_")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-auto">
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
          RFM behavioral clustering and actual customer accounts profiled by purchasing value and churn risk.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 h-auto">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm h-auto">
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

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm h-auto">
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

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm h-auto">
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

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm h-auto">
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

      {/* Segment Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto">
        {segments.map((seg, idx) => {
          const isSelected = selectedSegmentFilter === seg.name;
          return (
            <div
              key={idx}
              onClick={() => setSelectedSegmentFilter(isSelected ? "ALL" : seg.name)}
              className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer h-auto flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-200 shadow-md"
                  : "border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
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
                  {isSelected && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      Filtering
                    </span>
                  )}
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

              {/* Action */}
              <div className="mt-4 pt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Recommended Strategy:</span>
                <p className="text-slate-600 leading-relaxed">{seg.recommendedAction}</p>
                <div className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  Click to view {seg.name} accounts &rarr;
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ACTUAL CUSTOMER DETAILS SECTION (NEW REQUIREMENT) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 h-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                Individual Customer Accounts & Segment Details
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                {filteredCustomers.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inspect actual transactional records, lifetime value in ₹, last purchase recency, and specific intervention playbooks for VIP, At-Risk, and Loyal shoppers.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Customer List (CSV)
          </button>
        </div>

        {/* Filter Pills, Search Bar & Sorting */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Segment Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "ALL", label: `All Customers (${DEMO_CUSTOMERS.length})` },
              { id: "VIP Customers", label: "👑 VIP" },
              { id: "At-Risk Customers", label: "🚨 At-Risk" },
              { id: "Loyal Customers", label: "🤝 Loyal" },
              { id: "Discount Seekers", label: "🏷️ Discount Seekers" },
              { id: "New Customers", label: "✨ New" }
            ].map(pill => {
              const active = selectedSegmentFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedSegmentFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Search and Sort controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by ID, name, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value="monetary">Sort by Total Spend (₹)</option>
                <option value="recency">Sort by Recency (Recent first)</option>
                <option value="frequency">Sort by Frequency (Orders)</option>
                <option value="aov">Sort by Avg Order Value (AOV)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real Customer Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-3">Segment</th>
                <th className="py-3 px-3 text-right">Total Spend (₹)</th>
                <th className="py-3 px-3 text-center">Orders</th>
                <th className="py-3 px-3 text-right">Recency (R)</th>
                <th className="py-3 px-3 text-right">AOV (₹)</th>
                <th className="py-3 px-3">Favorite Line</th>
                <th className="py-3 px-4">Managerial Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No customer accounts matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const isAtRisk = cust.segment === "At-Risk Customers";
                  const isVIP = cust.segment === "VIP Customers";

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className={`hover:bg-indigo-50/40 transition-colors cursor-pointer ${
                        isAtRisk ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {cust.name}
                          {isVIP && <Crown className="w-3.5 h-3.5 text-amber-500 inline" />}
                          {isAtRisk && <AlertCircle className="w-3.5 h-3.5 text-rose-500 inline" />}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {cust.id} • {cust.city}
                        </div>
                      </td>

                      {/* Segment badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getSegmentBadgeStyle(
                            cust.segment
                          )}`}
                        >
                          {cust.segment}
                        </span>
                      </td>

                      {/* Total Spend in ₹ */}
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {formatINR(cust.totalMonetary)}
                      </td>

                      {/* Frequency */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {cust.orderFrequency}
                      </td>

                      {/* Recency */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-bold ${
                            cust.recencyDays > 50
                              ? "text-rose-600"
                              : cust.recencyDays < 10
                              ? "text-emerald-600"
                              : "text-slate-800"
                          }`}
                        >
                          {cust.recencyDays} days
                        </span>
                        <div className="text-[10px] text-slate-400">{cust.lastPurchaseDate}</div>
                      </td>

                      {/* AOV */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        {formatINR(cust.avgOrderValue)}
                      </td>

                      {/* Favorite Product */}
                      <td className="py-3 px-3 text-slate-700 font-medium max-w-[140px] truncate">
                        {cust.favoriteProduct}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-slate-600 max-w-[260px]">
                        <div
                          className={`p-1.5 rounded-lg text-[11px] leading-tight ${
                            isAtRisk
                              ? "bg-rose-100/70 text-rose-900 font-medium"
                              : isVIP
                              ? "bg-amber-50 text-amber-900"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {cust.customerAction}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CUSTOMER PROFILE MODAL / DRAWER */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center absolute right-5 top-5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg">
                {selectedCustomer.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCustomer.id} • {selectedCustomer.city}
                </p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSegmentBadgeStyle(
                    selectedCustomer.segment
                  )}`}
                >
                  {selectedCustomer.segment}
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Spending (M)
                </span>
                <span className="text-lg font-black text-slate-900">
                  {formatINR(selectedCustomer.totalMonetary)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Order Frequency (F)
                </span>
                <span className="text-lg font-black text-slate-900">
                  {selectedCustomer.orderFrequency} Orders
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Last Purchase (R)
                </span>
                <span
                  className={`text-lg font-black ${
                    selectedCustomer.recencyDays > 50 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {selectedCustomer.recencyDays} Days Ago
                </span>
                <span className="text-[10px] text-slate-400 block">{selectedCustomer.lastPurchaseDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Avg Order Value (AOV)
                </span>
                <span className="text-lg font-black text-indigo-600">
                  {formatINR(selectedCustomer.avgOrderValue)}
                </span>
              </div>
            </div>

            {/* Behavioral Preferences */}
            <div className="space-y-2 text-xs border-y border-slate-100 py-3 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Favorite Product:</span>
                <strong className="text-slate-900">{selectedCustomer.favoriteProduct}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <strong className="text-slate-900">{selectedCustomer.favoriteCategory}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount Sensitivity:</span>
                <strong className="text-slate-900">{selectedCustomer.discountSensitivityPct}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone (Masked):</span>
                <span className="font-mono text-slate-700">{selectedCustomer.phoneMasked}</span>
              </div>
            </div>

            {/* Specific Retention Action */}
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 mb-5">
              <span className="font-bold text-indigo-900 block mb-1">
                Targeted Managerial Playbook:
              </span>
              <p className="leading-relaxed">{selectedCustomer.customerAction}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Close Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
