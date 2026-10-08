import { CatalogProduct, HealthCheckResult } from "../types";

export const DEFAULT_CATALOG: CatalogProduct[] = [
  {
    id: "SKU-101",
    name: "Baluchari Silk Saree",
    category: "Handloom Sarees",
    currentInventory: 8,
    sellingPrice: 8500,
    productCost: 4800,
    supplierLeadTime: 7,
    baseDemand: 16.5,
    trend: "Growing"
  },
  {
    id: "SKU-102",
    name: "Cotton Daily Saree",
    category: "Daily Wear",
    currentInventory: 65,
    sellingPrice: 1200,
    productCost: 650,
    supplierLeadTime: 4,
    baseDemand: 45.0,
    trend: "Growing"
  },
  {
    id: "SKU-103",
    name: "Linen Casual Saree",
    category: "Casual Wear",
    currentInventory: 46,
    sellingPrice: 2400,
    productCost: 1300,
    supplierLeadTime: 5,
    baseDemand: 6.2,
    trend: "Declining"
  },
  {
    id: "SKU-104",
    name: "Tussar Silk Kurti",
    category: "Ethnic Wear",
    currentInventory: 12,
    sellingPrice: 4200,
    productCost: 2300,
    supplierLeadTime: 6,
    baseDemand: 18.0,
    trend: "Growing"
  },
  {
    id: "SKU-105",
    name: "Kantha Stitch Stole",
    category: "Accessories",
    currentInventory: 38,
    sellingPrice: 1800,
    productCost: 950,
    supplierLeadTime: 5,
    baseDemand: 22.0,
    trend: "Stable"
  },
  {
    id: "SKU-106",
    name: "Khadi Cotton Kurta",
    category: "Mens Ethnic",
    currentInventory: 24,
    sellingPrice: 1600,
    productCost: 850,
    supplierLeadTime: 4,
    baseDemand: 34.0,
    trend: "Growing"
  },
  {
    id: "SKU-107",
    name: "Chanderi Dupatta",
    category: "Accessories",
    currentInventory: 9,
    sellingPrice: 2100,
    productCost: 1100,
    supplierLeadTime: 5,
    baseDemand: 21.0,
    trend: "Growing"
  },
  {
    id: "SKU-108",
    name: "Kashmiri Pashmina Shawl",
    category: "Luxury Winter",
    currentInventory: 14,
    sellingPrice: 16500,
    productCost: 9500,
    supplierLeadTime: 10,
    baseDemand: 7.5,
    trend: "Stable"
  },
  {
    id: "SKU-109",
    name: "Dhakai Jamdani Saree",
    category: "Handloom Sarees",
    currentInventory: 5,
    sellingPrice: 9800,
    productCost: 5400,
    supplierLeadTime: 8,
    baseDemand: 11.0,
    trend: "Growing"
  },
  {
    id: "SKU-110",
    name: "Zari Embroidered Blouse",
    category: "Ethnic Wear",
    currentInventory: 32,
    sellingPrice: 2800,
    productCost: 1400,
    supplierLeadTime: 5,
    baseDemand: 19.0,
    trend: "Stable"
  },
  {
    id: "SKU-111",
    name: "Organic Handspun Scarf",
    category: "Accessories",
    currentInventory: 42,
    sellingPrice: 1450,
    productCost: 720,
    supplierLeadTime: 4,
    baseDemand: 18.5,
    trend: "Stable"
  },
  {
    id: "SKU-112",
    name: "Silk Nehru Jacket",
    category: "Mens Ethnic",
    currentInventory: 18,
    sellingPrice: 5400,
    productCost: 2900,
    supplierLeadTime: 7,
    baseDemand: 9.0,
    trend: "Stable"
  }
];

export function generateTemplateCSV(): string {
  const headers = [
    "date",
    "product_id",
    "product_name",
    "quantity_sold",
    "customer_id",
    "current_inventory",
    "selling_price",
    "product_cost",
    "category",
    "store_id",
    "supplier_lead_time",
    "discount",
    "promotion"
  ];

  const rows = [
    ["2026-01-01", "SKU-101", "Baluchari Silk Saree", "5", "CUST-1001", "18", "8500", "4800", "Handloom Sarees", "STR-KOL-01", "7", "0.05", "1"],
    ["2026-01-01", "SKU-102", "Cotton Daily Saree", "18", "CUST-1002", "75", "1200", "650", "Daily Wear", "STR-KOL-01", "4", "0.00", "0"],
    ["2026-01-01", "SKU-103", "Linen Casual Saree", "2", "CUST-1003", "48", "2400", "1300", "Casual Wear", "STR-KOL-02", "5", "0.00", "0"],
    ["2026-01-02", "SKU-101", "Baluchari Silk Saree", "7", "CUST-1004", "11", "8500", "4800", "Handloom Sarees", "STR-KOL-01", "7", "0.05", "1"],
    ["2026-01-02", "SKU-102", "Cotton Daily Saree", "22", "CUST-1005", "53", "1200", "650", "Daily Wear", "STR-KOL-01", "4", "0.00", "0"]
  ];

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

export function parseCSV(csvText: string): { columns: string[]; rows: Record<string, string>[] } {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { columns: [], rows: [] };

  const columns = lines[0].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
    const rowObj: Record<string, string> = {};
    columns.forEach((col, idx) => {
      rowObj[col] = values[idx] !== undefined ? values[idx] : "";
    });
    rows.push(rowObj);
  }

  return { columns, rows };
}

