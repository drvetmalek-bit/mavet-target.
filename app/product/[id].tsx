import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader, EmptyState, GhostButton, PrimaryButton, ProgressBar, SectionTitle } from "@/components/mavet-ui";
import { currency, quantityFormat, shortDate } from "@/lib/target-data";
import { productQuantity } from "@/lib/target-metrics";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useTargetStore();
  const { products, sales, activeTarget, deleteProduct, deleteSale, customers } = store;
  const product = products.find((item) => item.id === id);
  if (!product) return <ScreenContainer className="p-5"><EmptyState icon="inventory-2" title="المنتج غير موجود" description="ربما تم حذفه من الهاتف." /></ScreenContainer>;
  const sold = productQuantity(store, product.id, activeTarget);
  const remaining = Math.max(0, product.quantityTarget - sold);
  const progress = product.quantityTarget > 0 ? (sold / product.quantityTarget) * 100 : 0;
  const productSales = sales.filter((item) => item.productId === product.id).sort((a, b) => b.date.localeCompare(a.date));
  const removeSale = (saleId: string) => Alert.alert("حذف عملية البيع؟", "سيتم تحديث إجمالي البيع وأداء المنتج فوراً.", [{ text: "إلغاء", style: "cancel" }, { text: "حذف", style: "destructive", onPress: () => deleteSale(saleId) }]);
  const confirmDelete = () => Alert.alert("حذف المنتج؟", "سيختفي المنتج من القائمة مع بقاء مبيعاته السابقة في حساب التارجت.", [{ text: "إلغاء", style: "cancel" }, { text: "حذف", style: "destructive", onPress: () => { deleteProduct(product.id); router.back(); } }]);
  const header = <><AppHeader title={product.name} subtitle={`${currency(product.unitPrice)} ج.م لسعر الوحدة`} /><View style={styles.quantityCard}><View style={styles.quantityTop}><View><Text style={styles.remaining}>{quantityFormat(remaining)} وحدة متبقية</Text><Text style={styles.targetText}>{product.quantityTarget > 0 ? `هدف الربع: ${quantityFormat(product.quantityTarget)} وحدة` : "لم يتم تحديد هدف كمية"}</Text></View><View style={styles.soldBlock}><Text style={styles.sold}>{quantityFormat(sold)}</Text><Text style={styles.soldLabel}>مباع</Text></View></View>{product.quantityTarget > 0 ? <ProgressBar value={progress} color={progress >= 80 ? "#2E7D5B" : "#E89B2C"} /> : null}</View><PrimaryButton label="تسجيل بيع لهذا المنتج" onPress={() => router.push("/sale")} icon="add-shopping-cart" /><View style={styles.editRow}><GhostButton label="تعديل المنتج" onPress={() => router.push({ pathname: "/product-form", params: { id: product.id } })} /><GhostButton label="حذف المنتج" onPress={confirmDelete} icon="delete-outline" tone="danger" /></View><SectionTitle title="آخر عمليات البيع" detail={`${quantityFormat(productSales.length)} عملية`} /></>;
  return <ScreenContainer className="px-5" containerClassName="bg-background"><FlatList data={productSales} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListHeaderComponent={header} renderItem={({ item }) => <View style={styles.saleLine}><View style={styles.saleIcon}><MaterialIcons name="shopping-cart" color="#C47B12" size={18} /></View><View style={styles.saleText}><Text style={styles.saleCustomer}>{customers.find((customer) => customer.id === item.customerId)?.name ?? "عميل"}</Text><Text style={styles.saleDate}>{shortDate(item.date)} • {quantityFormat(item.quantity)} وحدة</Text></View><View style={styles.saleAmount}><Text style={styles.amount}>{currency(item.total)} ج.م</Text><Pressable onPress={() => removeSale(item.id)}><MaterialIcons name="delete-outline" size={17} color="#B84343" /></Pressable></View></View>} ListEmptyComponent={<EmptyState icon="receipt-long" title="لا توجد مبيعات بعد" description="سجّل عملية بيع ليظهر سجل المنتج هنا." />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ list: { paddingTop: 10, paddingBottom: 34 }, quantityCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8DFE9", borderRadius: 18, padding: 15, gap: 14, marginBottom: 12 }, quantityTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, remaining: { color: "#C47B12", fontSize: 15, fontWeight: "900" }, targetText: { color: "#766C79", fontSize: 12, marginTop: 3 }, soldBlock: { alignItems: "center", backgroundColor: "#F4EDF6", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 }, sold: { color: "#4A1E53", fontSize: 18, fontWeight: "900" }, soldLabel: { color: "#766C79", fontSize: 10 }, editRow: { flexDirection: "row-reverse", gap: 9, marginVertical: 12 }, saleLine: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8DFE9", padding: 12, borderRadius: 15, marginBottom: 8 }, saleIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: "#FCF1DD", alignItems: "center", justifyContent: "center" }, saleText: { flex: 1, alignItems: "flex-end" }, saleCustomer: { color: "#1E1522", fontSize: 14, fontWeight: "800" }, saleDate: { color: "#766C79", fontSize: 11, marginTop: 3 }, saleAmount: { alignItems: "flex-start", gap: 4 }, amount: { color: "#1E1522", fontSize: 12, fontWeight: "900" } });
