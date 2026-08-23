import AsyncStorage from "@react-native-async-storage/async-storage";

export type Cadence = "daily" | "weekly" | "monthly";

export type QuarterTarget = { id: string; year: number; quarter: 1 | 2 | 3 | 4; salesTarget: number; collectionTarget: number; createdAt: string };
export type Customer = { id: string; name: string; note?: string; createdAt: string };
export type RepresentativeProfile = { name: string; phone?: string; territory?: string };

export type Product = {
  id: string;
  name: string;
  packSize?: string;
  category?: "imported" | "egyptian" | "custom";
  unitPrice: number;
  quantityTarget: number;
  createdAt: string;
};

export type Sale = { id: string; customerId: string; productId: string; quantity: number; unitPrice: number; discount: number; total: number; date: string; note?: string; inventoryCountId?: string };
export type Collection = { id: string; customerId: string; amount: number; date: string; note?: string };
export type StockCountEntry = { productId: string; quantity: number; expiryDate?: string; note?: string };
export type StockCount = { id: string; title: string; date: string; entries: StockCountEntry[]; createdAt: string; updatedAt: string };

export type AppData = {
  activeTargetId?: string;
  representative?: RepresentativeProfile;
  targets: QuarterTarget[];
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  collections: Collection[];
  inventoryCounts: StockCount[];
};

export const PRODUCT_CATALOGUE: Array<Pick<Product, "name" | "packSize" | "category">> = [
  { name: "نوبيوتيك", packSize: "1 لتر", category: "imported" },
  { name: "بيو ڤيتا سي 100%", packSize: "1 كجم", category: "imported" },
  { name: "بيو ڤيتا ك20%", packSize: "500 جم", category: "imported" },
  { name: "ماڤي تو إكس", packSize: "1 لتر", category: "egyptian" },
  { name: "ماڤيت د3 فورت", packSize: "1 لتر", category: "egyptian" },
  { name: "ليڤو كيد فورت", packSize: "1 لتر", category: "egyptian" },
  { name: "ليڤو كيد", packSize: "1 لتر", category: "egyptian" },
  { name: "ماڤي كوكس", packSize: "500 مل", category: "egyptian" },
  { name: "ماڤي نو ستريس", packSize: "500 جم", category: "egyptian" },
  { name: "ماڤي نو ستريس", packSize: "1000 جم", category: "egyptian" },
  { name: "ماڤي شيل", packSize: "1 لتر", category: "egyptian" },
];

const STORAGE_KEY = "mavet-target-data-v1";
export const EMPTY_DATA: AppData = { targets: [], customers: [], products: [], sales: [], collections: [], inventoryCounts: [] };
const toNumber = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
const isCategory = (value: unknown): value is Product["category"] => value === "imported" || value === "egyptian" || value === "custom";

export function localDate(date = new Date()) { const timezoneOffset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10); }

export function normalizeAppData(value: unknown): AppData {
  const raw = (value ?? {}) as Partial<AppData>;
  return {
    activeTargetId: raw.activeTargetId,
    representative: raw.representative && typeof raw.representative.name === "string" ? { name: raw.representative.name, phone: raw.representative.phone, territory: raw.representative.territory } : undefined,
    targets: Array.isArray(raw.targets) ? raw.targets.map((target) => ({ ...target, salesTarget: toNumber(target.salesTarget), collectionTarget: toNumber(target.collectionTarget) })) : [],
    customers: Array.isArray(raw.customers) ? raw.customers : [],
    products: Array.isArray(raw.products) ? raw.products.map((product) => ({ ...product, packSize: typeof product.packSize === "string" ? product.packSize : undefined, category: isCategory(product.category) ? product.category : "custom", unitPrice: toNumber(product.unitPrice), quantityTarget: toNumber(product.quantityTarget) })) : [],
    sales: Array.isArray(raw.sales) ? raw.sales.map((sale) => ({ ...sale, quantity: toNumber(sale.quantity), unitPrice: toNumber(sale.unitPrice), discount: toNumber(sale.discount), total: toNumber(sale.total) })) : [],
    collections: Array.isArray(raw.collections) ? raw.collections.map((collection) => ({ ...collection, amount: toNumber(collection.amount) })) : [],
    inventoryCounts: Array.isArray(raw.inventoryCounts) ? raw.inventoryCounts.map((count) => ({ ...count, title: typeof count.title === "string" ? count.title : "جرد مخزن", date: typeof count.date === "string" ? count.date : localDate(), createdAt: typeof count.createdAt === "string" ? count.createdAt : new Date().toISOString(), updatedAt: typeof count.updatedAt === "string" ? count.updatedAt : new Date().toISOString(), entries: Array.isArray(count.entries) ? count.entries.map((entry) => ({ productId: String(entry.productId ?? ""), quantity: toNumber(entry.quantity), expiryDate: typeof entry.expiryDate === "string" ? entry.expiryDate : undefined, note: typeof entry.note === "string" ? entry.note : undefined })) : [] })) : [],
  };
}

export function mergeCatalogue(products: Product[]) {
  const key = (name: string, packSize?: string) => `${name.trim().toLocaleLowerCase("ar-EG")}|${(packSize ?? "").trim().toLocaleLowerCase("ar-EG")}`;
  const existing = new Set(products.map((product) => key(product.name, product.packSize)));
  const createdAt = new Date().toISOString();
  const additions = PRODUCT_CATALOGUE.filter((product) => !existing.has(key(product.name, product.packSize))).map((product, index) => ({ id: `catalogue-${index + 1}`, ...product, unitPrice: 0, quantityTarget: 0, createdAt }));
  return [...products, ...additions].sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export async function loadAppData(): Promise<AppData> { const raw = await AsyncStorage.getItem(STORAGE_KEY); if (!raw) return EMPTY_DATA; try { return normalizeAppData(JSON.parse(raw)); } catch { return EMPTY_DATA; } }
export async function storeAppData(data: AppData) { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
export function uid(prefix: string) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
export function quarterForDate(date = new Date()) { return (Math.floor(date.getMonth() / 3) + 1) as QuarterTarget["quarter"]; }
export function quarterDates(target: Pick<QuarterTarget, "year" | "quarter">) { const start = new Date(target.year, (target.quarter - 1) * 3, 1); const end = new Date(target.year, target.quarter * 3, 0); return { start: localDate(start), end: localDate(end) }; }
export function currency(value: number) { return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Math.max(0, value)); }
export function quantityFormat(value: number) { return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Math.max(0, value)); }
export function shortDate(value: string) { const date = new Date(`${value}T12:00:00`); return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "short" }).format(date); }
