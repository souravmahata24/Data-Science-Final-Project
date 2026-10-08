import React, { useState } from "react";
import { HealthCheckResult } from "../types";
import {
  generateTemplateCSV,
  parseCSV,
  autoDetectColumns,
  validateDatasetHealth
} from "../services/dataService";
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface DataSettingsViewProps {
  dataSource: "demo" | "upload";
  onSetDataSource: (source: "demo" | "upload") => void;
  onApplyUploadedDataset: (rows: Record<string, string>[], mapping: Record<string, string>) => void;
}

export const DataSettingsView: React.FC<DataSettingsViewProps> = ({
  dataSource,
  onSetDataSource,
  onApplyUploadedDataset
}) => {
  const [activeMode, setActiveMode] = useState<"demo" | "upload">(dataSource);
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [parsedCols, setParsedCols] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null);

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "nexora_retail_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvRawText(text);

      const { columns, rows } = parseCSV(text);
      setParsedCols(columns);
      setParsedRows(rows);

      const detected = autoDetectColumns(columns);
      setColumnMapping(detected);

      const health = validateDatasetHealth(rows, columns, detected);
      setHealthCheck(health);
    };
    reader.readAsText(file);
  };

  const handleUpdateMapping = (canonical: string, selectedCol: string) => {
    const updated = { ...columnMapping, [canonical]: selectedCol };
    setColumnMapping(updated);
    if (parsedRows.length > 0) {
      const health = validateDatasetHealth(parsedRows, parsedCols, updated);
      setHealthCheck(health);
    }
  };

  const handleConfirmAndTrain = () => {
    if (parsedRows.length > 0) {
      onApplyUploadedDataset(parsedRows, columnMapping);
      onSetDataSource("upload");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Database className="w-3.5 h-3.5" />
          Data Engineering & Ingestion Layer
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dataset Settings & Validation
        </h2>
        <p className="text-slate-600 mt-1 text-base">
          Configure data source, match canonical fields, perform data health checks, and train machine learning models.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            setActiveMode("demo");
            onSetDataSource("demo");
          }}
          className={`flex-1 p-5 rounded-2xl border text-left transition-all ${
            activeMode === "demo"
              ? "bg-white border-blue-500 ring-2 ring-blue-100 shadow-md"
              : "bg-slate-50 border-slate-200 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Demo Dataset
            </span>
            {activeMode === "demo" && (
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-700">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Pre-loaded realistic 90-day Indian apparel retail catalog (12 handloom & daily-wear SKUs).
          </p>
        </button>

        <button
          onClick={() => setActiveMode("upload")}
          className={`flex-1 p-5 rounded-2xl border text-left transition-all ${
            activeMode === "upload"
              ? "bg-white border-emerald-500 ring-2 ring-emerald-100 shadow-md"
              : "bg-slate-50 border-slate-200 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Upload My Dataset
            </span>
            {activeMode === "upload" && (
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-700">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Upload custom retail transactions in CSV or Excel format with intelligent column detection.
          </p>
        </button>
      </div>

      {/* DEMO MODE VIEW */}
      {activeMode === "demo" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Currently Utilizing Demo Catalog
              </h3>
              <p className="text-xs text-slate-500">
                12 authentic Indian retail items with simulated Poisson transactions, lead times, and margins.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Sample Dataset Template (CSV)
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD MODE VIEW */}
      {activeMode === "upload" && (
        <div className="space-y-6">
          {/* Data Requirements Guide */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                What Data Do I Need?
              </h3>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Download className="w-3.5 h-3.5" />
                Download Example Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="font-bold text-indigo-950 uppercase tracking-wide block mb-1">
                  Required (Sales Forecast)
                </span>
                <p className="text-slate-600">
                  • <code>date</code> (Transaction timestamp)<br />
                  • <code>product_id</code> (SKU / Code)<br />
                  • <code>quantity_sold</code> (Units sold)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-blue-950 uppercase tracking-wide block mb-1">
                  Recommended (Stock & Cost)
                </span>
                <p className="text-slate-600">
                  • <code>customer_id</code> (Customer analysis)<br />
                  • <code>current_inventory</code> (Stockout risk)<br />
                  • <code>selling_price</code> & <code>product_cost</code> (ROI)<br />
                  • <code>supplier_lead_time</code> (Reorders)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wide block mb-1">
                  Optional Enrichers
                </span>
                <p className="text-slate-600">
                  • <code>category</code> (Department breakdown)<br />
                  • <code>store_id</code> (Outlet filter)<br />
                  • <code>discount</code> & <code>promotion</code> (Uplift)
                </p>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-slate-300 text-center hover:border-indigo-500 transition-colors">
            <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">
              Select CSV or Excel Dataset
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Upload your transaction history to train customized machine learning models.
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {/* Column Mapping Section */}
          {parsedCols.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Match Your Columns (Auto-Detected)
              </h3>
              <p className="text-xs text-slate-500">
                Verify that your dataset fields map correctly to Nexora&apos;s canonical pipeline variables.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  { id: "date", label: "Date (Required)" },
                  { id: "product_id", label: "Product ID / SKU (Required)" },
                  { id: "quantity_sold", label: "Quantity Sold (Required)" },
                  { id: "customer_id", label: "Customer ID (Recommended)" },
                  { id: "current_inventory", label: "Current Inventory (Recommended)" },
                  { id: "selling_price", label: "Selling Price ₹ (Recommended)" },
                  { id: "product_cost", label: "Product Cost ₹ (Recommended)" },
                  { id: "supplier_lead_time", label: "Supplier Lead Time (Recommended)" },
                  { id: "category", label: "Category (Optional)" }
                ].map(field => (
                  <div key={field.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block font-bold text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <select
                      value={columnMapping[field.id] || ""}
                      onChange={e => handleUpdateMapping(field.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="">-- Not Available --</option>
                      {parsedCols.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dataset Health Check Results */}
          {healthCheck && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Dataset Health Check
                  </h3>
                  <p className="text-xs text-slate-500">
                    Diagnostics evaluated on {healthCheck.totalRows} records.
                  </p>
                </div>
                {healthCheck.isSmallDataset && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-bold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" /> Small Dataset Warning
                  </span>
                )}
              </div>

              {healthCheck.smallDatasetWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  {healthCheck.smallDatasetWarning}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Total Rows</span>
                  <strong className="text-base text-slate-900">{healthCheck.totalRows}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Date Range</span>
                  <strong className="text-slate-900">{healthCheck.dateMin} &rarr; {healthCheck.dateMax}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Unique SKUs</span>
                  <strong className="text-base text-slate-900">{healthCheck.uniqueProducts}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Unique Customers</span>
                  <strong className="text-base text-slate-900">{healthCheck.uniqueCustomers}</strong>
                </div>
              </div>

              {/* Module Readiness */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Module Availability
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(healthCheck.readiness).map(([mod, isReady]) => (
                    <span
                      key={mod}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${
                        isReady
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isReady ? "✓" : "⚠"} {mod.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConfirmAndTrain}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Train Models on Uploaded Dataset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
