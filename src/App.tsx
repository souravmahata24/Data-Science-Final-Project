import React, { useState, useMemo } from "react";
import { Navigation, NavTab } from "./components/Navigation";
import { OverviewView } from "./components/OverviewView";
import { ForecastView } from "./components/ForecastView";
import { InventoryView } from "./components/InventoryView";
import { StockRiskView } from "./components/StockRiskView";
import { CustomerView } from "./components/CustomerView";
import { BusinessImpactView } from "./components/BusinessImpactView";
import { RecommendationsView } from "./components/RecommendationsView";
import { TechnicalView } from "./components/TechnicalView";
import { DataSettingsView } from "./components/DataSettingsView";
import { CodebaseExplorerView } from "./components/CodebaseExplorerView";

import { DEFAULT_CATALOG } from "./services/dataService";
import { computeProductDecision, CUSTOMER_SEGMENTS } from "./services/mlEngine";
import { CatalogProduct, ProductDecision } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [dataSource, setDataSource] = useState<"demo" | "upload">("demo");
  const [catalog, setCatalog] = useState<CatalogProduct[]>(DEFAULT_CATALOG);
  const [selectedProductId, setSelectedProductId] = useState<string>(DEFAULT_CATALOG[0].id);

  // Compute decisions across entire active catalog
  const decisions: ProductDecision[] = useMemo(() => {
    return catalog.map(p => computeProductDecision(p));
  }, [catalog]);

  const handleNavigateTo = (tab: string, productId?: string) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setCurrentTab(tab as NavTab);
  };

  const getDecisionForProduct = (id: string): ProductDecision => {
    const prod = catalog.find(p => p.id === id) || catalog[0];
    return computeProductDecision(prod);
  };

  // Upload handler converting raw CSV rows into catalog items
  const handleApplyUploadedDataset = (
    rows: Record<string, string>[],
    mapping: Record<string, string>
  ) => {
    const prodCol = mapping.product_id;
    const nameCol = mapping.product_name || prodCol;
    const catCol = mapping.category;
    const qtyCol = mapping.quantity_sold;
    const invCol = mapping.current_inventory;
    const priceCol = mapping.selling_price;
    const costCol = mapping.product_cost;
    const leadCol = mapping.supplier_lead_time;

    // Aggregate by product
    const prodMap = new Map<string, {
      name: string;
      category: string;
      totalQty: number;
      count: number;
      inventory: number;
      price: number;
      cost: number;
      lead: number;
    }>();

    rows.forEach(r => {
      const pid = r[prodCol] || "SKU-UNKNOWN";
      const pname = (nameCol && r[nameCol]) || pid;
      const cat = (catCol && r[catCol]) || "General";
      const q = parseFloat(r[qtyCol] || "1") || 1;
      const inv = parseFloat((invCol && r[invCol]) || "20") || 20;
      const price = parseFloat((priceCol && r[priceCol]) || "2000") || 2000;
      const cost = parseFloat((costCol && r[costCol]) || "1100") || 1100;
      const lead = parseFloat((leadCol && r[leadCol]) || "5") || 5;

      if (!prodMap.has(pid)) {
        prodMap.set(pid, {
          name: pname,
          category: cat,
          totalQty: q,
          count: 1,
          inventory: inv,
          price,
          cost,
          lead
        });
      } else {
        const existing = prodMap.get(pid)!;
        existing.totalQty += q;
        existing.count += 1;
        existing.inventory = inv; // latest inventory
      }
    });

    const newCatalog: CatalogProduct[] = [];
    prodMap.forEach((val, id) => {
      const avgWeekly = Math.max(2, Math.round((val.totalQty / Math.max(1, val.count)) * 7 * 10) / 10);
      newCatalog.push({
        id,
        name: val.name,
        category: val.category,
        currentInventory: Math.round(val.inventory),
        sellingPrice: Math.round(val.price),
        productCost: Math.round(val.cost),
        supplierLeadTime: Math.round(val.lead),
        baseDemand: avgWeekly,
        trend: avgWeekly > 15 ? "Growing" : (avgWeekly < 5 ? "Declining" : "Stable")
      });
    });

    if (newCatalog.length > 0) {
      setCatalog(newCatalog);
      setSelectedProductId(newCatalog[0].id);
      setDataSource("upload");
      setCurrentTab("overview");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        dataSource={dataSource}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-10 h-auto">
        {currentTab === "overview" && (
          <OverviewView
            decisions={decisions}
            onNavigateTo={handleNavigateTo}
          />
        )}

        {currentTab === "forecast" && (
          <ForecastView
            catalog={catalog}
            selectedProductId={selectedProductId}
            onSelectProduct={setSelectedProductId}
            getDecision={getDecisionForProduct}
          />
        )}

        {currentTab === "inventory" && (
          <InventoryView
            catalog={catalog}
            selectedProductId={selectedProductId}
            onSelectProduct={setSelectedProductId}
          />
        )}

        {currentTab === "stock_risk" && (
          <StockRiskView
            decisions={decisions}
            onSelectProductForInventory={id => handleNavigateTo("inventory", id)}
          />
        )}

        {currentTab === "customers" && (
          <CustomerView segments={CUSTOMER_SEGMENTS} />
        )}

        {currentTab === "business_impact" && (
          <BusinessImpactView decisions={decisions} />
        )}

        {currentTab === "recommendations" && (
          <RecommendationsView decisions={decisions} />
        )}

        {currentTab === "technical" && <TechnicalView />}

        {currentTab === "data_settings" && (
          <DataSettingsView
            dataSource={dataSource}
            onSetDataSource={setDataSource}
            onApplyUploadedDataset={handleApplyUploadedDataset}
          />
        )}

        {currentTab === "codebase" && <CodebaseExplorerView />}
      </main>
    </div>
  );
}
