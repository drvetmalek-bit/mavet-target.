import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  type AppData,
  type Cadence,
  type Collection,
  type Customer,
  type Product,
  type QuarterTarget,
  type RepresentativeProfile,
  type Sale,
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
  addCollection: (collection: Collection) => void;
  deleteSale: (id: string) => void;
  deleteCollection: (id: string) => void;
  resetAll: () => void;
};

const TargetContext = createContext<TargetStore | undefined>(undefined);

export function TargetProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cadence, setCadence] = useState<Cadence>("daily");

  useEffect(() => {
    loadAppData().then((saved) => {
      setData(saved);
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
      addSale: (sale) => setData((current) => ({ ...current, sales: [sale, ...current.sales] })),
      addCollection: (collection) => setData((current) => ({ ...current, collections: [collection, ...current.collections] })),
      deleteSale: (id) => setData((current) => ({ ...current, sales: current.sales.filter((item) => item.id !== id) })),
      deleteCollection: (id) => setData((current) => ({ ...current, collections: current.collections.filter((item) => item.id !== id) })),
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
