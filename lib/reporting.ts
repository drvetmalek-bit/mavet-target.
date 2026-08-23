import { type AppData, type QuarterTarget, type RepresentativeProfile, quarterDates } from "./target-data";

export type ReportCustomerRow = {
  id: string;
  name: string;
  sales: number;
  collections: number;
};

export type ReportProductRow = {
  id: string;
  name: string;
  unitPrice: number;
  salesValue: number;
  quantitySold: number;
  quantityTarget: number;
  unitsRemaining: number | null;
};

export type ReportTransaction = {
  id: string;
  type: "sale" | "collection";
  date: string;
  party: string;
  detail: string;
  amount: number;
};

export type MonthlyPerformance = {
  key: string;
  label: string;
  sales: number;
  collections: number;
};

export type TargetReport = {
  start: string;
  end: string;
  title: string;
  salesActual: number;
  collectionActual: number;
  cashGap: number;
  fastSales: number;
  fastCollections: number;
  salesTarget?: number;
  collectionTarget?: number;
  representative?: RepresentativeProfile;
  monthly: MonthlyPerformance[];
  customers: ReportCustomerRow[];
  products: ReportProductRow[];
  transactions: ReportTransaction[];
};

export function isValidDateRange(start: string, end: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && start <= end;
}

export function buildTargetReport(data: AppData, start: string, end: string, activeTarget?: QuarterTarget): TargetReport {
  const sales = data.sales.filter((sale) => sale.date >= start && sale.date <= end);
  const collections = data.collections.filter((collection) => collection.date >= start && collection.date <= end);
  const customerName = (id: string) => data.customers.find((customer) => customer.id === id)?.name ?? "إدخال سريع";
  const productName = (id: string) => data.products.find((product) => product.id === id)?.name ?? "إدخال سريع";
  const isActiveQuarter = activeTarget ? (() => { const range = quarterDates(activeTarget); return range.start === start && range.end === end; })() : false;
  const customers = data.customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    sales: sales.filter((sale) => sale.customerId === customer.id).reduce((sum, sale) => sum + sale.total, 0),
    collections: collections.filter((collection) => collection.customerId === customer.id).reduce((sum, collection) => sum + collection.amount, 0),
  })).filter((customer) => customer.sales > 0 || customer.collections > 0).sort((a, b) => (b.sales + b.collections) - (a.sales + a.collections));
  const products = data.products.map((product) => {
    const productSales = sales.filter((sale) => sale.productId === product.id);
    const quantitySold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    return {
      id: product.id,
      name: product.name,
      unitPrice: product.unitPrice,
      salesValue: productSales.reduce((sum, sale) => sum + sale.total, 0),
      quantitySold,
      quantityTarget: product.quantityTarget,
      unitsRemaining: product.quantityTarget > 0 ? Math.max(0, product.quantityTarget - quantitySold) : null,
    };
  }).sort((a, b) => b.salesValue - a.salesValue || a.name.localeCompare(b.name, "ar"));
  const transactions: ReportTransaction[] = [
    ...sales.map((sale) => ({ id: sale.id, type: "sale" as const, date: sale.date, party: customerName(sale.customerId), detail: productName(sale.productId), amount: sale.total })),
    ...collections.map((collection) => ({ id: collection.id, type: "collection" as const, date: collection.date, party: customerName(collection.customerId), detail: collection.note || "تحصيل", amount: collection.amount })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const salesActual = sales.reduce((sum, sale) => sum + sale.total, 0);
  const collectionActual = collections.reduce((sum, collection) => sum + collection.amount, 0);
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const monthly: MonthlyPerformance[] = [];
  for (let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1); cursor <= endDate; cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    monthly.push({ key, label: new Intl.DateTimeFormat("ar-EG", { month: "short" }).format(cursor), sales: sales.filter((sale) => sale.date.startsWith(key)).reduce((sum, sale) => sum + sale.total, 0), collections: collections.filter((collection) => collection.date.startsWith(key)).reduce((sum, collection) => sum + collection.amount, 0) });
  }
  return {
    start,
    end,
    title: `تقرير من ${start} إلى ${end}`,
    salesActual,
    collectionActual,
    cashGap: salesActual - collectionActual,
    fastSales: sales.filter((sale) => !sale.customerId && !sale.productId).reduce((sum, sale) => sum + sale.total, 0),
    fastCollections: collections.filter((collection) => !collection.customerId).reduce((sum, collection) => sum + collection.amount, 0),
    salesTarget: isActiveQuarter ? activeTarget?.salesTarget : undefined,
    collectionTarget: isActiveQuarter ? activeTarget?.collectionTarget : undefined,
    representative: data.representative,
    monthly,
    customers,
    products,
    transactions,
  };
}
