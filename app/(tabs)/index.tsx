import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, EmptyState, IconAction, MetricCard, PrimaryButton, ProgressBar, SectionTitle } from "@/components/mavet-ui";
import { currency, quarterDates } from "@/lib/target-data";
import { productQuantity, getTargetMetrics } from "@/lib/target-metrics";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

const cadenceLabels = { daily: "يومي", weekly: "أسبوعي", monthly: "شهري" } as const;

export default function HomeScreen() {
  const store = useTargetStore();
  const { activeTarget, cadence, setCadence, products } = store;
  const metrics = getTargetMetrics(store, activeTarget, cadence);
  const priorityProducts = activeTarget ? products.filter((product) => product.quantityTarget > 0).map((product) => ({ product, sold: productQuantity(store, product.id, activeTarget) })).sort((a, b) => (b.product.quantityTarget - b.sold) - (a.product.quantityTarget - a.sold)).slice(0, 3) : [];

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader title="Mavet Target" subtitle={activeTarget ? `الربع ${activeTarget.quarter} • ${activeTarget.year}` : "متابعة أهدافك الربع سنوية"} action={<IconAction icon="settings" label="الإعدادات" onPress={() => router.push("/(tabs)/settings")} />} />
        {!activeTarget ? (
          <EmptyState icon="flag" title="ابدأ بتحديد تارجت الربع" description="أدخل تارجت البيع والتحصيل للربع الميلادي الحالي، ثم أضف العملاء والمنتجات." action={<PrimaryButton label="إعداد التارجت" onPress={() => router.push("/target-settings")} icon="tune" />} />
        ) : (
          <>
            <View style={styles.targetCard}>
              <View style={styles.targetTop}><View><Text style={styles.cardEyebrow}>متابعة الربع الحالي</Text><Text style={styles.targetTitle}>ينتهي في {quarterDates(activeTarget).end}</Text></View><View style={styles.daysBadge}><Text style={styles.daysNumber}>{metrics.daysRemaining}</Text><Text style={styles.daysLabel}>يوم متبقي</Text></View></View>
              <View style={styles.progressBlock}><View style={styles.progressLine}><Text style={styles.percent}>{Math.round(metrics.salesProgress)}%</Text><Text style={styles.progressLabel}>إنجاز البيع</Text></View><ProgressBar value={metrics.salesProgress} color="#E89B2C" /></View>
              <View style={styles.progressBlock}><View style={styles.progressLine}><Text style={styles.percent}>{Math.round(metrics.collectionProgress)}%</Text><Text style={styles.progressLabel}>إنجاز التحصيل</Text></View><ProgressBar value={metrics.collectionProgress} color="#4A1E53" /></View>
            </View>

            <View style={styles.metricRow}><MetricCard label="متبقي للبيع" value={`${currency(metrics.salesRemaining)} ج.م`} caption={`تم ${currency(metrics.salesActual)} ج.م`} accent="#E89B2C" icon="trending-up" /><MetricCard label="متبقي للتحصيل" value={`${currency(metrics.collectionRemaining)} ج.م`} caption={`تم ${currency(metrics.collectionActual)} ج.م`} accent="#4A1E53" icon="account-balance-wallet" /></View>

            <SectionTitle title="المطلوب لتحقيق التارجت" />
            <View style={styles.cadence}><Text style={styles.cadenceQuestion}>اعرض المطلوب:</Text><View style={styles.cadenceButtons}>{(Object.keys(cadenceLabels) as (keyof typeof cadenceLabels)[]).map((key) => <Pressable key={key} onPress={() => setCadence(key)} style={({ pressed }) => [styles.cadenceButton, cadence === key && styles.cadenceActive, pressed && styles.pressed]}><Text style={[styles.cadenceText, cadence === key && styles.cadenceTextActive]}>{cadenceLabels[key]}</Text></Pressable>)}</View></View>
            <View style={styles.guidanceCard}><View style={styles.guidanceRow}><View style={styles.guidanceNumber}><Text style={styles.guidanceValue}>{currency(metrics.salesRequired)} ج.م</Text><Text style={styles.guidanceCaption}>بيع {cadenceLabels[cadence]}</Text></View><View style={[styles.guidanceIcon, { backgroundColor: "#FCF1DD" }]}><MaterialIcons name="trending-up" color="#C47B12" size={21} /></View></View><View style={styles.guidanceDivider} /><View style={styles.guidanceRow}><View style={styles.guidanceNumber}><Text style={styles.guidanceValue}>{currency(metrics.collectionRequired)} ج.م</Text><Text style={styles.guidanceCaption}>تحصيل {cadenceLabels[cadence]}</Text></View><View style={[styles.guidanceIcon, { backgroundColor: "#F4EDF6" }]}><MaterialIcons name="account-balance-wallet" color="#4A1E53" size={21} /></View></View></View>

            <View style={styles.quickActions}><View style={styles.quickHalf}><PrimaryButton label="تسجيل تحصيل" onPress={() => router.push("/collection")} icon="payments" /></View><View style={styles.quickHalf}><PrimaryButton label="تسجيل بيع" onPress={() => router.push("/sale")} icon="add-shopping-cart" /></View></View>

            <SectionTitle title="المنتجات التي تحتاج متابعة" detail="عرض الكمية" />
            {priorityProducts.length === 0 ? <View style={styles.notice}><MaterialIcons name="inventory-2" size={20} color="#766C79" /><Text style={styles.noticeText}>أضف أهداف كمية للمنتجات لتظهر المتابعة هنا.</Text></View> : priorityProducts.map(({ product, sold }) => { const remaining = Math.max(0, product.quantityTarget - sold); const progress = product.quantityTarget > 0 ? (sold / product.quantityTarget) * 100 : 0; return <View style={styles.productCard} key={product.id}><View style={styles.productHeader}><View style={styles.productNumbers}><Text style={styles.remaining}>{remaining.toLocaleString("ar-EG")} متبقي</Text><Text style={styles.productMeta}>من {product.quantityTarget.toLocaleString("ar-EG")} وحدة</Text></View><Text style={styles.productName}>{product.name}</Text></View><ProgressBar value={progress} color={progress >= 80 ? "#2E7D5B" : "#E89B2C"} /></View>; })}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 10, paddingBottom: 34 },
  targetCard: { padding: 18, backgroundColor: "#4A1E53", borderRadius: 23, marginBottom: 16 },
  targetTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cardEyebrow: { color: "#E7D6EB", fontSize: 13, fontWeight: "700", textAlign: "right" },
  targetTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginTop: 2, textAlign: "right" },
  daysBadge: { backgroundColor: "rgba(255,255,255,0.13)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, alignItems: "center" },
  daysNumber: { color: "#F5C774", fontSize: 21, fontWeight: "900" },
  daysLabel: { color: "#E7D6EB", fontSize: 10, marginTop: -1 },
  progressBlock: { gap: 7, marginTop: 14 },
  progressLine: { flexDirection: "row", justifyContent: "space-between" },
  percent: { color: "#F9F2FA", fontSize: 12, fontWeight: "800" },
  progressLabel: { color: "#F9F2FA", fontSize: 12, fontWeight: "700" },
  metricRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 22 },
  cadence: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8DFE9", borderRadius: 17, padding: 12, marginBottom: 10 },
  cadenceQuestion: { color: "#766C79", fontSize: 12, fontWeight: "700", textAlign: "right", marginBottom: 9 },
  cadenceButtons: { flexDirection: "row-reverse", gap: 7 },
  cadenceButton: { flex: 1, minHeight: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F1F7" },
  cadenceActive: { backgroundColor: "#4A1E53" },
  cadenceText: { color: "#766C79", fontSize: 12, fontWeight: "800" },
  cadenceTextActive: { color: "#FFFFFF" },
  guidanceCard: { backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 18, paddingHorizontal: 15, marginBottom: 16 },
  guidanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  guidanceNumber: { alignItems: "flex-start" },
  guidanceValue: { color: "#1E1522", fontSize: 18, fontWeight: "900" },
  guidanceCaption: { color: "#766C79", fontSize: 12, marginTop: 2 },
  guidanceIcon: { width: 41, height: 41, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  guidanceDivider: { height: 1, backgroundColor: "#EFE8F0" },
  quickActions: { flexDirection: "row-reverse", gap: 10, marginBottom: 24 },
  quickHalf: { flex: 1 },
  notice: { flexDirection: "row-reverse", gap: 9, alignItems: "center", backgroundColor: "#F5F1F5", padding: 15, borderRadius: 16 },
  noticeText: { color: "#766C79", flex: 1, fontSize: 13, textAlign: "right" },
  productCard: { backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 16, padding: 14, gap: 12, marginBottom: 9 },
  productHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { color: "#1E1522", fontSize: 15, fontWeight: "800", textAlign: "right", flex: 1 },
  productNumbers: { alignItems: "flex-start", marginRight: 12 },
  remaining: { color: "#C47B12", fontSize: 12, fontWeight: "900" },
  productMeta: { color: "#9A8E9E", fontSize: 10, marginTop: 2 },
  pressed: { opacity: 0.75 },
});
