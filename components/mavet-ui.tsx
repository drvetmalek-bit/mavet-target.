import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type HeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function AppHeader({ title, subtitle, action, compact = false }: HeaderProps) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.headerSide}>
        {action}
        <Image source={require("@/assets/images/mavet-pharma-logo.webp")} style={styles.logo} contentFit="contain" />
      </View>
    </View>
  );
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.sectionTitle}>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : <View />}
      <Text style={styles.sectionHeading}>{title}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon = "add", disabled = false, iconSide = "right" }: { label: string; onPress: () => void; icon?: React.ComponentProps<typeof MaterialIcons>["name"]; disabled?: boolean; iconSide?: "left" | "right" }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.primaryButton, iconSide === "left" ? styles.primaryButtonIconLeft : styles.primaryButtonIconRight, (pressed || disabled) && styles.pressed, disabled && styles.disabled]}>
      <MaterialIcons name={icon} size={19} color="#FFFFFF" />
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, icon = "edit", tone = "purple" }: { label: string; onPress: () => void; icon?: React.ComponentProps<typeof MaterialIcons>["name"]; tone?: "purple" | "gold" | "danger" }) {
  const tint = tone === "gold" ? "#E89B2C" : tone === "danger" ? "#B84343" : "#4A1E53";
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, { borderColor: tint }, pressed && styles.pressed]}>
      <MaterialIcons name={icon} size={18} color={tint} />
      <Text style={[styles.ghostText, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

export function IconAction({ icon, onPress, label }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; onPress: () => void; label: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}>
      <MaterialIcons name={icon} color="#4A1E53" size={21} />
    </Pressable>
  );
}

export function InputField({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false, editable = true }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: "default" | "numeric" | "decimal-pad" | "phone-pad"; multiline?: boolean; editable?: boolean }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A49AA7"
        keyboardType={keyboardType}
        textAlign="right"
        multiline={multiline}
        editable={editable}
        returnKeyType="done"
      />
    </View>
  );
}

export function SelectField({ label, value, placeholder = "اختر", onPress }: { label: string; value?: string; placeholder?: string; onPress: () => void }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.select, pressed && styles.pressed]}>
        <MaterialIcons name="expand-more" size={23} color="#766C79" />
        <Text style={[styles.selectText, !value && styles.placeholder]}>{value || placeholder}</Text>
      </Pressable>
    </View>
  );
}

export function ProgressBar({ value, color = "#4A1E53" }: { value: number; color?: string }) {
  return <View style={styles.progressTrack}><View style={[styles.progressFill, { backgroundColor: color, width: `${Math.max(0, Math.min(100, value))}%` }]} /></View>;
}

export function MetricCard({ label, value, caption, accent = "#4A1E53", icon, iconSide = "right" }: { label: string; value: string; caption?: string; accent?: string; icon: React.ComponentProps<typeof MaterialIcons>["name"]; iconSide?: "left" | "right" }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, iconSide === "left" ? styles.metricIconLeft : styles.metricIconRight, { backgroundColor: `${accent}18` }]}><MaterialIcons name={icon} color={accent} size={20} /></View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      {caption ? <Text style={styles.metricCaption}>{caption}</Text> : null}
    </View>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; title: string; description: string; action?: ReactNode }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><MaterialIcons name={icon} color="#4A1E53" size={28} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

export type SelectOption = { id: string; label: string; caption?: string };

