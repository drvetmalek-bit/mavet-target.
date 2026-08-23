import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { AppHeader, InputField, PrimaryButton } from "@/components/mavet-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useTargetStore } from "@/lib/target-store";

export default function RepresentativeProfileScreen() {
  const { representative, upsertRepresentative } = useTargetStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [territory, setTerritory] = useState("");
  useEffect(() => { if (representative) { setName(representative.name); setPhone(representative.phone ?? ""); setTerritory(representative.territory ?? ""); } }, [representative]);
  const submit = () => {
    if (!name.trim()) { Alert.alert("اسم المندوب مطلوب", "أدخل الاسم ليظهر في رأس التقرير."); return; }
    upsertRepresentative({ name: name.trim(), phone: phone.trim() || undefined, territory: territory.trim() || undefined });
    router.back();
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 42 }} keyboardShouldPersistTaps="handled"><AppHeader title="بيانات المندوب" subtitle="تظهر تلقائياً في رأس تقارير Excel وPDF" /><InputField label="اسم المندوب" value={name} onChangeText={setName} placeholder="مثال: أحمد محمد" /><InputField label="رقم الهاتف (اختياري)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="01xxxxxxxxx" /><InputField label="المنطقة أو القطاع (اختياري)" value={territory} onChangeText={setTerritory} placeholder="مثال: القاهرة الكبرى" /><PrimaryButton label="حفظ بيانات المندوب" onPress={submit} icon="check-circle" /></ScrollView></ScreenContainer>;
}
