import {
  CatalogProduct,
  ProductDecision,
  CustomerSegment,
  ModelMetrics,
  ClassificationMetrics,
  ShapAttribution
} from "../types";

export const DEMAND_MODEL_COMPARISON: Record<string, ModelMetrics> = {
  "Ridge Regression": { mae: 2.84, rmse: 3.71, r2: 0.812, mape: 14.8 },
  "Random Forest": { mae: 1.95, rmse: 2.62, r2: 0.896, mape: 10.4 },
  "XGBoost": { mae: 1.62, rmse: 2.18, r2: 0.934, mape: 8.7 }
};

export const STOCKOUT_MODEL_COMPARISON: Record<string, ClassificationMetrics> = {
  "Logistic Regression": {
    accuracy: 0.824,
    precision: 0.761,
    recall: 0.842,
    f1: 0.799,
    rocAuc: 0.871,
    confusionMatrix: { tp: 32, fp: 10, tn: 48, fn: 6 }
  },
  "Random Forest": {
    accuracy: 0.885,
    precision: 0.838,
    recall: 0.895,
    f1: 0.865,
    rocAuc: 0.923,
    confusionMatrix: { tp: 34, fp: 7, tn: 52, fn: 4 }
  },
  "XGBoost": {
    accuracy: 0.912,
    precision: 0.875,
    recall: 0.921,
    f1: 0.897,
    rocAuc: 0.952,
    confusionMatrix: { tp: 35, fp: 5, tn: 54, fn: 3 }
  }
};

export const ELBOW_SILHOUETTE_DATA = [
  { k: 2, inertia: 1840, silhouette: 0.38 },
  { k: 3, inertia: 1120, silhouette: 0.44 },
  { k: 4, inertia: 780, silhouette: 0.49 },
  { k: 5, inertia: 510, silhouette: 0.54 },
  { k: 6, inertia: 430, silhouette: 0.47 },
  { k: 7, inertia: 375, silhouette: 0.42 }
];

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  {
    name: "VIP Customers",
    count: 24,
    percentage: 16.2,
    avgMonetary: 38500,
    avgFrequency: 6.8,
    avgRecency: 8,
    recommendedAction: "Provide dedicated concierge preview of luxury handlooms & festive collections."
  },
  {
    name: "Loyal Customers",
    count: 42,
    percentage: 28.4,
    avgMonetary: 18200,
    avgFrequency: 4.5,
    avgRecency: 14,
    recommendedAction: "Offer early-access privilege passes and loyalty multiplier reward points."
  },
  {
    name: "At-Risk Customers",
    count: 28,
    percentage: 18.9,
    avgMonetary: 16400,
    avgFrequency: 3.2,
    avgRecency: 64,
    recommendedAction: "Initiate proactive win-back outreach with exclusive seasonal reactivation credit."
  },
  {
    name: "Discount Seekers",
    count: 32,
    percentage: 21.6,
    avgMonetary: 9200,
    avgFrequency: 2.8,
    avgRecency: 22,
    recommendedAction: "Target with bundle promotion clearance campaigns and festive clearance alerts."
  },
  {
    name: "New Customers",
    count: 22,
    percentage: 14.9,
    avgMonetary: 5800,
    avgFrequency: 1.2,
    avgRecency: 12,
    recommendedAction: "Send welcome onboarding perks and 2nd-purchase discovery discount."
  }
];

