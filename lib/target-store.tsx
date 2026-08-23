import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  type AppData,
  type Cadence,
  type CashMovement,
  type Collection,
  type Customer,
  type Product,
  type QuarterTarget,
  type RepresentativeProfile,
  type Sale,
  type StockCount,
  type StockCountEntry,
  mergeCatalogue,
  normalizeAppData,
  EMPTY_DATA,
  loadAppData,
  storeAppData,
} from "@/lib/target-data";

type TargetStore = AppData & {
  isLoaded: boolean;
  activeTarget?: QuarterTarget;
  cadence: Cadence;
  setCadence: (value: Cadence) => void;
  upsertTarget: (target: QuarterTarget) => void;
  setActiveTargetId: (id?: string) => void;
  upsertRepresentative: (profile: RepresentativeProfile) => void;
  upsertCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Sale) => void;
  upsertStockCount: (count: StockCount) => void;
  latestStockForProduct: (productId: string) => { hasCount: boolean; quantity: number; countId?: string; entry?: StockCountEntry };
  addCollection: (collection: Collection) => void;
  setCashOpeningBalance: (amount: number) => void;
  addCashMovement: (movement: CashMovement) => void;
  deleteCashMovement: (id: string) => void;
  deleteSale: (id: string) => void;
  deleteCollection: (id: string) => void;
  restoreAll: (backup: AppData) => void;
  resetAll: () => void;
};

const TargetContext = createContext<TargetStore | undefined>(undefined);

export function TargetProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cadence, setCadence] = useState<Cadence>("daily");

  useEffect(() => {
    loadAppData().then((saved) => {
      setData({ ...saved, products: mergeCatalogue(saved.products) });
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) storeAppData(data);
  }, [data, isLoaded]);

  const api = useMemo<TargetStore>(() => {
    const activeTarget = data.targets.find((target) => target.id === data.activeTargetId) ?? data.targets.at(-1);
    return {
      ...data,
      activeTarget,
      isLoaded,
      cadence,
      setCadence,
      upsertTarget: (target) => {
        setData((current) => ({
          ...current,
          activeTargetId: target.id,
          targets: [...current.targets.filter((item) => item.id !== target.id), target],
        }));
      },
      setActiveTargetId: (id) => setData((current) => ({ ...current, activeTargetId: id })),
      upsertRepresentative: (profile) => setData((current) => ({ ...current, representative: profile })),
      upsertCustomer: (customer) => {
        setData((current) => ({
          ...current,
          customers: [...current.customers.filter((item) => item.id !== customer.id), customer].sort((a, b) => a.name.localeCompare(b.name, "ar")),
        }));
      },
      deleteCustomer: (id) => setData((current) => ({
        ...current,
        customers: current.customers.filter((item) => item.id !== id),
      })),
      upsertProduct: (product) => {
        setData((current) => ({
          ...current,
          products: [...current.products.filter((item) => item.id !== product.id), product].sort((a, b) => a.name.localeCompare(b.name, "ar")),
        }));
      },
      deleteProduct: (id) => setData((current) => ({
        ...current,
        products: current.products.filter((item) => item.id !== id),
      })),
      addSale: (sale) => setData((current) => {
        const latest = [...current.inventoryCounts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
        const entryIndex = latest?.entries.findIndex((entry) => entry.productId === sale.productId) ?? -1;
        if (!latest || entryIndex < 0) return { ...current, sales: [sale, ...current.sales] };
        const entries = latest.entries.map((entry, index) => index === entryIndex ? { ...entry, quantity: Math.max(0, entry.quantity - sale.quantity) } : entry);
        const updatedCount = { ...latest, entries, updatedAt: new Date().toISOString() };
        return { ...current, sales: [{ ...sale, inventoryCountId: latest.id }, ...current.sales], inventoryCounts: current.inventoryCounts.map((count) => count.id === latest.id ? updatedCount : count) };
      }),
      upsertStockCount: (count) => setData((current) => ({ ...current, inventoryCounts: [count, ...current.inventoryCounts.filter((item) => item.id !== count.id)] })),
      latestStockForProduct: (productId) => {
        const latest = [...data.inventoryCounts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
        const entry = latest?.entries.find((item) => item.productId === productId);
        return entry ? { hasCount: true, quantity: entry.quantity, countId: latest?.id, entry } : { hasCount: false, quantity: 0 };
      },
      addCollection: (collection) => setData((current) => ({ ...current, collections: [collection, ...current.collections] })),
      setCashOpeningBalance: (amount) => setData((current) => ({ ...current, cashOpeningBalance: Math.max(0, amount) })),
      addCashMovement: (movement) => setData((current) => ({ ...current, cashMovements: [movement, ...current.cashMovements] })),
      deleteCashMovement: (id) => setData((current) => ({ ...current, cashMovements: current.cashMovements.filter((movement) => movement.id !== id) })),
      deleteSale: (id) => setData((current) => {
        const removed = current.sales.find((item) => item.id === id);
        if (!removed?.inventoryCountId) return { ...current, sales: current.sales.filter((item) => item.id !== id) };
        return {
          ...current,
          sales: current.sales.filter((item) => item.id !== id),
          inventoryCounts: current.inventoryCounts.map((count) => count.id !== removed.inventoryCountId ? count : { ...count, updatedAt: new Date().toISOString(), entries: count.entries.map((entry) => entry.productId === removed.productId ? { ...entry, quantity: entry.quantity + removed.quantity } : entry) }),
        };
      }),
      deleteCollection: (id) => setData((current) => ({ ...current, collections: current.collections.filter((item) => item.id !== id) })),
      restoreAll: (backup) => { const normalized = normalizeAppData(backup); setData({ ...normalized, products: mergeCatalogue(normalized.products) }); },
      resetAll: () => setData(EMPTY_DATA),
    };
  }, [cadence, data, isLoaded]);

  return <TargetContext.Provider value={api}>{children}</TargetContext.Provider>;
}

export function useTargetStore() {
  const value = useContext(TargetContext);
  if (!value) throw new Error("useTargetStore must be used within TargetProvider");
  return value;
}
