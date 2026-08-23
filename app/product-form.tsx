import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";

import { AppHeader, InputField, PrimaryButton } from "@/components/mavet-ui";
import { uid } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { products, upsertProduct } = useTargetStore();
  const current = useMemo(() => products.find((item) => item.id === id), [products, id]);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantityTarget, setQuantityTarget] = useState("");
  useEffect(() => { if (current) { setName(current.name); setUnitPrice(String(current.unitPrice)); setQuantityTarget(String(current.quantityTarget)); } }, [current]);
  const submit = () => {
    if (!name.trim() || Number(unitPrice) < 0 || Number(quantityTarget) < 0) { Alert.alert("راجع البيانات", "أدخل اسم المنتج وسعراً وهدف كمية بأرقام صحيحة."); return; }
    upsertProduct({ id: current?.id ?? uid("product"), name: name.trim(), unitPrice: Number(unitPrice || 0), quantityTarget: Number(quantityTarget || 0), createdAt: current?.createdAt ?? new Date().toISOString() });
    router.back();
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 42 }} keyboardShouldPersistTaps="handled"><AppHeader title={current ? "تعديل المنتج" : "إضافة منتج"} subtitle="يمكنك تعديل السعر في أي وقت" /><InputField label="اسم المنتج" value={name} onChangeText={setName} placeholder="مثال: Mavet Care" /><InputField label="سعر الوحدة (ج.م)" value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" placeholder="0" /><InputField label="تارجت عدد الوحدات للربع (اختياري)" value={quantityTarget} onChangeText={setQuantityTarget} keyboardType="decimal-pad" placeholder="اتركه فارغاً عند عدم وجود تارجت" /><Text style={styles.optionalHint}>اترك الحقل فارغاً إذا كنت تريد متابعة قيمة البيع فقط من دون تارجت للكمية.</Text><PrimaryButton label={current ? "حفظ التعديل" : "حفظ المنتج"} onPress={submit} icon="check-circle" /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ optionalHint: { color: "#766C79", fontSize: 12, lineHeight: 18, textAlign: "right", marginTop: -9, marginBottom: 18 } });
