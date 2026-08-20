import AsyncStorage from "@react-native-async-storage/async-storage";

export type Cadence = "daily" | "weekly" | "monthly";

export type QuarterTarget = {
  id: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  salesTarget: number;
  collectionTarget: number;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  unitPrice: number;
  quantityTarget: number;
  createdAt: string;
};

export type Sale = {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  date: string;
  note?: string;
};

export type Collection = {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  note?: string;
};

export type AppData = {
  activeTargetId?: string;
  targets: QuarterTarget[];
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  collections: Collection[];
};

const STORAGE_KEY = "mavet-target-data-v1";

export const EMPTY_DATA: AppData = {
  targets: [],
  customers: [],
  products: [],
  sales: [],
  collections: [],
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function normalizeAppData(value: unknown): AppData {
  const raw = (value ?? {}) as Partial<AppData>;
  return {
    activeTargetId: raw.activeTargetId,
    targets: Array.isArray(raw.targets)
      ? raw.targets.map((target) => ({
          ...target,
          salesTarget: toNumber(target.salesTarget),
          collectionTarget: toNumber(target.collectionTarget),
        }))
      : [],
    customers: Array.isArray(raw.customers) ? raw.customers : [],
    products: Array.isArray(raw.products)
      ? raw.products.map((product) => ({
          ...product,
          unitPrice: toNumber(product.unitPrice),
          quantityTarget: toNumber(product.quantityTarget),
        }))
      : [],
    sales: Array.isArray(raw.sales)
      ? raw.sales.map((sale) => ({
          ...sale,
          quantity: toNumber(sale.quantity),
          unitPrice: toNumber(sale.unitPrice),
          discount: toNumber(sale.discount),
          total: toNumber(sale.total),
        }))
      : [],
    collections: Array.isArray(raw.collections)
      ? raw.collections.map((collection) => ({
          ...collection,
          amount: toNumber(collection.amount),
        }))
      : [],
  };
}

export async function loadAppData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY_DATA;
  try {
    return normalizeAppData(JSON.parse(raw));
  } catch {
    return EMPTY_DATA;
  }
}

export async function storeAppData(data: AppData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function localDate(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function quarterForDate(date = new Date()) {
  return (Math.floor(date.getMonth() / 3) + 1) as QuarterTarget["quarter"];
}

export function quarterDates(target: Pick<QuarterTarget, "year" | "quarter">) {
  const start = new Date(target.year, (target.quarter - 1) * 3, 1);
  const end = new Date(target.year, target.quarter * 3, 0);
  return { start: localDate(start), end: localDate(end) };
}

export function currency(value: number) {
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.max(0, value));
}

export function shortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(date);
}
