import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceSheet, InputField, PrimaryButton, SelectField } from "@/components/mavet-ui";
import { currency, localDate, uid } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";

export function SaleForm({ initialCustomerId, onComplete }: { initialCustomerId?: string; onComplete: () => void }) {
  const { customers, products, addSale } = useTargetStore();
  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [date, setDate] = useState(localDate());
  const [note, setNote] = useState("");
  const [picker, setPicker] = useState<"customer" | "product" | null>(null);

  const customer = customers.find((item) => item.id === customerId);
  const product = products.find((item) => item.id === productId);
  const total = useMemo(() => Math.max(0, Number(quantity || 0) * Number(unitPrice || 0) - Number(discount || 0)), [discount, quantity, unitPrice]);

  useEffect(() => {
    if (product) setUnitPrice(String(product.unitPrice));
  }, [product]);

  const submit = () => {
    if (!customerId || !productId || Number(quantity) <= 0 || Number(unitPrice) < 0 || !date) {
      Alert.alert("بيانات ناقصة", "اختر العميل والمنتج وأدخل الكمية والسعر والتاريخ بشكل صحيح.");
      return;
    }
    addSale({ id: uid("sale"), customerId, productId, quantity: Number(quantity), unitPrice: Number(unitPrice), discount: Number(discount || 0), total, date, note: note.trim() || undefined });
    onComplete();
  };

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Text style={styles.helper}>سجّل البيع ليتم تحديث التارجت والمتبقي تلقائياً.</Text>
      <SelectField label="العميل" value={customer?.name} placeholder="اختر العميل" onPress={() => setPicker("customer")} />
      <SelectField label="المنتج" value={product?.name} placeholder="اختر المنتج" onPress={() => setPicker("product")} />
      <View style={styles.row}><View style={styles.half}><InputField label="الكمية" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="0" /></View><View style={styles.half}><InputField label="سعر الوحدة" value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" placeholder="0" /></View></View>
      <InputField label="خصم (اختياري)" value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" placeholder="0" />
      <View style={styles.totalBox}><Text style={styles.totalLabel}>إجمالي البيع</Text><Text style={styles.totalValue}>{currency(total)} ج.م</Text></View>
      <InputField label="التاريخ (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-01" />
      <InputField label="ملاحظة (اختيارية)" value={note} onChangeText={setNote} multiline placeholder="مثل: فاتورة أو ملاحظة للزيارة" />
      <PrimaryButton label="حفظ عملية البيع" onPress={submit} icon="check-circle" />
      <ChoiceSheet visible={picker === "customer"} title="اختر العميل" options={customers.map((item) => ({ id: item.id, label: item.name }))} onClose={() => setPicker(null)} onSelect={(id) => { setCustomerId(id); setPicker(null); }} emptyText="أضف عميلاً أولاً من تبويب العملاء." />
      <ChoiceSheet visible={picker === "product"} title="اختر المنتج" options={products.map((item) => ({ id: item.id, label: item.name, caption: `${currency(item.unitPrice)} ج.م` }))} onClose={() => setPicker(null)} onSelect={(id) => { setProductId(id); setPicker(null); }} emptyText="أضف منتجاً أولاً من تبويب المنتجات." />
    </ScrollView>
  );
}

export function CollectionForm({ initialCustomerId, onComplete }: { initialCustomerId?: string; onComplete: () => void }) {
  const { customers, addCollection } = useTargetStore();
  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(localDate());
  const [note, setNote] = useState("");
  const [picker, setPicker] = useState(false);
  const customer = customers.find((item) => item.id === customerId);

  const submit = () => {
    if (!customerId || Number(amount) <= 0 || !date) {
      Alert.alert("بيانات ناقصة", "اختر العميل وأدخل مبلغ التحصيل والتاريخ بشكل صحيح.");
      return;
    }
    addCollection({ id: uid("collection"), customerId, amount: Number(amount), date, note: note.trim() || undefined });
    onComplete();
  };

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Text style={styles.helper}>سيظهر التحصيل فوراً في مؤشر الإنجاز والمتبقي.</Text>
      <SelectField label="العميل" value={customer?.name} placeholder="اختر العميل" onPress={() => setPicker(true)} />
      <InputField label="قيمة التحصيل" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
      <InputField label="التاريخ (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-01" />
      <InputField label="ملاحظة (اختيارية)" value={note} onChangeText={setNote} multiline placeholder="مثل: رقم الإيصال" />
      <PrimaryButton label="حفظ عملية التحصيل" onPress={submit} icon="check-circle" />
      <ChoiceSheet visible={picker} title="اختر العميل" options={customers.map((item) => ({ id: item.id, label: item.name }))} onClose={() => setPicker(false)} onSelect={(id) => { setCustomerId(id); setPicker(false); }} emptyText="أضف عميلاً أولاً من تبويب العملاء." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { padding: 20, paddingBottom: 46 },
  helper: { color: "#766C79", textAlign: "right", lineHeight: 20, marginBottom: 20, fontSize: 13 },
  row: { flexDirection: "row-reverse", gap: 10 },
  half: { flex: 1 },
  totalBox: { backgroundColor: "#F7F0E7", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 15, marginBottom: 17, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: "#7A5A21", fontWeight: "800", fontSize: 14 },
  totalValue: { color: "#9B6211", fontWeight: "900", fontSize: 18 },
});
