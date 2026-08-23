import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";

import { ScreenContainer } from "@/components/screen-container";

export default function LaunchScreen() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace("/(tabs)"), 1700);
    return () => clearTimeout(timer);
  }, []);

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background"><StatusBar style="dark" /><View style={styles.content}><Image source={require("@/assets/images/mavet-target-ui-logo.webp")} style={styles.logo} contentFit="contain" /><View style={styles.copy}><Text style={styles.title}>Mavet Target</Text><Text style={styles.subtitle}>متابعة أهداف البيع والتحصيل</Text></View><View style={styles.loading}><View style={styles.loadingFill} /></View></View></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, backgroundColor: "#FCFAFC" }, logo: { width: 254, height: 205 }, copy: { alignItems: "center", marginTop: 12 }, title: { color: "#4A1E53", fontSize: 24, fontWeight: "900" }, subtitle: { color: "#766C79", fontSize: 13, marginTop: 5 }, loading: { width: 104, height: 4, overflow: "hidden", borderRadius: 99, backgroundColor: "#EDE5EF", marginTop: 44 }, loadingFill: { width: "63%", height: "100%", borderRadius: 99, backgroundColor: "#E89B2C" } });
