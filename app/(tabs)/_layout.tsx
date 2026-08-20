import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.tint, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" }, tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, paddingTop: 7, paddingBottom: bottomPadding, height: 57 + bottomPadding } }}>
      <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: ({ color }) => <IconSymbol size={25} name="chart.bar.fill" color={color} /> }} />
      <Tabs.Screen name="customers" options={{ title: "العملاء", tabBarIcon: ({ color }) => <IconSymbol size={25} name="person.2.fill" color={color} /> }} />
      <Tabs.Screen name="products" options={{ title: "المنتجات", tabBarIcon: ({ color }) => <IconSymbol size={25} name="shippingbox.fill" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "الإعدادات", tabBarIcon: ({ color }) => <IconSymbol size={25} name="gearshape.fill" color={color} /> }} />
    </Tabs>
  );
}
