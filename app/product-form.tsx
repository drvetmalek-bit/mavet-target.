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
  const [name, setName] = useState(""); const [packSize, setPackSize] = useState(""); const [unitPrice, setUnitPrice] = useState(""); const [quantityTarget, setQuantityTarget] = useState("");
  useEffect(() => { if (current) { setName(current.name); setPackSize(current.packSize ?? ""); setUnitPrice(String(current.unitPrice)); setQuantityTarget(current.quantityTarget ? String(current.quantityTarget) : ""); } }, [current]);
  const submit = () => {
    if (!name.trim() || Number(unitPrice) < 0 || Number(quantityTarget || 0) < 0) { Alert.alert("راجع البيانات", "أدخل اسم المنتج وسعراً وهدف كمية بأرقام صحيحة."); return; }
    const duplicate = products.some((item) => item.id !== current?.id && item.name.trim().toLocaleLowerCase("ar-EG") === name.trim().toLocaleLowerCase("ar-EG") && (item.packSize ?? "").trim().toLocaleLowerCase("ar-EG") === packSize.trim().toLocaleLowerCase("ar-EG"));
    if (duplicate) { Alert.alert("المنتج موجود", "يوجد منتج بالاسم والعبوة نفسيهما في القائمة."); return; }
    upsertProduct({ id: current?.id ?? uid("product"), name: name.trim(), packSize: packSize.trim() || undefined, category: current?.category ?? "custom", unitPrice: Number(unitPrice || 0), quantityTarget: Number(quantityTarget || 0), createdAt: current?.createdAt ?? new Date().toISOString() });
    router.back();
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 42 }} keyboardShouldPersistTaps="handled"><AppHeader title={current ? "تعديل المنتج" : "إضافة منتج"} subtitle="يمكنك تعديل السعر والعبوة في أي وقت" /><InputField label="اسم المنتج" value={name} onChangeText={setName} placeholder="مثال: Mavet Care" /><InputField label="العبوة (اختيارية)" value={packSize} onChangeText={setPackSize} placeholder="مثال: 1 لتر أو 500 جم" /><InputField label="سعر الوحدة (ج.م)" value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" placeholder="0" /><InputField label="تارجت عدد الوحدات للربع (اختياري)" value={quantityTarget} onChangeText={setQuantityTarget} keyboardType="decimal-pad" placeholder="اتركه فارغاً عند عدم وجود تارجت" /><Text style={styles.optionalHint}>تُستخدم العبوة أيضاً داخل الجرد لتمييز المنتجات ذات الاسم نفسه.</Text><PrimaryButton label={current ? "حفظ التعديل" : "حفظ المنتج"} onPress={submit} icon="check-circle" /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ optionalHint: { color: "#766C79", fontSize: 12, lineHeight: 18, textAlign: "right", marginTop: -9, marginBottom: 18 } });
