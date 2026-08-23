import { type AppData, type QuarterTarget, quarterDates } from "./target-data";
import { getTargetMetrics } from "./target-metrics";

export type CommissionSummary = {
  bothTargetsEligible: boolean;
  salesCommission: number;
  collectionCommission: number;
  nobioteKQuantity: number;
  nobioteKValue: number;
  nobioteKCollectedValue: number;
  nobioteKIsCollected: boolean;
  nobioteKRate: number;
  nobioteKCommission: number;
};

const isNobioteK = (name: string) => name.replace(/\s/g, "").toLocaleLowerCase("ar").includes("نوبيوتيك") || name.toLocaleLowerCase().includes("nobiotek");

export function getCommissionSummary(data: AppData, target?: QuarterTarget): CommissionSummary {
  if (!target) return { bothTargetsEligible: false, salesCommission: 0, collectionCommission: 0, nobioteKQuantity: 0, nobioteKValue: 0, nobioteKCollectedValue: 0, nobioteKIsCollected: false, nobioteKRate: 0, nobioteKCommission: 0 };
  const metrics = getTargetMetrics(data, target);
  const { start, end } = quarterDates(target);
  const nobioteKIds = new Set(data.products.filter((product) => isNobioteK(product.name)).map((product) => product.id));
  const nobioteKSold = data.sales.filter((sale) => nobioteKIds.has(sale.productId) && sale.date >= start && sale.date <= end);
  const nobioteKQuantity = nobioteKSold.reduce((sum, sale) => sum + sale.quantity, 0);
  const nobioteKValue = nobioteKSold.reduce((sum, sale) => sum + sale.total, 0);
  const nobioteKSaleIds = new Set(nobioteKSold.map((sale) => sale.id));
  const nobioteKCollectedValue = data.collections.filter((collection) => collection.saleId && nobioteKSaleIds.has(collection.saleId) && collection.date >= start && collection.date <= end).reduce((sum, collection) => sum + collection.amount, 0);
  const nobioteKIsCollected = nobioteKValue > 0 && nobioteKCollectedValue >= nobioteKValue;
  const nobioteKRate = nobioteKQuantity >= 500 ? 50 : nobioteKQuantity >= 250 ? 25 : 0;
  const bothTargetsEligible = metrics.salesProgress >= 80 && metrics.collectionProgress >= 80;
  return {
    bothTargetsEligible,
    salesCommission: bothTargetsEligible ? metrics.salesActual * 0.01 : 0,
    collectionCommission: bothTargetsEligible ? metrics.collectionActual * 0.01 : 0,
    nobioteKQuantity,
    nobioteKValue,
    nobioteKCollectedValue,
    nobioteKIsCollected,
    nobioteKRate,
    nobioteKCommission: nobioteKIsCollected ? nobioteKQuantity * nobioteKRate : 0,
  };
}

export function getCashSummary(data: AppData) {
  const collections = data.collections.reduce((sum, collection) => sum + collection.amount, 0);
  const deposits = data.cashMovements.filter((movement) => movement.type === "deposit").reduce((sum, movement) => sum + movement.amount, 0);
  const expenses = data.cashMovements.filter((movement) => movement.type === "expense").reduce((sum, movement) => sum + movement.amount, 0);
  return { openingBalance: data.cashOpeningBalance, collections, deposits, expenses, expectedCash: data.cashOpeningBalance + collections - deposits - expenses };
}
