import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, ChoiceSheet, InputField, PrimaryButton, SelectField } from "@/components/mavet-ui";
import { quarterForDate, uid } from "@/lib/target-data";
import { useTargetStore } from "@/lib/target-store";
import { ScreenContainer } from "@/components/screen-container";

const quarters = [1, 2, 3, 4] as const;

export default function TargetSettingsScreen() {
  const { activeTarget, upsertTarget } = useTargetStore();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(quarterForDate());
  const [salesTarget, setSalesTarget] = useState("");
  const [collectionTarget, setCollectionTarget] = useState("");
  const [openQuarter, setOpenQuarter] = useState(false);

  useEffect(() => {
    if (activeTarget) {
      setYear(String(activeTarget.year));
      setQuarter(activeTarget.quarter);
      setSalesTarget(String(activeTarget.salesTarget));
      setCollectionTarget(String(activeTarget.collectionTarget));
    }
  }, [activeTarget]);

  const submit = () => {
    if (!/^\d{4}$/.test(year) || Number(salesTarget) < 0 || Number(collectionTarget) < 0) {
      Alert.alert("راجع البيانات", "أدخل سنة صحيحة وتارجت البيع والتحصيل بشكل رقمي.");
      return;
    }
    upsertTarget({ id: activeTarget?.id ?? uid("target"), year: Number(year), quarter, salesTarget: Number(salesTarget || 0), collectionTarget: Number(collectionTarget || 0), createdAt: activeTarget?.createdAt ?? new Date().toISOString() });
    router.back();
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><AppHeader title="إعداد تارجت الربع" subtitle="التارجت يكون لربع سنة ميلادية" action={undefined} /><Text style={styles.info}>سيساعدك التطبيق في توزيع المتبقي تلقائياً حسب اليوم أو الأسبوع أو الشهر حتى نهاية الربع.</Text><InputField label="السنة" value={year} onChangeText={setYear} keyboardType="numeric" placeholder="2026" /><SelectField label="الربع الميلادي" value={`الربع ${quarter}`} onPress={() => setOpenQuarter(true)} /><View style={styles.periods}><Text style={styles.periodText}>الربع ١: يناير – مارس</Text><Text style={styles.periodText}>الربع ٢: أبريل – يونيو</Text><Text style={styles.periodText}>الربع ٣: يوليو – سبتمبر</Text><Text style={styles.periodText}>الربع ٤: أكتوبر – ديسمبر</Text></View><InputField label="تارجت البيع (ج.م)" value={salesTarget} onChangeText={setSalesTarget} keyboardType="decimal-pad" placeholder="0" /><InputField label="تارجت التحصيل (ج.م)" value={collectionTarget} onChangeText={setCollectionTarget} keyboardType="decimal-pad" placeholder="0" /><PrimaryButton label="حفظ التارجت" onPress={submit} icon="check-circle" /><ChoiceSheet visible={openQuarter} title="اختر الربع" options={quarters.map((value) => ({ id: String(value), label: `الربع ${value}` }))} onSelect={(id) => { setQuarter(Number(id) as 1 | 2 | 3 | 4); setOpenQuarter(false); }} onClose={() => setOpenQuarter(false)} emptyText="" /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ scroll: { padding: 20, paddingBottom: 42 }, info: { color: "#766C79", textAlign: "right", fontSize: 13, lineHeight: 21, marginBottom: 20 }, periods: { backgroundColor: "#F6F1F7", borderRadius: 14, padding: 13, marginTop: -7, marginBottom: 18, gap: 4 }, periodText: { color: "#766C79", fontSize: 12, textAlign: "right" } });
