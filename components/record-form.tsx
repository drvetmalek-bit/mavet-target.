import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceSheet, InputField, PrimaryButton, SelectField } from "@/components/mavet-ui";
import { currency, localDate, quantityFormat, uid } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";

export function SaleForm({ initialCustomerId, onComplete }: { initialCustomerId?: string; onComplete: () => void }) {
  const { customers, products, addSale, latestStockForProduct } = useTargetStore();
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
  const stock = productId ? latestStockForProduct(productId) : { hasCount: false, quantity: 0 };
  const requested = Number(quantity || 0);
  const afterInvoice = stock.hasCount ? stock.quantity - requested : undefined;
  const total = useMemo(() => Math.max(0, requested * Number(unitPrice || 0) - Number(discount || 0)), [discount, requested, unitPrice]);
  useEffect(() => { if (product) setUnitPrice(String(product.unitPrice)); }, [product]);
  const submit = () => {
    if (!customerId || !productId || requested <= 0 || Number(unitPrice) < 0 || !date) { Alert.alert("بيانات ناقصة", "اختر العميل والمنتج وأدخل الكمية والسعر والتاريخ بشكل صحيح."); return; }
    if (stock.hasCount && (afterInvoice ?? 0) < 0) { Alert.alert("رصيد غير كافٍ", `الرصيد المتاح للمنتج هو ${quantityFormat(stock.quantity)} وحدة فقط.`); return; }
    addSale({ id: uid("sale"), customerId, productId, quantity: requested, unitPrice: Number(unitPrice), discount: Number(discount || 0), total, date, note: note.trim() || undefined });
    const message = stock.hasCount ? `تم خصم ${quantityFormat(requested)} وحدة من المخزن. الرصيد بعد الفاتورة: ${quantityFormat(afterInvoice ?? 0)} وحدة.` : "تم تسجيل البيع. لم يُسجل رصيد مخزن لهذا المنتج بعد؛ أجرِ جرداً لتفعيل التحديث التلقائي للرصيد.";
    Alert.alert("تم حفظ عملية البيع", message, [{ text: "تم", onPress: onComplete }]);
  };
  return <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled"><Text style={styles.helper}>سجّل البيع ليتم تحديث التارجت والمتبقي تلقائياً. عند وجود جرد، سيُخصم الرصيد فوراً.</Text><SelectField label="العميل" value={customer?.name} placeholder="اختر العميل" onPress={() => setPicker("customer")} /><SelectField label="المنتج" value={product ? `${product.name}${product.packSize ? ` — ${product.packSize}` : ""}` : undefined} placeholder="اختر المنتج" onPress={() => setPicker("product")} />{product ? <View style={[styles.stockBox, stock.hasCount ? styles.stockKnown : styles.stockUnknown]}><Text style={styles.stockLabel}>{stock.hasCount ? "الرصيد المتاح قبل الفاتورة" : "حالة المخزون"}</Text><Text style={styles.stockValue}>{stock.hasCount ? `${quantityFormat(stock.quantity)} وحدة` : "لم يتم جرد هذا المنتج"}</Text>{stock.hasCount && requested > 0 ? <Text style={[styles.stockAfter, (afterInvoice ?? 0) < 0 && styles.stockWarning]}>الرصيد بعد الفاتورة: {quantityFormat(Math.max(0, afterInvoice ?? 0))} وحدة</Text> : null}</View> : null}<View style={styles.row}><View style={styles.half}><InputField label="الكمية" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="0" /></View><View style={styles.half}><InputField label="سعر الوحدة" value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" placeholder="0" /></View></View><InputField label="خصم (اختياري)" value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" placeholder="0" /><View style={styles.totalBox}><Text style={styles.totalLabel}>إجمالي البيع</Text><Text style={styles.totalValue}>{currency(total)} ج.م</Text></View><InputField label="التاريخ (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-01" /><InputField label="ملاحظة (اختيارية)" value={note} onChangeText={setNote} multiline placeholder="مثل: فاتورة أو ملاحظة للزيارة" /><PrimaryButton label="حفظ عملية البيع" onPress={submit} icon="check-circle" /><ChoiceSheet visible={picker === "customer"} title="اختر العميل" options={customers.map((item) => ({ id: item.id, label: item.name }))} onClose={() => setPicker(null)} onSelect={(id) => { setCustomerId(id); setPicker(null); }} emptyText="أضف عميلاً أولاً من تبويب العملاء." /><ChoiceSheet visible={picker === "product"} title="اختر المنتج" options={products.map((item) => { const itemStock = latestStockForProduct(item.id); return { id: item.id, label: `${item.name}${item.packSize ? ` — ${item.packSize}` : ""}`, caption: `${currency(item.unitPrice)} ج.م${itemStock.hasCount ? ` • متاح ${quantityFormat(itemStock.quantity)}` : ""}` }; })} onClose={() => setPicker(null)} onSelect={(id) => { setProductId(id); setPicker(null); }} emptyText="أضف منتجاً أولاً من تبويب المنتجات." /></ScrollView>;
}

export function CollectionForm({ initialCustomerId, onComplete }: { initialCustomerId?: string; onComplete: () => void }) {
  const { customers, addCollection } = useTargetStore();
  const [customerId, setCustomerId] = useState(initialCustomerId ?? ""); const [amount, setAmount] = useState(""); const [date, setDate] = useState(localDate()); const [note, setNote] = useState(""); const [picker, setPicker] = useState(false); const customer = customers.find((item) => item.id === customerId);
  const submit = () => { if (!customerId || Number(amount) <= 0 || !date) { Alert.alert("بيانات ناقصة", "اختر العميل وأدخل مبلغ التحصيل والتاريخ بشكل صحيح."); return; } addCollection({ id: uid("collection"), customerId, amount: Number(amount), date, note: note.trim() || undefined }); onComplete(); };
  return <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled"><Text style={styles.helper}>سيظهر التحصيل فوراً في مؤشر الإنجاز والمتبقي.</Text><SelectField label="العميل" value={customer?.name} placeholder="اختر العميل" onPress={() => setPicker(true)} /><InputField label="قيمة التحصيل" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" /><InputField label="التاريخ (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-01" /><InputField label="ملاحظة (اختيارية)" value={note} onChangeText={setNote} multiline placeholder="مثل: رقم الإيصال" /><PrimaryButton label="حفظ عملية التحصيل" onPress={submit} icon="check-circle" /><ChoiceSheet visible={picker} title="اختر العميل" options={customers.map((item) => ({ id: item.id, label: item.name }))} onClose={() => setPicker(false)} onSelect={(id) => { setCustomerId(id); setPicker(false); }} emptyText="أضف عميلاً أولاً من تبويب العملاء." /></ScrollView>;
}

const styles = StyleSheet.create({ form: { padding: 20, paddingBottom: 46 }, helper: { color: "#766C79", textAlign: "right", lineHeight: 20, marginBottom: 20, fontSize: 13 }, row: { flexDirection: "row-reverse", gap: 10 }, half: { flex: 1 }, totalBox: { backgroundColor: "#F7F0E7", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 15, marginBottom: 17, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, totalLabel: { color: "#7A5A21", fontWeight: "800", fontSize: 14 }, totalValue: { color: "#9B6211", fontWeight: "900", fontSize: 18 }, stockBox: { padding: 14, borderRadius: 15, marginTop: -4, marginBottom: 16, alignItems: "flex-end" }, stockKnown: { backgroundColor: "#EAF7F1", borderWidth: 1, borderColor: "#B8E2CC" }, stockUnknown: { backgroundColor: "#F7F3F8", borderWidth: 1, borderColor: "#E8DFE9" }, stockLabel: { color: "#476555", fontSize: 12, fontWeight: "800" }, stockValue: { color: "#1F6A48", fontSize: 20, fontWeight: "900", marginTop: 3 }, stockAfter: { color: "#2E7D5B", fontSize: 12, fontWeight: "800", marginTop: 4 }, stockWarning: { color: "#B84343" } });
