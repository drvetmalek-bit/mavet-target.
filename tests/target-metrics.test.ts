import { describe, expect, it } from "vitest";

import { normalizeAppData, type AppData, type QuarterTarget } from "../lib/target-data";
import { getTargetMetrics, productQuantity } from "../lib/target-metrics";

const target: QuarterTarget = {
  id: "q1-2026",
  year: 2026,
  quarter: 1,
  salesTarget: 1_000,
  collectionTarget: 800,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const data: AppData = {
  activeTargetId: target.id,
  targets: [target],
  customers: [{ id: "c1", name: "عميل ١", createdAt: "2026-01-01T00:00:00.000Z" }],
  products: [{ id: "p1", name: "منتج ١", unitPrice: 50, quantityTarget: 20, createdAt: "2026-01-01T00:00:00.000Z" }],
  sales: [
    { id: "s1", customerId: "c1", productId: "p1", quantity: 8, unitPrice: 50, discount: 0, total: 400, date: "2026-02-10" },
    { id: "s2", customerId: "c1", productId: "p1", quantity: 3, unitPrice: 50, discount: 0, total: 150, date: "2026-04-02" },
  ],
  collections: [
    { id: "c1", customerId: "c1", amount: 200, date: "2026-02-11" },
    { id: "c2", customerId: "c1", amount: 100, date: "2026-04-03" },
  ],
};

describe("quarterly target calculations", () => {
  it("excludes transactions outside the active quarter and calculates daily requirements", () => {
    const metrics = getTargetMetrics(data, target, "daily", new Date("2026-03-01T12:00:00"));
    expect(metrics.salesActual).toBe(400);
    expect(metrics.collectionActual).toBe(200);
    expect(metrics.salesRemaining).toBe(600);
    expect(metrics.collectionRemaining).toBe(600);
    expect(metrics.daysRemaining).toBe(31);
    expect(metrics.salesRequired).toBeCloseTo(600 / 31, 8);
    expect(metrics.collectionRequired).toBeCloseTo(600 / 31, 8);
  });

  it("converts the target gap into weekly and monthly guidance", () => {
    const weekly = getTargetMetrics(data, target, "weekly", new Date("2026-03-01T12:00:00"));
    const monthly = getTargetMetrics(data, target, "monthly", new Date("2026-03-01T12:00:00"));
    expect(weekly.periodsRemaining).toBe(5);
    expect(weekly.salesRequired).toBe(120);
    expect(monthly.periodsRemaining).toBe(2);
    expect(monthly.collectionRequired).toBe(300);
  });

  it("calculates product quantity only from sales inside the active quarter", () => {
    expect(productQuantity(data, "p1", target)).toBe(8);
  });

  it("counts fast entries without a customer or product in the active target", () => {
    const withFastEntries: AppData = {
      ...data,
      sales: [...data.sales, { id: "quick-sale", customerId: "", productId: "", quantity: 0, unitPrice: 250, discount: 0, total: 250, date: "2026-03-02", note: "إدخال سريع" }],
      collections: [...data.collections, { id: "quick-collection", customerId: "", amount: 300, date: "2026-03-02", note: "إدخال سريع" }],
    };
    const metrics = getTargetMetrics(withFastEntries, target, "daily", new Date("2026-03-03T12:00:00"));
    expect(metrics.salesActual).toBe(650);
    expect(metrics.collectionActual).toBe(500);
    expect(metrics.salesProgress).toBe(65);
    expect(metrics.collectionProgress).toBeCloseTo(62.5, 8);
  });

  it("normalizes malformed numeric data before it is saved locally", () => {
    const normalized = normalizeAppData({
      targets: [{ ...target, salesTarget: "1250", collectionTarget: "not-a-number" }],
      products: [{ id: "p2", name: "منتج", unitPrice: "75.5", quantityTarget: "oops", createdAt: target.createdAt }],
      sales: [{ id: "s3", customerId: "c1", productId: "p2", quantity: "2", unitPrice: "75.5", discount: "5", total: "146", date: "2026-02-20" }],
      collections: [],
    });
    expect(normalized.targets[0].salesTarget).toBe(1250);
    expect(normalized.targets[0].collectionTarget).toBe(0);
    expect(normalized.products[0].unitPrice).toBe(75.5);
    expect(normalized.products[0].quantityTarget).toBe(0);
    expect(normalized.sales[0].total).toBe(146);
  });
});
