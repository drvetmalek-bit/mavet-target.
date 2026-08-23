import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, InputField, PrimaryButton, ProgressBar } from "@/components/mavet-ui";
import { ScreenContainer } from "@/components/screen-container";
import { localDate, quantityFormat, type StockCountEntry, uid } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";

export default function NewInventoryScreen() {
  const { products, upsertStockCount } = useTargetStore();
  const orderedProducts = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name, "ar")), [products]);
  const [index, setIndex] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<StockCountEntry[]>([]);
  const product = orderedProducts[index];
  const progress = orderedProducts.length ? ((index + 1) / orderedProducts.length) * 100 : 0;
  const next = () => {
    if (!product || quantity.trim() === "" || Number(quantity) < 0) { Alert.alert("أدخل الكمية", "أدخل كمية صحيحة للمنتج الحالي، ويمكن أن تكون 0 عند عدم وجود رصيد."); return; }
    const entry: StockCountEntry = { productId: product.id, quantity: Number(quantity), expiryDate: expiryDate.trim() || undefined, note: note.trim() || undefined };
    const updated = [...entries, entry];
    if (index + 1 >= orderedProducts.length) {
      const now = new Date().toISOString();
      upsertStockCount({ id: uid("inventory"), title: `جرد مخزن ${localDate()}`, date: localDate(), entries: updated, createdAt: now, updatedAt: now });
      Alert.alert("تم حفظ الجرد", "تم تسجيل كل المنتجات وتحديث أرصدة المخزون.", [{ text: "عرض الجرد", onPress: () => router.replace("/inventory" as never) }]);
      return;
    }
    setEntries(updated); setIndex((current) => current + 1); setQuantity(""); setExpiryDate(""); setNote("");
  };
  if (!product) return <ScreenContainer className="p-5"><AppHeader title="جرد جديد"/><Text style={styles.noProducts}>أضف منتجاً واحداً على الأقل قبل بدء الجرد.</Text><PrimaryButton label="إضافة منتج" onPress={() => router.push("/product-form")} icon="add" /></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><AppHeader title="جرد جديد" subtitle={`المنتج ${quantityFormat(index + 1)} من ${quantityFormat(orderedProducts.length)}`} compact /><ProgressBar value={progress} color="#E89B2C" /><View style={styles.productCard}><Text style={styles.productName}>{product.name}</Text><Text style={styles.pack}>{product.packSize ?? "بدون عبوة محددة"}</Text></View><Text style={styles.helper}>سجّل الكمية الفعلية. تاريخ الصلاحية والملاحظة اختياريان، ثم اضغط «التالي» للانتقال للمنتج الذي يليه.</Text><InputField label="الكمية الفعلية بالمخزن" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="0" /><InputField label="تاريخ الصلاحية (اختياري)" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" /><InputField label="ملاحظة (اختيارية)" value={note} onChangeText={setNote} multiline placeholder="مثال: عبوة مفتوحة أو ملاحظة على الصلاحية" /><PrimaryButton label={index + 1 === orderedProducts.length ? "حفظ وإنهاء الجرد" : "التالي"} onPress={next} icon={index + 1 === orderedProducts.length ? "check-circle" : "arrow-back"} /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ scroll: { padding: 20, paddingBottom: 40 }, productCard: { alignItems: "flex-end", backgroundColor: "#4A1E53", borderRadius: 20, padding: 20, marginTop: 18, marginBottom: 16 }, productName: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", textAlign: "right" }, pack: { color: "#F5C774", fontSize: 13, fontWeight: "800", marginTop: 4 }, helper: { color: "#766C79", fontSize: 13, lineHeight: 20, textAlign: "right", marginBottom: 18 }, noProducts: { color: "#766C79", textAlign: "center", marginVertical: 30, fontSize: 14 } });
