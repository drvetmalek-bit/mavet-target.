import { Platform } from "react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

import { currency } from "./target-data";
import { type TargetReport } from "./reporting";

const htmlEscape = (value: string | number) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
const fileStem = (report: TargetReport) => `Mavet_Target_${report.start}_${report.end}`;
let logoDataUri: Promise<string> | undefined;

function getEmbeddedLogo() {
  if (!logoDataUri) {
    logoDataUri = (async () => {
      const asset = Asset.fromModule(require("@/assets/images/mavet-target-icon-v2.png"));
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return `data:image/png;base64,${base64}`;
    })();
  }
  return logoDataUri;
}

async function reportHtml(report: TargetReport) {
  const money = (value: number) => `${currency(value)} ج.م`;
  const rows = report.products.map((product) => `<tr><td>${htmlEscape(product.name)}</td><td>${money(product.salesValue)}</td><td>${product.quantitySold.toLocaleString("ar-EG")}</td><td>${product.unitsRemaining === null ? "—" : product.unitsRemaining.toLocaleString("ar-EG")}</td></tr>`).join("");
  const customers = report.customers.map((customer) => `<tr><td>${htmlEscape(customer.name)}</td><td>${money(customer.sales)}</td><td>${money(customer.collections)}</td></tr>`).join("");
  const maximum = Math.max(1, ...report.monthly.flatMap((month) => [month.sales, month.collections]));
  const chart = report.monthly.map((month) => `<div class="month"><div class="bars"><span class="bar sale" style="height:${Math.round(month.sales / maximum * 100)}%"></span><span class="bar collection" style="height:${Math.round(month.collections / maximum * 100)}%"></span></div><div class="monthLabel">${htmlEscape(month.label)}</div><div class="chartValue">بيع ${money(month.sales)}<br/>تحصيل ${money(month.collections)}</div></div>`).join("");
  const representative = report.representative?.name ? `<div class="rep">المندوب: <strong>${htmlEscape(report.representative.name)}</strong>${report.representative.territory ? ` — ${htmlEscape(report.representative.territory)}` : ""}${report.representative.phone ? ` — ${htmlEscape(report.representative.phone)}` : ""}</div>` : "";
  const logo = await getEmbeddedLogo();
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8" /><style>@page { margin: 20px; } body{font-family:Arial,sans-serif;color:#1E1522;direction:rtl}.brand{display:flex;align-items:center;gap:10px;border-bottom:2px solid #E8DFE9;padding-bottom:10px}.brand img{width:62px;height:62px;object-fit:contain}.brandTitle{flex:1}h1{color:#4A1E53;margin:0 0 4px}h2{font-size:16px;color:#4A1E53;margin:22px 0 8px}.sub,.rep{color:#766C79;margin:4px 0}.grid{display:flex;gap:10px;margin:18px 0}.card{flex:1;background:#F7F2F8;border:1px solid #E8DFE9;border-radius:10px;padding:11px}.label{font-size:11px;color:#766C79}.value{font-weight:bold;font-size:16px;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#4A1E53;color:#fff}th,td{border:1px solid #E8DFE9;padding:7px;text-align:right}tr:nth-child(even){background:#FCFAFC}.chart{height:165px;display:flex;gap:10px;align-items:flex-end;border:1px solid #E8DFE9;border-radius:10px;padding:12px;background:#FCFAFC}.month{flex:1;min-width:45px;text-align:center}.bars{height:100px;display:flex;gap:4px;align-items:flex-end;justify-content:center}.bar{width:15px;border-radius:5px 5px 0 0;min-height:2px}.sale{background:#E89B2C}.collection{background:#198465}.monthLabel{font-size:10px;font-weight:bold;margin-top:6px}.chartValue{font-size:8px;color:#766C79;margin-top:3px;line-height:12px}</style></head><body><div class="brand"><img src="${logo}" alt="Mavet Target"/><div class="brandTitle"><h1>Mavet Target</h1><p class="sub">${htmlEscape(report.title)}</p>${representative}</div></div><div class="grid"><div class="card"><div class="label">المحقق من البيع</div><div class="value">${money(report.salesActual)}</div></div><div class="card"><div class="label">المحقق من التحصيل</div><div class="value">${money(report.collectionActual)}</div></div><div class="card"><div class="label">فرق البيع والتحصيل</div><div class="value">${money(report.cashGap)}</div></div></div>${report.salesTarget !== undefined ? `<p class="sub">تارجت البيع: ${money(report.salesTarget)} — تارجت التحصيل: ${money(report.collectionTarget ?? 0)}</p>` : ""}<h2>المبيعات والتحصيل الشهري</h2><div class="chart">${chart}</div><h2>أداء المنتجات</h2><table><thead><tr><th>المنتج</th><th>قيمة البيع</th><th>الوحدات المباعة</th><th>الوحدات المتبقية</th></tr></thead><tbody>${rows || "<tr><td colspan='4'>لا توجد بيانات منتجات للفترة المحددة.</td></tr>"}</tbody></table><h2>أداء العملاء</h2><table><thead><tr><th>العميل</th><th>البيع</th><th>التحصيل</th></tr></thead><tbody>${customers || "<tr><td colspan='3'>لا توجد حركات عملاء للفترة المحددة.</td></tr>"}</tbody></table></body></html>`;
}

