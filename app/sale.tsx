import { router, useLocalSearchParams } from "expo-router";

import { AppHeader } from "@/components/mavet-ui";
import { SaleForm } from "@/components/record-form";
import { ScreenContainer } from "@/components/screen-container";

export default function SaleScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><AppHeader title="تسجيل بيع" subtitle="أضف عملية بيع جديدة" /><SaleForm initialCustomerId={customerId} onComplete={() => router.back()} /></ScreenContainer>;
}
