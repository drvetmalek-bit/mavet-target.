import { router, useLocalSearchParams } from "expo-router";

import { AppHeader } from "@/components/mavet-ui";
import { CollectionForm } from "@/components/record-form";
import { ScreenContainer } from "@/components/screen-container";

export default function CollectionScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><AppHeader title="تسجيل تحصيل" subtitle="أضف عملية تحصيل جديدة" /><CollectionForm initialCustomerId={customerId} onComplete={() => router.back()} /></ScreenContainer>;
}
