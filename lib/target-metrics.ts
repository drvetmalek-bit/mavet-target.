import { type AppData, type Cadence, type QuarterTarget, quarterDates } from "./target-data";

export type TargetMetrics = {
  salesActual: number;
  collectionActual: number;
  salesRemaining: number;
  collectionRemaining: number;
  salesProgress: number;
  collectionProgress: number;
  daysRemaining: number;
  periodsRemaining: number;
  salesRequired: number;
  collectionRequired: number;
};

export function getTargetMetrics(data: AppData, target?: QuarterTarget, cadence: Cadence = "daily", now = new Date()): TargetMetrics {
  if (!target) {
    return { salesActual: 0, collectionActual: 0, salesRemaining: 0, collectionRemaining: 0, salesProgress: 0, collectionProgress: 0, daysRemaining: 0, periodsRemaining: 0, salesRequired: 0, collectionRequired: 0 };
  }
  const { start, end } = quarterDates(target);
  const today = now.toISOString().slice(0, 10);
  const salesActual = data.sales.filter((sale) => sale.date >= start && sale.date <= end).reduce((sum, sale) => sum + sale.total, 0);
  const collectionActual = data.collections.filter((collection) => collection.date >= start && collection.date <= end).reduce((sum, collection) => sum + collection.amount, 0);
  const salesRemaining = Math.max(0, target.salesTarget - salesActual);
  const collectionRemaining = Math.max(0, target.collectionTarget - collectionActual);
  const endAt = new Date(`${end}T23:59:59`);
  const startAt = new Date(`${start}T00:00:00`);
  const reference = now < startAt ? startAt : now;
  const daysRemaining = Math.max(0, Math.ceil((endAt.getTime() - reference.getTime()) / 86_400_000));
  const periodsRemaining = cadence === "daily" ? Math.max(1, daysRemaining) : cadence === "weekly" ? Math.max(1, Math.ceil(daysRemaining / 7)) : Math.max(1, Math.ceil(daysRemaining / 30));
  return {
    salesActual,
    collectionActual,
    salesRemaining,
    collectionRemaining,
    salesProgress: target.salesTarget > 0 ? Math.min(100, (salesActual / target.salesTarget) * 100) : 0,
    collectionProgress: target.collectionTarget > 0 ? Math.min(100, (collectionActual / target.collectionTarget) * 100) : 0,
    daysRemaining,
    periodsRemaining,
    salesRequired: salesRemaining / periodsRemaining,
    collectionRequired: collectionRemaining / periodsRemaining,
  };
}

export function productQuantity(data: AppData, productId: string, target?: QuarterTarget) {
  if (!target) return 0;
  const { start, end } = quarterDates(target);
  return data.sales.filter((sale) => sale.productId === productId && sale.date >= start && sale.date <= end).reduce((sum, sale) => sum + sale.quantity, 0);
}
