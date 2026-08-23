import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, EmptyState, PrimaryButton, ProgressBar } from "@/components/mavet-ui";
import { currency, quantityFormat } from "@/lib/target-data";
import { productQuantity } from "@/lib/target-metrics";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function ProductsScreen() {
  const store = useTargetStore();
  const { products, activeTarget } = store;
  const [query, setQuery] = useState("");
  const [sortByRemaining, setSortByRemaining] = useState(false);
  const filtered = useMemo(() => products.filter((product) => product.name.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar"))).sort((first, second) => {
    if (!sortByRemaining) return first.name.localeCompare(second.name, "ar");
    const firstRemaining = first.quantityTarget > 0 ? Math.max(0, first.quantityTarget - productQuantity(store, first.id, activeTarget)) : -1;
    const secondRemaining = second.quantityTarget > 0 ? Math.max(0, second.quantityTarget - productQuantity(store, second.id, activeTarget)) : -1;
    return secondRemaining - firstRemaining || first.name.localeCompare(second.name, "ar");
  }), [activeTarget, products, query, sortByRemaining, store]);
  const header = <><AppHeader title="المنتجات" subtitle="الأسعار وأهداف الكميات" /><PrimaryButton label="إضافة منتج" onPress={() => router.push("/product-form")} icon="add-box" /><View style={styles.search}><MaterialIcons name="search" color="#766C79" size={20} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث باسم المنتج" placeholderTextColor="#A49AA7" style={styles.searchInput} textAlign="right" /></View><Pressable onPress={() => setSortByRemaining((value) => !value)} style={({ pressed }) => [styles.sortButton, sortByRemaining && styles.sortButtonActive, pressed && styles.pressed]}><MaterialIcons name="sort" color={sortByRemaining ? "#FFFFFF" : "#4A1E53"} size={18} /><Text style={[styles.sortText, sortByRemaining && styles.sortTextActive]}>{sortByRemaining ? "الترتيب: الأعلى متبقياً" : "ترتيب حسب المتبقي من الوحدات"}</Text></Pressable></>;
  const emptyState = <EmptyState icon="inventory-2" title={query ? "لا يوجد منتج مطابق" : "لا توجد منتجات بعد"} description={query ? "جرّب اسم منتج آخر." : "أضف منتجاتك وأسعارها لتسجيل المبيعات."} />;
  const renderProduct = ({ item }: { item: (typeof products)[number] }) => {
    const sold = productQuantity(store, item.id, activeTarget);
    const progress = item.quantityTarget ? (sold / item.quantityTarget) * 100 : 0;
    return (
      <Pressable onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}>
        <View style={styles.productTop}>
          <View style={styles.priceBlock}><Text style={styles.price}>{currency(item.unitPrice)} ج.م</Text><Text style={styles.priceLabel}>سعر الوحدة</Text></View>
          <View style={styles.productNameBlock}><Text style={styles.productName}>{item.name}</Text><Text style={styles.packText}>{item.packSize ?? "بدون عبوة محددة"}</Text>{item.quantityTarget > 0 ? <Text style={styles.quantityText}>{quantityFormat(sold)} / {quantityFormat(item.quantityTarget)} وحدة</Text> : <Text style={styles.quantityText}>لا يوجد هدف كمية</Text>}</View>
        </View>
        {item.quantityTarget > 0 ? <ProgressBar value={progress} color={progress >= 80 ? "#2E7D5B" : "#E89B2C"} /> : null}
      </Pressable>
    );
  };
  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        renderItem={renderProduct}
        ListEmptyComponent={emptyState}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ list: { paddingTop: 10, paddingBottom: 30 }, search: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 13, height: 51, borderWidth: 1, borderColor: "#E8DFE9", borderRadius: 15, backgroundColor: "#FFFFFF", marginTop: 16, marginBottom: 12 }, searchInput: { flex: 1, fontSize: 14, color: "#1E1522" }, sortButton: { flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 7, minHeight: 40, borderRadius: 13, borderWidth: 1, borderColor: "#DCCBE0", backgroundColor: "#FFFFFF", marginBottom: 12 }, sortButtonActive: { backgroundColor: "#4A1E53", borderColor: "#4A1E53" }, sortText: { color: "#4A1E53", fontSize: 12, fontWeight: "800" }, sortTextActive: { color: "#FFFFFF" }, productCard: { backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 9, gap: 12 }, productTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, productNameBlock: { alignItems: "flex-end", flex: 1 }, productName: { color: "#1E1522", fontSize: 15, fontWeight: "800", textAlign: "right" }, packText: { color: "#4A1E53", fontSize: 11, fontWeight: "800", marginTop: 3, textAlign: "right" }, quantityText: { color: "#766C79", fontSize: 11, marginTop: 4, textAlign: "right" }, priceBlock: { backgroundColor: "#FBF2E2", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, marginRight: 14 }, price: { color: "#9B6211", fontSize: 13, fontWeight: "900" }, priceLabel: { color: "#A27B43", fontSize: 9, marginTop: 1 }, pressed: { opacity: 0.72 } });
