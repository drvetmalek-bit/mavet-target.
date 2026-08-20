import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, EmptyState, PrimaryButton } from "@/components/mavet-ui";
import { currency, quarterDates } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function CustomersScreen() {
  const { customers, sales, collections, activeTarget } = useTargetStore();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => customers.filter((customer) => customer.name.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar"))), [customers, query]);
  const range = activeTarget ? quarterDates(activeTarget) : undefined;
  const totals = (id: string) => ({ sales: sales.filter((sale) => sale.customerId === id && (!range || (sale.date >= range.start && sale.date <= range.end))).reduce((sum, sale) => sum + sale.total, 0), collections: collections.filter((item) => item.customerId === id && (!range || (item.date >= range.start && item.date <= range.end))).reduce((sum, item) => sum + item.amount, 0) });
  const header = <><AppHeader title="العملاء" subtitle={`${customers.length.toLocaleString("ar-EG")} عميل محفوظ محلياً`} /><PrimaryButton label="إضافة عميل" onPress={() => router.push("/customer-form")} /><View style={styles.search}><MaterialIcons name="search" color="#766C79" size={20} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث باسم العميل" placeholderTextColor="#A49AA7" style={styles.searchInput} textAlign="right" /></View></>;
  const emptyState = <EmptyState icon="group-add" title={query ? "لا يوجد عميل مطابق" : "لا يوجد عملاء بعد"} description={query ? "جرّب اسم عميل آخر." : "أضف أول عميل لتسجيل البيع والتحصيل عليه."} />;
  const renderCustomer = ({ item }: { item: (typeof customers)[number] }) => {
    const total = totals(item.id);
    return (
      <Pressable onPress={() => router.push({ pathname: "/customer/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.customerCard, pressed && styles.pressed]}>
        <View style={styles.customerRight}>
          <View style={styles.initial}><Text style={styles.initialText}>{item.name.slice(0, 1)}</Text></View>
          <View><Text style={styles.customerName}>{item.name}</Text><Text style={styles.customerMeta}>بيع {currency(total.sales)} ج.م  •  تحصيل {currency(total.collections)} ج.م</Text></View>
        </View>
        <MaterialIcons name="chevron-left" color="#766C79" size={23} />
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
        renderItem={renderCustomer}
        ListEmptyComponent={emptyState}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ list: { paddingTop: 10, paddingBottom: 30 }, search: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 13, height: 51, borderWidth: 1, borderColor: "#E8DFE9", borderRadius: 15, backgroundColor: "#FFFFFF", marginTop: 16, marginBottom: 12 }, searchInput: { flex: 1, fontSize: 14, color: "#1E1522" }, customerCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 16, padding: 13, marginBottom: 9 }, customerRight: { flexDirection: "row-reverse", alignItems: "center", gap: 10, flex: 1 }, initial: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#F2E8F4", alignItems: "center", justifyContent: "center" }, initialText: { color: "#4A1E53", fontSize: 18, fontWeight: "900" }, customerName: { color: "#1E1522", fontSize: 15, fontWeight: "800", textAlign: "right" }, customerMeta: { color: "#766C79", fontSize: 11, marginTop: 3, textAlign: "right" }, pressed: { opacity: 0.72 } });