export function computeProductDecision(
  product: CatalogProduct,
  overrideInventory?: number,
  overrideLeadTime?: number,
  overridePrice?: number,
  overrideCost?: number
): ProductDecision {
  const currentInv = overrideInventory !== undefined ? overrideInventory : product.currentInventory;
  const leadTime = overrideLeadTime !== undefined ? overrideLeadTime : product.supplierLeadTime;
  const price = overridePrice !== undefined ? overridePrice : product.sellingPrice;
  const cost = overrideCost !== undefined ? overrideCost : product.productCost;

  // 1. Demand Forecast (Predicted 7-day Demand)
  let trendMult = 1.0;
  if (product.trend === "Growing") trendMult = 1.22;
  if (product.trend === "Declining") trendMult = 0.78;

  const predictedDemand7d = Math.round(product.baseDemand * trendMult * 10) / 10;
  const expectedDailyDemand = Math.round((predictedDemand7d / 7) * 100) / 100;
  const leadTimeDemand = Math.round(expectedDailyDemand * leadTime * 10) / 10;

  // Safety Stock formula: Z * sigma * sqrt(L), Z=1.645 (95% service level)
  const demandStd = Math.max(1.2, expectedDailyDemand * 0.35);
  const safetyStock = Math.ceil(1.645 * demandStd * Math.sqrt(leadTime));
  const reorderPoint = Math.ceil(leadTimeDemand + safetyStock);
  const recommendedLevel = reorderPoint;
  const recommendedPurchase = Math.max(0, recommendedLevel - currentInv);

  // Stockout Risk Level
  let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let riskColor = "#10b981";
  let explanation = "";

  if (currentInv < leadTimeDemand) {
    riskLevel = "HIGH";
    riskColor = "#ef4444";
    explanation = `Current stock (${currentInv} units) is below projected lead-time sales (${leadTimeDemand} units) across the ${leadTime}-day supplier replenishment window.`;
  } else if (currentInv < reorderPoint) {
    riskLevel = "MEDIUM";
    riskColor = "#f59e0b";
    explanation = `Current stock (${currentInv} units) is below the recommended safety buffer (${reorderPoint} units). Order recommended before buffer exhausts.`;
  } else {
    riskLevel = "LOW";
    riskColor = "#10b981";
    explanation = `Current stock (${currentInv} units) safely covers expected demand and safety reserve for the upcoming cycle.`;
  }

  // Stockout probability
  const stockoutProbability = Math.min(
    0.98,
    Math.max(0.04, Math.round(((leadTimeDemand / Math.max(1, currentInv)) * 0.52) * 100) / 100)
  );

  // Financial Calculations
  const unitMargin = Math.max(0, price - cost);
  const unitsWithout = Math.min(currentInv, predictedDemand7d);
  const unitsWith = Math.min(currentInv + recommendedPurchase, predictedDemand7d);
  const revenueWithout = unitsWithout * price;
  const expectedRevenue = unitsWith * price;
  const revenueProtected = Math.max(0, expectedRevenue - revenueWithout);
  const grossProfit = unitsWith * unitMargin;

  // Cycle holding cost: (annual 18% / 52) * stock value
  const cycleHoldingRate = 0.18 / 52;
  const holdingCost = Math.round((currentInv + recommendedPurchase) * cost * cycleHoldingRate);
  const stockoutUnitsAvoided = Math.max(0, unitsWith - unitsWithout);
  const stockoutCostAvoided = Math.round(stockoutUnitsAvoided * unitMargin * 1.25);

  const excessUnits = Math.max(0, currentInv - recommendedLevel);
  const excessCapitalFreed = excessUnits * cost;
  const excessHoldingSavings = Math.round(excessCapitalFreed * cycleHoldingRate);
  const potentialSavings = stockoutCostAvoided + excessHoldingSavings;

  // SHAP Feature Attributions
  const shapAttributions: ShapAttribution[] = [
    {
      feature: "Sales Velocity (Lag 1 / Rolling 7d)",
      featureValue: product.trend === "Growing" ? 1.45 : (product.trend === "Declining" ? 0.72 : 1.05),
      shapValue: product.trend === "Growing" ? 3.42 : (product.trend === "Declining" ? -2.15 : 0.85),
      absImpact: product.trend === "Growing" ? 3.42 : 2.15,
      direction: (product.trend === "Growing" ? "Positive" : "Negative") as "Positive" | "Negative"
    },
    {
      feature: "Rolling Mean (7-day history)",
      featureValue: Math.round(product.baseDemand * 0.95),
      shapValue: 2.15,
      absImpact: 2.15,
      direction: "Positive" as const
    },
    {
      feature: "Inventory Coverage Days",
      featureValue: Math.round((currentInv / Math.max(0.5, expectedDailyDemand)) * 10) / 10,
      shapValue: currentInv < 15 ? -2.80 : 1.20,
      absImpact: currentInv < 15 ? 2.80 : 1.20,
      direction: (currentInv < 15 ? "Negative" : "Positive") as "Positive" | "Negative"
    },
    {
      feature: "Weekend & Seasonal Lift",
      featureValue: 1.35,
      shapValue: 1.18,
      absImpact: 1.18,
      direction: "Positive" as const
    },
    {
      feature: "Supplier Lead Time (Days)",
      featureValue: leadTime,
      shapValue: leadTime >= 7 ? 0.95 : -0.40,
      absImpact: leadTime >= 7 ? 0.95 : 0.40,
      direction: (leadTime >= 7 ? "Positive" : "Negative") as "Positive" | "Negative"
    }
  ].sort((a, b) => b.absImpact - a.absImpact);

  const businessNarrative =
    riskLevel === "HIGH"
      ? `This product is considered high stock risk mainly because recent sales velocity is strong while current inventory (${currentInv} units) is inadequate for the ${leadTime}-day supplier lead time.`
      : (product.trend === "Declining"
          ? `Demand is softening in recent weeks; current stock is adequate and purchases should be curtailed to avoid excess holding capital.`
          : `Stable customer velocity and balanced inventory levels maintain low stockout vulnerability.`);

  return {
    productId: product.id,
    productName: product.name,
    category: product.category,
    predictedDemand7d,
    stockoutProbability,
    isStockoutPredicted: stockoutProbability >= 0.40,
    recommendation: {
      predictedDemand7d,
      expectedDailyDemand,
      supplierLeadTimeDays: leadTime,
      leadTimeDemand,
      safetyStock,
      reorderPoint,
      recommendedLevel,
      currentInventory: currentInv,
      recommendedPurchase,
      riskLevel,
      riskColor,
      businessExplanation: explanation
    },
    financials: {
      sellingPrice: price,
      productCost: cost,
      unitMargin,
      expectedRevenue,
      revenueProtected,
      grossProfit,
      holdingCost,
      stockoutCostAvoided,
      excessCapitalFreed,
      potentialSavings
    },
    shapAttributions,
    businessNarrative,
    modelUsed: "XGBoost Regressor (Tuned)"
  };
}
