import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Coins,
  Lightbulb,
  Cpu,
  Database,
  FileCode2
} from "lucide-react";

export type NavTab =
  | "overview"
  | "forecast"
  | "inventory"
  | "stock_risk"
  | "customers"
  | "business_impact"
  | "recommendations"
  | "technical"
  | "data_settings"
  | "codebase";

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  dataSource: "demo" | "upload";
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  dataSource
}) => {
  const navItems = [
    { id: "overview" as NavTab, label: "Overview", question: "How is the business performing?", icon: LayoutDashboard },
    { id: "forecast" as NavTab, label: "Sales Forecast", question: "What will sell next?", icon: TrendingUp },
    { id: "inventory" as NavTab, label: "Inventory", question: "How much should I buy?", icon: Package },
    { id: "stock_risk" as NavTab, label: "Stock Risk", question: "Which products may run out?", icon: AlertTriangle },
    { id: "customers" as NavTab, label: "Customers", question: "Which customers should I focus on?", icon: Users },
    { id: "business_impact" as NavTab, label: "Business Impact", question: "How much money could better decisions affect?", icon: Coins },
    { id: "recommendations" as NavTab, label: "Recommendations", question: "What should I do next?", icon: Lightbulb },
    { id: "technical" as NavTab, label: "Technical Insights", question: "How does the model work?", icon: Cpu },
    { id: "data_settings" as NavTab, label: "Data Settings", question: "Configure Data Source & Health", icon: Database },
    { id: "codebase" as NavTab, label: "Python Capstone", question: "Full Streamlit & ML Pipeline Code", icon: FileCode2 }
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-200 sticky top-0 h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md">
            NR
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Nexora Retail</h1>
            <p className="text-xs text-indigo-300 font-medium tracking-wide">
              Predict Smarter. Stock Better. Sell More.
            </p>
          </div>
        </div>

        {/* Data Source Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Data Source:</span>
          {dataSource === "upload" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              🟢 Uploaded Data
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              🔵 Demo Catalog
            </span>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 mt-0.5 shrink-0 ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                }`}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium leading-snug">{item.label}</div>
                <div
                  className={`text-[11px] truncate leading-tight ${
                    isActive ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  {item.question}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 bg-slate-950/40">
        <div className="font-semibold text-slate-300">Applied AI & ML Capstone</div>
        <div>Data Science for Managers</div>
        <div className="text-indigo-400 font-mono">Currency: ₹ Indian Rupees</div>
      </div>
    </aside>
  );
};
