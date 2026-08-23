import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

import { currency, quantityFormat, type Product, type RepresentativeProfile, type StockCount } from "./target-data";

const escapeHtml = (value: string | number) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
const fileStem = (count: StockCount) => `Mavet_Inventory_${count.date}_${count.id.slice(-5)}`;

async function share(uri: string, mimeType: string, title: string) {
  if (Platform.OS === "web") throw new Error("تصدير الجرد متاح من تطبيق الموبايل على الهاتف.");
  if (!(await Sharing.isAvailableAsync())) throw new Error("المشاركة غير متاحة على هذا الجهاز.");
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: mimeType === "application/pdf" ? ".pdf" : "org.openxmlformats.spreadsheetml.sheet" });
}

function exportRows(count: StockCount, products: Product[]) {
  return count.entries.map((entry) => {
    const product = products.find((item) => item.id === entry.productId);
    return { "المنتج": product?.name ?? "منتج محذوف", "العبوة": product?.packSize ?? "", "الكمية": entry.quantity, "تاريخ الصلاحية": entry.expiryDate ?? "", "ملاحظة": entry.note ?? "", "السعر": product?.unitPrice ?? 0, "قيمة المخزون": entry.quantity * (product?.unitPrice ?? 0) };
  });
}

export async function exportInventoryExcel(count: StockCount, products: Product[], representative?: RepresentativeProfile) {
  if (Platform.OS === "web") throw new Error("تصدير الجرد متاح من تطبيق الموبايل على الهاتف.");
  const workbook = XLSX.utils.book_new();
  const rows = exportRows(count, products);
  const stockValue = rows.reduce((sum, row) => sum + Number(row["قيمة المخزون"]), 0);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Mavet Target", "تقرير جرد مخزن"], ["اسم الجرد", count.title], ["تاريخ الجرد", count.date], ["اسم المندوب", representative?.name ?? ""], ["الهاتف", representative?.phone ?? ""], ["المنطقة", representative?.territory ?? ""], ["إجمالي قيمة المخزون", stockValue]]), "الملخص");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "الجرد");
  const uri = `${FileSystem.documentDirectory}${fileStem(count)}.xlsx`;
  await FileSystem.writeAsStringAsync(uri, XLSX.write(workbook, { type: "base64", bookType: "xlsx" }), { encoding: FileSystem.EncodingType.Base64 });
  await share(uri, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "مشاركة جرد Excel");
}

export async function exportInventoryPdf(count: StockCount, products: Product[], representative?: RepresentativeProfile) {
  if (Platform.OS === "web") throw new Error("تصدير الجرد متاح من تطبيق الموبايل على الهاتف.");
  const rows = exportRows(count, products);
  const stockValue = rows.reduce((sum, row) => sum + Number(row["قيمة المخزون"]), 0);
  const representativeLine = representative?.name ? `<p class="sub">المندوب: <strong>${escapeHtml(representative.name)}</strong>${representative.territory ? ` — ${escapeHtml(representative.territory)}` : ""}${representative.phone ? ` — ${escapeHtml(representative.phone)}` : ""}</p>` : "";
  const tableRows = rows.map((row) => `<tr><td>${escapeHtml(row["المنتج"])}</td><td>${escapeHtml(row["العبوة"])}</td><td>${quantityFormat(Number(row["الكمية"]))}</td><td>${escapeHtml(row["تاريخ الصلاحية"]) || "—"}</td><td>${escapeHtml(row["ملاحظة"]) || "—"}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><style>@page{margin:22px}body{font-family:Arial,sans-serif;color:#1e1522;direction:rtl}h1{color:#4A1E53;margin:0 0 5px}.sub{color:#766C79;margin:5px 0}.summary{margin:16px 0;padding:12px;background:#F7F2F8;border-radius:10px;color:#4A1E53;font-weight:bold}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#4A1E53;color:#fff}th,td{border:1px solid #E8DFE9;padding:7px;text-align:right}tr:nth-child(even){background:#FCFAFC}</style></head><body><h1>Mavet Target — جرد مخزن</h1><p class="sub">${escapeHtml(count.title)} • ${escapeHtml(count.date)}</p>${representativeLine}<div class="summary">إجمالي قيمة المخزون: ${currency(stockValue)} ج.م</div><table><thead><tr><th>المنتج</th><th>العبوة</th><th>الكمية</th><th>الصلاحية</th><th>ملاحظة</th></tr></thead><tbody>${tableRows || "<tr><td colspan='5'>لا توجد بنود في هذا الجرد.</td></tr>"}</tbody></table></body></html>`;
  const { uri } = await Print.printToFileAsync({ html, margins: { top: 20, bottom: 20, left: 20, right: 20 } });
  await share(uri, "application/pdf", "مشاركة جرد PDF");
}
