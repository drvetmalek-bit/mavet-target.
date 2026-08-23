import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader, EmptyState, InputField, PrimaryButton, SectionTitle } from "@/components/mavet-ui";
import { currency, localDate, quarterDates } from "@/lib/target-data";
import { exportReportExcel, exportReportPdf } from "@/lib/report-export";
import { buildTargetReport, isValidDateRange } from "@/lib/reporting";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function ReportsScreen() {
  const store = useTargetStore();
  const { activeTarget } = store;
  const initialRange = activeTarget ? quarterDates(activeTarget) : { start: localDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), end: localDate() };
  const [start, setStart] = useState(initialRange.start);
  const [end, setEnd] = useState(initialRange.end);
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);
  const report = useMemo(() => buildTargetReport(store, start, end, activeTarget), [activeTarget, end, start, store]);
  const useQuarter = () => { if (activeTarget) { const range = quarterDates(activeTarget); setStart(range.start); setEnd(range.end); } };
  const exportReport = async (format: "excel" | "pdf") => {
    if (!isValidDateRange(start, end)) { Alert.alert("راجع الفترة", "استخدم صيغة التاريخ YYYY-MM-DD وتأكد أن تاريخ البداية لا يأتي بعد النهاية."); return; }
    if (Platform.OS === "web") { Alert.alert("التصدير من الموبايل", "ميزة مشاركة ملفات Excel وPDF تعمل من تطبيق Mavet Target على الهاتف."); return; }
    try {
      setBusy(format);
      if (format === "excel") await exportReportExcel(report); else await exportReportPdf(report);
    } catch (error) {
      Alert.alert("تعذر التصدير", error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء إنشاء التقرير.");
    } finally { setBusy(null); }
  };
  const header = <><AppHeader title="التقارير" subtitle="صدّر الربع الحالي أو أي فترة تحددها" /><View style={styles.periodCard}><Text style={styles.periodTitle}>فترة التقرير</Text><InputField label="من (YYYY-MM-DD)" value={start} onChangeText={setStart} placeholder="2026-01-01" /><InputField label="إلى (YYYY-MM-DD)" value={end} onChangeText={setEnd} placeholder="2026-03-31" /><Pressable onPress={useQuarter} style={({ pressed }) => [styles.quarterButton, pressed && styles.pressed]} disabled={!activeTarget}><MaterialIcons name="calendar-month" color="#4A1E53" size={18} /><Text style={styles.quarterButtonText}>{activeTarget ? "استخدام فترة الربع الحالي" : "أضف تارجت ربع أولاً"}</Text></Pressable></View><View style={styles.summaryRow}><SummaryCard label="محقق البيع" value={`${currency(report.salesActual)} ج.م`} color="#C47B12" /><SummaryCard label="محقق التحصيل" value={`${currency(report.collectionActual)} ج.م`} color="#198465" /></View><View style={styles.summaryRow}><SummaryCard label="مبيعات إدخال سريع" value={`${currency(report.fastSales)} ج.م`} color="#9B6211" /><SummaryCard label="تحصيلات إدخال سريع" value={`${currency(report.fastCollections)} ج.م`} color="#198465" /></View><SectionTitle title="تصدير التقرير" detail="من الهاتف" /><View style={styles.exportRow}><View style={styles.exportHalf}><PrimaryButton label={busy === "pdf" ? "جارٍ الإنشاء..." : "تصدير PDF"} onPress={() => exportReport("pdf")} icon="picture-as-pdf" disabled={busy !== null} /></View><View style={styles.exportHalf}><PrimaryButton label={busy === "excel" ? "جارٍ الإنشاء..." : "تصدير Excel"} onPress={() => exportReport("excel")} icon="file-download" disabled={busy !== null} /></View></View><Text style={styles.shareNote}>بعد الإنشاء، اختر المكان المناسب لحفظ أو مشاركة التقرير من نافذة المشاركة على هاتفك.</Text><SectionTitle title="أداء المنتجات في الفترة" detail={`${report.products.length.toLocaleString("ar-EG")} منتج`} /></>;
  return <ScreenContainer className="px-5" containerClassName="bg-background"><FlatList data={report.products} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListHeaderComponent={header} renderItem={({ item }) => <View style={styles.productRow}><View style={styles.productData}><Text style={styles.productName}>{item.name}</Text><Text style={styles.productMeta}>بيع {currency(item.salesValue)} ج.م • مباع {item.quantitySold.toLocaleString("ar-EG")} وحدة</Text></View><View style={styles.remainingBox}><Text style={styles.remainingValue}>{item.unitsRemaining === null ? "—" : item.unitsRemaining.toLocaleString("ar-EG")}</Text><Text style={styles.remainingLabel}>{item.unitsRemaining === null ? "بدون تارجت" : "وحدة متبقية"}</Text></View></View>} ListEmptyComponent={<EmptyState icon="summarize" title="لا توجد منتجات في التقرير" description="أضف منتجات أو مبيعات للفترة المحددة لتظهر تفاصيل الأداء هنا." />} /></ScreenContainer>;
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) { return <View style={styles.summaryCard}><Text style={styles.summaryLabel}>{label}</Text><Text style={[styles.summaryValue, { color }]}>{value}</Text></View>; }

const styles = StyleSheet.create({ list: { paddingTop: 10, paddingBottom: 32 }, periodCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8DFE9", borderRadius: 18, padding: 14, marginBottom: 13 }, periodTitle: { color: "#4A1E53", fontSize: 14, fontWeight: "900", textAlign: "right", marginBottom: 12 }, quarterButton: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 12, minHeight: 41, backgroundColor: "#F4EDF6" }, quarterButtonText: { color: "#4A1E53", fontSize: 12, fontWeight: "800" }, summaryRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 10 }, summaryCard: { flex: 1, backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 15, padding: 12, alignItems: "flex-end" }, summaryLabel: { color: "#766C79", fontSize: 11, fontWeight: "700" }, summaryValue: { fontSize: 15, fontWeight: "900", marginTop: 4 }, exportRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 9 }, exportHalf: { flex: 1 }, shareNote: { color: "#766C79", fontSize: 11, lineHeight: 17, textAlign: "right", marginBottom: 21 }, productRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8DFE9", borderRadius: 15, marginBottom: 8 }, productData: { flex: 1, alignItems: "flex-end" }, productName: { color: "#1E1522", fontSize: 14, fontWeight: "900", textAlign: "right" }, productMeta: { color: "#766C79", fontSize: 10, textAlign: "right", marginTop: 4 }, remainingBox: { minWidth: 74, alignItems: "center", backgroundColor: "#F7F2F8", borderRadius: 12, paddingVertical: 7, paddingHorizontal: 8 }, remainingValue: { color: "#4A1E53", fontSize: 15, fontWeight: "900" }, remainingLabel: { color: "#766C79", fontSize: 9, marginTop: 1 }, pressed: { opacity: 0.72 } });
