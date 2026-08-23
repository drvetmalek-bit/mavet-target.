import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

import { currency } from "./target-data";
import { type TargetReport } from "./reporting";

const htmlEscape = (value: string | number) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
const fileStem = (report: TargetReport) => `Mavet_Target_${report.start}_${report.end}`;

function reportHtml(report: TargetReport) {
  const money = (value: number) => `${currency(value)} ج.م`;
  const rows = report.products.map((product) => `<tr><td>${htmlEscape(product.name)}</td><td>${money(product.salesValue)}</td><td>${product.quantitySold.toLocaleString("ar-EG")}</td><td>${product.unitsRemaining === null ? "—" : product.unitsRemaining.toLocaleString("ar-EG")}</td></tr>`).join("");
  const customers = report.customers.map((customer) => `<tr><td>${htmlEscape(customer.name)}</td><td>${money(customer.sales)}</td><td>${money(customer.collections)}</td></tr>`).join("");
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8" /><style>@page { margin: 20px; } body{font-family:Arial,sans-serif;color:#1E1522;direction:rtl}h1{color:#4A1E53;margin:0 0 4px}h2{font-size:16px;color:#4A1E53;margin:22px 0 8px}.sub{color:#766C79;margin:0}.grid{display:flex;gap:10px;margin:18px 0}.card{flex:1;background:#F7F2F8;border:1px solid #E8DFE9;border-radius:10px;padding:11px}.label{font-size:11px;color:#766C79}.value{font-weight:bold;font-size:16px;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#4A1E53;color:#fff}th,td{border:1px solid #E8DFE9;padding:7px;text-align:right}tr:nth-child(even){background:#FCFAFC}</style></head><body><h1>Mavet Target</h1><p class="sub">${htmlEscape(report.title)}</p><div class="grid"><div class="card"><div class="label">المحقق من البيع</div><div class="value">${money(report.salesActual)}</div></div><div class="card"><div class="label">المحقق من التحصيل</div><div class="value">${money(report.collectionActual)}</div></div><div class="card"><div class="label">فرق البيع والتحصيل</div><div class="value">${money(report.cashGap)}</div></div></div>${report.salesTarget !== undefined ? `<p class="sub">تارجت البيع: ${money(report.salesTarget)} — تارجت التحصيل: ${money(report.collectionTarget ?? 0)}</p>` : ""}<h2>أداء المنتجات</h2><table><thead><tr><th>المنتج</th><th>قيمة البيع</th><th>الوحدات المباعة</th><th>الوحدات المتبقية</th></tr></thead><tbody>${rows || "<tr><td colspan='4'>لا توجد بيانات منتجات للفترة المحددة.</td></tr>"}</tbody></table><h2>أداء العملاء</h2><table><thead><tr><th>العميل</th><th>البيع</th><th>التحصيل</th></tr></thead><tbody>${customers || "<tr><td colspan='3'>لا توجد حركات عملاء للفترة المحددة.</td></tr>"}</tbody></table></body></html>`;
}

async function shareNativeFile(uri: string, mimeType: string, title: string) {
  if (Platform.OS === "web") throw new Error("تصدير الملفات متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة التقرير.");
  if (!(await Sharing.isAvailableAsync())) throw new Error("المشاركة غير متاحة على هذا الجهاز.");
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: mimeType === "application/pdf" ? ".pdf" : "org.openxmlformats.spreadsheetml.sheet" });
}

export async function exportReportExcel(report: TargetReport) {
  const workbook = XLSX.utils.book_new();
  const summary = [["Mavet Target", report.title], ["المحقق من البيع", report.salesActual], ["المحقق من التحصيل", report.collectionActual], ["فرق البيع والتحصيل", report.cashGap], ["مبيعات إدخال سريع", report.fastSales], ["تحصيلات إدخال سريع", report.fastCollections]];
  if (report.salesTarget !== undefined) { summary.push(["تارجت البيع", report.salesTarget], ["تارجت التحصيل", report.collectionTarget ?? 0]); }
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), "الملخص");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.products.map((product) => ({ "المنتج": product.name, "سعر الوحدة": product.unitPrice, "قيمة البيع": product.salesValue, "الوحدات المباعة": product.quantitySold, "تارجت الوحدات": product.quantityTarget || "", "الوحدات المتبقية": product.unitsRemaining ?? "" }))), "المنتجات");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.customers.map((customer) => ({ "العميل": customer.name, "البيع": customer.sales, "التحصيل": customer.collections }))), "العملاء");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.transactions.map((item) => ({ "التاريخ": item.date, "النوع": item.type === "sale" ? "بيع" : "تحصيل", "العميل": item.party, "التفاصيل": item.detail, "القيمة": item.amount }))), "الحركات");
  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  if (Platform.OS === "web") throw new Error("تصدير Excel متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة التقرير.");
  const uri = `${FileSystem.documentDirectory}${fileStem(report)}.xlsx`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await shareNativeFile(uri, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "مشاركة تقرير Excel");
}

export async function exportReportPdf(report: TargetReport) {
  if (Platform.OS === "web") throw new Error("تصدير PDF متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة التقرير.");
  const { uri } = await Print.printToFileAsync({ html: reportHtml(report), margins: { top: 20, bottom: 20, left: 20, right: 20 } });
  await shareNativeFile(uri, "application/pdf", "مشاركة تقرير PDF");
}
