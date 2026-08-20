import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, InputField, PrimaryButton } from "@/components/mavet-ui";
import { localDate, uid } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function QuickEntryScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const isSale = type === "sale";
  const { activeTarget, addSale, addCollection } = useTargetStore();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(localDate());
  const [note, setNote] = useState("");

  const submit = () => {
    if (!activeTarget) {
      Alert.alert("حدد تارجت الربع أولاً", "أدخل تارجت البيع والتحصيل قبل إضافة مبلغ محقق.");
      return;
    }
    if (Number(amount) <= 0 || !date) {
      Alert.alert("راجع البيانات", "أدخل مبلغاً محققاً أكبر من صفر وتاريخاً صحيحاً.");
      return;
    }
    const cleanNote = note.trim() || "إدخال سريع";
    if (isSale) {
      addSale({ id: uid("quick-sale"), customerId: "", productId: "", quantity: 0, unitPrice: Number(amount), discount: 0, total: Number(amount), date, note: cleanNote });
    } else {
      addCollection({ id: uid("quick-collection"), customerId: "", amount: Number(amount), date, note: cleanNote });
    }
    router.back();
  };

  const kind = isSale ? "بيع" : "تحصيل";
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AppHeader title={`${kind} سريع`} subtitle="سجّل المبلغ المحقق مباشرة" />
        <View style={[styles.notice, isSale ? styles.saleNotice : styles.collectionNotice]}>
          <Text style={styles.noticeTitle}>لا تحتاج لاختيار عميل أو منتج</Text>
          <Text style={styles.noticeText}>سيتم احتساب المبلغ فوراً ضمن المحقق ونسبة تحقيق تارجت الربع الحالي.</Text>
        </View>
        <InputField label={`المبلغ المحقق من ${kind} (ج.م)`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
        <InputField label="التاريخ (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-01" />
        <InputField label="ملاحظة (اختيارية)" value={note} onChangeText={setNote} multiline placeholder="مثل: إجمالي زيارة أو عملية مجمعة" />
        <PrimaryButton label={`إضافة ${kind} محقق`} onPress={submit} icon={isSale ? "trending-up" : "payments"} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 44 },
  notice: { borderRadius: 17, padding: 15, marginBottom: 20, alignItems: "flex-end" },
  saleNotice: { backgroundColor: "#FCF1DD" },
  collectionNotice: { backgroundColor: "#F4EDF6" },
  noticeTitle: { color: "#4A1E53", fontSize: 14, fontWeight: "900", textAlign: "right" },
  noticeText: { color: "#766C79", fontSize: 12, lineHeight: 19, marginTop: 4, textAlign: "right" },
});