async function shareNativeFile(uri: string, mimeType: string, title: string) {
  if (Platform.OS === "web") throw new Error("تصدير الملفات متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة التقرير.");
  if (!(await Sharing.isAvailableAsync())) throw new Error("المشاركة غير متاحة على هذا الجهاز.");
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: mimeType === "application/pdf" ? ".pdf" : "org.openxmlformats.spreadsheetml.sheet" });
}

export async function exportReportExcel(report: TargetReport) {
  const workbook = XLSX.utils.book_new();
  const summary = [["Mavet Target", report.title], ["اسم المندوب", report.representative?.name ?? ""], ["هاتف المندوب", report.representative?.phone ?? ""], ["المنطقة", report.representative?.territory ?? ""], ["المحقق من البيع", report.salesActual], ["المحقق من التحصيل", report.collectionActual], ["فرق البيع والتحصيل", report.cashGap], ["مبيعات إدخال سريع", report.fastSales], ["تحصيلات إدخال سريع", report.fastCollections]];
  if (report.salesTarget !== undefined) summary.push(["تارجت البيع", report.salesTarget], ["تارجت التحصيل", report.collectionTarget ?? 0]);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), "الملخص");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.products.map((product) => ({ "المنتج": product.name, "سعر الوحدة": product.unitPrice, "قيمة البيع": product.salesValue, "الوحدات المباعة": product.quantitySold, "تارجت الوحدات": product.quantityTarget || "", "الوحدات المتبقية": product.unitsRemaining ?? "" }))), "المنتجات");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.customers.map((customer) => ({ "العميل": customer.name, "البيع": customer.sales, "التحصيل": customer.collections }))), "العملاء");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.transactions.map((item) => ({ "التاريخ": item.date, "النوع": item.type === "sale" ? "بيع" : "تحصيل", "العميل": item.party, "التفاصيل": item.detail, "القيمة": item.amount }))), "الحركات");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.monthly.map((month) => ({ "الشهر": month.label, "المبيعات": month.sales, "التحصيل": month.collections }))), "البيانات الشهرية");
  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  if (Platform.OS === "web") throw new Error("تصدير Excel متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة التقرير.");
  const uri = `${FileSystem.documentDirectory}${fileStem(report)}.xlsx`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await shareNativeFile(uri, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "مشاركة تقرير Excel");
}

export async function exportReportPdf(report: TargetReport) {
  if (Platform.OS === "web") throw new Error("تصدير PDF متاح من تطبيق الموبايل. استخدم التطبيق على الهاتف لمشاركة التقرير.");
  const { uri } = await Print.printToFileAsync({ html: await reportHtml(report), margins: { top: 20, bottom: 20, left: 20, right: 20 } });
  await shareNativeFile(uri, "application/pdf", "مشاركة تقرير PDF");
}