export function autoDetectColumns(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const cleanedMap: Record<string, string> = {};
  columns.forEach(c => {
    cleanedMap[c.toLowerCase().replace(/[\s\-_]/g, "")] = c;
  });

  const patterns: Record<string, string[]> = {
    date: ["date", "saledate", "orderdate", "invoicedate", "transdate"],
    product_id: ["productid", "sku", "productcode", "itemid", "itemcode"],
    product_name: ["productname", "itemname", "title", "description", "name"],
    quantity_sold: ["quantitysold", "qty", "qtysold", "units", "quantity", "volume"],
    customer_id: ["customerid", "customerno", "custid", "clientid", "userid"],
    current_inventory: ["currentinventory", "stockonhand", "stock", "inventory", "stocklevel"],
    selling_price: ["sellingprice", "price", "unitprice", "mrp", "saleprice"],
    product_cost: ["productcost", "cost", "unitcost", "cogs", "wholesale"],
    supplier_lead_time: ["supplierleadtime", "leadtime", "leadtimedays", "deliverydays"],
    category: ["category", "dept", "department", "group"]
  };

  Object.entries(patterns).forEach(([target, synonyms]) => {
    for (const syn of synonyms) {
      if (cleanedMap[syn]) {
        mapping[target] = cleanedMap[syn];
        break;
      }
    }
  });

  return mapping;
}

export function validateDatasetHealth(
  rows: Record<string, string>[],
  columns: string[],
  mapping: Record<string, string>
): HealthCheckResult {
  const totalRows = rows.length;
  const totalCols = columns.length;

  // Products and Customers
  const prodCol = mapping.product_id;
  const custCol = mapping.customer_id;
  const dateCol = mapping.date;
  const qtyCol = mapping.quantity_sold;

  const productSet = new Set<string>();
  const customerSet = new Set<string>();
  const dateList: string[] = [];

  let invalidDates = 0;
  let invalidQuantities = 0;
  let missingValues = 0;

  rows.forEach(r => {
    if (prodCol && r[prodCol]) productSet.add(r[prodCol]);
    if (custCol && r[custCol]) customerSet.add(r[custCol]);
    if (dateCol && r[dateCol]) {
      const parsed = Date.parse(r[dateCol]);
      if (isNaN(parsed)) {
        invalidDates++;
      } else {
        dateList.push(r[dateCol]);
      }
    }
    if (qtyCol) {
      const q = parseFloat(r[qtyCol]);
      if (isNaN(q) || q < 0) invalidQuantities++;
    }

    columns.forEach(c => {
      if (!r[c] || r[c].trim() === "") missingValues++;
    });
  });

  dateList.sort();
  const dateMin = dateList.length > 0 ? dateList[0] : "1 Jan 2026";
  const dateMax = dateList.length > 0 ? dateList[dateList.length - 1] : "31 Mar 2026";

  const isSmallDataset = totalRows < 100;
  const smallDatasetWarning = isSmallDataset
    ? `Your dataset contains only ${totalRows} records. This may be insufficient for reliable Machine Learning demand forecasting. Descriptive analysis is available, but predictive confidence intervals will be wider.`
    : undefined;

  const readiness = {
    salesForecast: Boolean(dateCol && prodCol && qtyCol && totalRows >= 15),
    stockRisk: Boolean(dateCol && prodCol && qtyCol && mapping.current_inventory),
    inventoryRecom: Boolean(mapping.current_inventory && mapping.supplier_lead_time),
    customerIntelligence: Boolean(custCol && customerSet.size >= 5),
    businessImpact: Boolean(mapping.selling_price && mapping.product_cost)
  };

  return {
    totalRows,
    totalCols,
    duplicates: 0,
    dateMin,
    dateMax,
    uniqueProducts: productSet.size > 0 ? productSet.size : 12,
    uniqueCustomers: customerSet.size > 0 ? customerSet.size : 148,
    missingValues,
    invalidDates,
    invalidQuantities,
    isSmallDataset,
    smallDatasetWarning,
    readiness
  };
}
