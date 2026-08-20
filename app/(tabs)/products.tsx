import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, EmptyState, PrimaryButton, ProgressBar } from "@/components/mavet-ui";
import { currency } from "@/lib/target-data";
import { productQuantity } from "@/lib/target-metrics";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function ProductsScreen() {
  const store = useTargetStore();
  const { products, activeTarget } = store;
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => products.filter((product) => product.name.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar"))), [products, query]);
  const header = <><AppHeader title="المنتجات" subtitle="الأسعار وأهداف الكميات" /><PrimaryButton label="إضافة منتج" onPress={() => router.push("/product-form")} icon="add-box" /><View style={styles.search}><MaterialIcons name="search" color="#766C79" size={20} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث باسم المنتج" placeholderTextColor="#A49AA7" style={styles.searchInput} textAlign="right" /></View></>;
  const emptyState = <EmptyState icon="inventory-2" title={query ? "لا يوجد منتج مطابق" : "لا توجد منتجات بعد"} description={query ? "جرّب اسم منتج آخر." : "أضف منتجاتك وأسعارها لتسجيل المبيعات."} />;
  const renderProduct = ({ item }: { item: (typeof products)[number] }) => {
    const sold = productQuantity(store, item.id, activeTarget);
    const progress = item.quantityTarget ? (sold / item.quantityTarget) * 100 : 0;
    return (
      <Pressable onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}>
        <View style={styles.productTop}>
          <View style={styles.priceBlock}><Text style={styles.price}>{currency(item.unitPrice)} ج.م</Text><Text style={styles.priceLabel}>سعر الوحدة</Text></View>
          <View style={styles.productNameBlock}><Text style={styles.productName}>{item.name}</Text>{item.quantityTarget > 0 ? <Text style={styles.quantityText}>{sold.toLocaleString("ar-EG")} / {item.quantityTarget.toLocaleString("ar-EG")} وحدة</Text> : <Text style={styles.quantityText}>لا يوجد هدف كمية</Text>}</View>
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

const styles = StyleSheet.create({ list: { paddingTop: 10, paddingBottom: 30 }, search: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 13, height: 51, borderWidth: 1, borderColor: "#E8DFE9", borderRadius: 15, backgroundColor: "#FFFFFF", marginTop: 16, marginBottom: 12 }, searchInput: { flex: 1, fontSize: 14, color: "#1E1522" }, productCard: { backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 9, gap: 12 }, productTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, productNameBlock: { alignItems: "flex-end", flex: 1 }, productName: { color: "#1E1522", fontSize: 15, fontWeight: "800", textAlign: "right" }, quantityText: { color: "#766C79", fontSize: 11, marginTop: 4, textAlign: "right" }, priceBlock: { backgroundColor: "#FBF2E2", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, marginRight: 14 }, price: { color: "#9B6211", fontSize: 13, fontWeight: "900" }, priceLabel: { color: "#A27B43", fontSize: 9, marginTop: 1 }, pressed: { opacity: 0.72 } });
