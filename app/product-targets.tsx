import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, EmptyState, PrimaryButton } from "@/components/mavet-ui";
import { ScreenContainer } from "@/components/screen-container";
import { quantityFormat } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";

export default function ProductTargetsScreen() {
  const { products, upsertProduct } = useTargetStore();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  useEffect(() => setDrafts(Object.fromEntries(products.map((product) => [product.id, product.quantityTarget ? String(product.quantityTarget) : ""]))), [products]);
  const save = () => {
    products.forEach((product) => { const value = Number((drafts[product.id] ?? "").replace(/,/g, "")); upsertProduct({ ...product, quantityTarget: Number.isFinite(value) && value > 0 ? value : 0 }); });
    Alert.alert("تم الحفظ", "تم تحديث تارجت الوحدات لكل المنتجات.", [{ text: "تم", onPress: () => router.back() }]);
  };
  return <ScreenContainer className="px-5" containerClassName="bg-background"><FlatList data={products} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListHeaderComponent={<><AppHeader title="تارجت المنتجات" subtitle="ضع عدد الوحدات المطلوب لكل منتج في الربع" /><View style={styles.note}><Text style={styles.noteText}>اترك الحقل فارغاً إذا لم يكن للمنتج تارجت وحدات. تظهر التارجتات في متابعة المنتجات وفي الجرد.</Text></View></>} renderItem={({ item }) => <View style={styles.card}><View style={styles.info}><Text style={styles.name}>{item.name}</Text><Text style={styles.pack}>{item.packSize || "عبوة غير محددة"} • الحالي: {item.quantityTarget > 0 ? `${quantityFormat(item.quantityTarget)} وحدة` : "غير محدد"}</Text></View><TextInput value={drafts[item.id] ?? ""} onChangeText={(value) => setDrafts((current) => ({ ...current, [item.id]: value }))} keyboardType="decimal-pad" placeholder="تارجت" placeholderTextColor="#A49AA7" style={styles.input} textAlign="center" /></View>} ListEmptyComponent={<EmptyState icon="inventory-2" title="لا توجد منتجات" description="أضف منتجات أولاً لتتمكن من وضع تارجت وحدات لها." />} ListFooterComponent={products.length ? <View style={styles.footer}><PrimaryButton label="حفظ تارجت المنتجات" onPress={save} icon="check-circle" /></View> : null} /></ScreenContainer>;
}

const styles = StyleSheet.create({ list: { paddingTop: 10, paddingBottom: 34 }, note: { backgroundColor: "#FFF8E8", borderColor: "#F2D692", borderWidth: 1, borderRadius: 15, padding: 12, marginBottom: 14 }, noteText: { color: "#76530E", fontSize: 12, lineHeight: 18, textAlign: "right" }, card: { flexDirection: "row-reverse", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 16, padding: 13, marginBottom: 8 }, info: { flex: 1, alignItems: "flex-end" }, name: { color: "#1E1522", fontSize: 14, fontWeight: "900", textAlign: "right" }, pack: { color: "#766C79", fontSize: 10, marginTop: 4, textAlign: "right" }, input: { width: 88, height: 42, borderRadius: 11, borderWidth: 1, borderColor: "#CDB8D1", color: "#4A1E53", fontSize: 15, fontWeight: "900" }, footer: { marginTop: 12 } });
