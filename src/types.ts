export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  currentInventory: number;
  sellingPrice: number;
  productCost: number;
  supplierLeadTime: number;
  baseDemand: number;
  trend: "Growing" | "Stable" | "Declining";
}

export interface ShapAttribution {
  feature: string;
  featureValue: number;
  shapValue: number;
  absImpact: number;
  direction: "Positive" | "Negative";
}

export interface InventoryRecommendation {
  predictedDemand7d: number;
  expectedDailyDemand: number;
  supplierLeadTimeDays: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedLevel: number;
  currentInventory: number;
  recommendedPurchase: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  riskColor: string;
  businessExplanation: string;
}

export interface FinancialImpact {
  sellingPrice: number;
  productCost: number;
  unitMargin: number;
  expectedRevenue: number;
  revenueProtected: number;
  grossProfit: number;
  holdingCost: number;
  stockoutCostAvoided: number;
  excessCapitalFreed: number;
  potentialSavings: number;
}

export interface ProductDecision {
  productId: string;
  productName: string;
  category: string;
  predictedDemand7d: number;
  stockoutProbability: number;
  isStockoutPredicted: boolean;
  recommendation: InventoryRecommendation;
  financials: FinancialImpact;
  shapAttributions: ShapAttribution[];
  businessNarrative: string;
  modelUsed: string;
}

export interface CustomerSegment {
  name: string;
  count: number;
  percentage: number;
  avgMonetary: number;
  avgFrequency: number;
  avgRecency: number;
  recommendedAction: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  city: string;
  phoneMasked: string;
  segment: "VIP Customers" | "Loyal Customers" | "At-Risk Customers" | "Discount Seekers" | "New Customers";
  recencyDays: number;
  lastPurchaseDate: string;
  orderFrequency: number;
  totalMonetary: number;
  avgOrderValue: number;
  discountSensitivityPct: number;
  favoriteProduct: string;
  favoriteCategory: string;
  riskStatus: "High Risk" | "Medium Risk" | "Healthy" | "New";
  customerAction: string;
}

export interface HealthCheckResult {
  totalRows: number;
  totalCols: number;
  duplicates: number;
  dateMin: string;
  dateMax: string;
  uniqueProducts: number;
  uniqueCustomers: number;
  missingValues: number;
  invalidDates: number;
  invalidQuantities: number;
  isSmallDataset: boolean;
  smallDatasetWarning?: string;
  readiness: {
    salesForecast: boolean;
    stockRisk: boolean;
    inventoryRecom: boolean;
    customerIntelligence: boolean;
    businessImpact: boolean;
  };
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
}
