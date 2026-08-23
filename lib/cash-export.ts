import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

import { getCashSummary } from "./commissions";
import { currency, type AppData, type RepresentativeProfile } from "./target-data";

type CashRow = { type: string; amount: number; date: string; description: string };

function cashRows(data: AppData): CashRow[] {
  return [
    ...data.collections.map((collection) => ({ type: "تحصيل", amount: collection.amount, date: collection.date, description: collection.saleId ? `تحصيل فاتورة مرتبطة${collection.note ? ` — ${collection.note}` : ""}` : collection.note || "تحصيل مسجل" })),
    ...data.cashMovements.map((movement) => ({ type: movement.type === "deposit" ? "توريد للشركة" : "مصروف", amount: movement.type === "expense" ? -movement.amount : movement.amount, date: movement.date, description: movement.description })),
  ].sort((a, b) => b.date.localeCompare(a.date));
}

async function share(uri: string, mimeType: string, title: string) {
  if (Platform.OS === "web") throw new Error("تصدير الملفات متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة كشف الخزنة.");
  if (!(await Sharing.isAvailableAsync())) throw new Error("المشاركة غير متاحة على هذا الجهاز.");
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: mimeType === "application/pdf" ? ".pdf" : "org.openxmlformats.spreadsheetml.sheet" });
}

export async function exportCashExcel(data: AppData, representative?: RepresentativeProfile) {
  const summary = getCashSummary(data); const rows = cashRows(data); const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Mavet Target", "كشف الخزنة"], ["اسم المندوب", representative?.name ?? ""], ["الرصيد الافتتاحي", summary.openingBalance], ["التحصيلات", summary.collections], ["توريد للشركة", summary.deposits], ["المصروفات", summary.expenses], ["الكاش المتوقع", summary.expectedCash]]), "الملخص");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.map((row) => ({ "التاريخ": row.date, "النوع": row.type, "البيان": row.description, "القيمة": row.amount }))), "الحركات");
  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" }); const uri = `${FileSystem.documentDirectory}Mavet_Cash_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (Platform.OS === "web") throw new Error("تصدير Excel متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة كشف الخزنة.");
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 }); await share(uri, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "مشاركة كشف خزنة Excel");
}

export async function exportCashPdf(data: AppData, representative?: RepresentativeProfile) {
  if (Platform.OS === "web") throw new Error("تصدير PDF متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة كشف الخزنة.");
  const summary = getCashSummary(data); const rows = cashRows(data).map((row) => `<tr><td>${row.date}</td><td>${row.type}</td><td>${row.description.replace(/[&<>]/g, "")}</td><td>${row.amount < 0 ? "−" : "+"}${currency(Math.abs(row.amount))} ج.م</td></tr>`).join("");
  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;color:#1E1522;direction:rtl;padding:18px}h1{color:#4A1E53;margin:0}.sub{color:#766C79;margin:6px 0 18px}.grid{display:flex;gap:8px}.card{flex:1;background:#F7F2F8;border:1px solid #E8DFE9;border-radius:10px;padding:10px}.label{font-size:11px;color:#766C79}.value{font-size:16px;font-weight:bold;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:18px;font-size:11px}th{background:#4A1E53;color:#fff}td,th{border:1px solid #E8DFE9;padding:7px;text-align:right}</style></head><body><h1>Mavet Target — كشف الخزنة</h1><p class="sub">${representative?.name ? `المندوب: ${representative.name}` : ""}</p><div class="grid"><div class="card"><div class="label">رصيد افتتاحي</div><div class="value">${currency(summary.openingBalance)} ج.م</div></div><div class="card"><div class="label">تحصيلات</div><div class="value">${currency(summary.collections)} ج.م</div></div><div class="card"><div class="label">توريد</div><div class="value">${currency(summary.deposits)} ج.م</div></div><div class="card"><div class="label">مصروفات</div><div class="value">${currency(summary.expenses)} ج.م</div></div><div class="card"><div class="label">الكاش المتوقع</div><div class="value">${currency(summary.expectedCash)} ج.م</div></div></div><table><thead><tr><th>التاريخ</th><th>النوع</th><th>البيان</th><th>القيمة</th></tr></thead><tbody>${rows || "<tr><td colspan='4'>لا توجد حركات.</td></tr>"}</tbody></table></body></html>`;
  const { uri } = await Print.printToFileAsync({ html, margins: { top: 20, bottom: 20, left: 20, right: 20 } }); await share(uri, "application/pdf", "مشاركة كشف خزنة PDF");
}