export function ChoiceSheet({ visible, title, options, onSelect, onClose, emptyText }: { visible: boolean; title: string; options: SelectOption[]; onSelect: (id: string) => void; onClose: () => void; emptyText: string }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetTitleRow}>
            <IconAction icon="close" label="إغلاق" onPress={onClose} />
            <Text style={styles.sheetTitle}>{title}</Text>
          </View>
          {options.length === 0 ? <Text style={styles.sheetEmpty}>{emptyText}</Text> : options.map((option) => (
            <Pressable key={option.id} onPress={() => onSelect(option.id)} style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}>
              <View><Text style={styles.optionLabel}>{option.label}</Text>{option.caption ? <Text style={styles.optionCaption}>{option.caption}</Text> : null}</View>
              <MaterialIcons name="chevron-left" size={22} color="#766C79" />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 2, paddingBottom: 20, gap: 12 },
  headerCompact: { paddingBottom: 12 },
  headerText: { flex: 1, alignItems: "flex-end" },
  headerTitle: { fontSize: 25, lineHeight: 32, color: "#1E1522", fontWeight: "800", textAlign: "right" },
  headerSubtitle: { fontSize: 13, color: "#766C79", marginTop: 2, textAlign: "right" },
  headerSide: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 76, height: 38 },
  sectionTitle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionHeading: { color: "#1E1522", fontSize: 17, lineHeight: 24, fontWeight: "800", textAlign: "right" },
  sectionDetail: { color: "#4A1E53", fontSize: 13, fontWeight: "700" },
  primaryButton: { alignItems: "center", justifyContent: "center", alignSelf: "stretch", backgroundColor: "#4A1E53", minHeight: 52, borderRadius: 16, gap: 9, paddingHorizontal: 16 },
  primaryButtonIconRight: { flexDirection: "row-reverse" },
  primaryButtonIconLeft: { flexDirection: "row" },
  primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  ghostButton: { flexDirection: "row-reverse", gap: 6, alignItems: "center", justifyContent: "center", minHeight: 40, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12 },
  ghostText: { fontSize: 13, fontWeight: "800" },
  iconAction: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#F4EDF6" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  fieldWrap: { gap: 7, marginBottom: 16 },
  fieldLabel: { color: "#4A1E53", fontSize: 13, fontWeight: "800", textAlign: "right" },
  input: { minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E8DFE9", backgroundColor: "#FFFFFF", color: "#1E1522", fontSize: 15 },
  inputDisabled: { backgroundColor: "#F7F3F8", color: "#766C79" },
  textArea: { minHeight: 92, paddingTop: 13, textAlignVertical: "top" },
  select: { minHeight: 52, borderWidth: 1, borderColor: "#E8DFE9", backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: "#1E1522", fontSize: 15, textAlign: "right", flex: 1 },
  placeholder: { color: "#A49AA7" },
  progressTrack: { height: 8, backgroundColor: "#F0EAF1", borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 8 },
  metricCard: { flex: 1, minWidth: 0, padding: 13, gap: 5, backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 17 },
  metricIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  metricIconRight: { alignSelf: "flex-end" },
  metricIconLeft: { alignSelf: "flex-start" },
  metricLabel: { color: "#766C79", fontSize: 12, fontWeight: "700", textAlign: "right" },
  metricValue: { fontSize: 19, lineHeight: 25, fontWeight: "900", textAlign: "right" },
  metricCaption: { color: "#9A8E9E", fontSize: 11, textAlign: "right" },
  emptyState: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E8DFE9", borderWidth: 1, borderRadius: 20, paddingVertical: 30, paddingHorizontal: 24, marginTop: 10 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: "#F4EDF6", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { color: "#1E1522", fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyDescription: { color: "#766C79", fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 5, maxWidth: 270 },
  emptyAction: { width: "100%", marginTop: 18 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(30,21,34,0.42)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FCFAFC", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 26, maxHeight: "75%" },
  sheetHandle: { alignSelf: "center", width: 44, height: 5, borderRadius: 99, backgroundColor: "#D7CCD9", marginBottom: 12 },
  sheetTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sheetTitle: { color: "#1E1522", fontSize: 18, fontWeight: "900" },
  sheetEmpty: { color: "#766C79", textAlign: "center", paddingVertical: 26 },
  sheetOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EDE6EE" },
  optionLabel: { color: "#1E1522", fontSize: 15, fontWeight: "800", textAlign: "right" },
  optionCaption: { color: "#766C79", fontSize: 12, marginTop: 2, textAlign: "right" },
});
