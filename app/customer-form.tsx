import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { AppHeader, InputField, PrimaryButton } from "@/components/mavet-ui";
import { uid } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

export default function CustomerFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { customers, upsertCustomer } = useTargetStore();
  const current = useMemo(() => customers.find((item) => item.id === id), [customers, id]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => { if (current) { setName(current.name); setNote(current.note ?? ""); } }, [current]);
  const submit = () => {
    if (!name.trim()) { Alert.alert("اسم العميل مطلوب", "أدخل اسم العميل أولاً."); return; }
    upsertCustomer({ id: current?.id ?? uid("customer"), name: name.trim(), note: note.trim() || undefined, createdAt: current?.createdAt ?? new Date().toISOString() });
    router.back();
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 42 }} keyboardShouldPersistTaps="handled"><AppHeader title={current ? "تعديل العميل" : "إضافة عميل"} subtitle="سيبقى العميل محفوظاً على هاتفك" /><InputField label="اسم العميل" value={name} onChangeText={setName} placeholder="مثال: شركة النيل" /><InputField label="ملاحظة (اختيارية)" value={note} onChangeText={setNote} multiline placeholder="مثل: المنطقة أو اسم المسؤول" /><PrimaryButton label={current ? "حفظ التعديل" : "حفظ العميل"} onPress={submit} icon="check-circle" /></ScrollView></ScreenContainer>;
}
