import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { createBackupPayload, readBackupPayload } from "./backup-format";
import { type AppData } from "./target-data";

export { createBackupPayload, readBackupPayload } from "./backup-format";

export async function createAndShareBackup(data: AppData) {
  if (Platform.OS === "web") throw new Error("أنشئ النسخة الاحتياطية من تطبيق Mavet Target على الهاتف لحفظها ضمن ملفات الجهاز.");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const uri = `${FileSystem.documentDirectory}Mavet_Target_Backup_${stamp}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(createBackupPayload(data), null, 2), { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) throw new Error("المشاركة غير متاحة على هذا الجهاز.");
  await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "حفظ نسخة Mavet Target الاحتياطية", UTI: "public.json" });
}

export async function selectBackupForRestore() {
  if (Platform.OS === "web") throw new Error("استعد النسخة الاحتياطية من تطبيق Mavet Target على الهاتف.");
  const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/json", "text/plain"], copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
  return readBackupPayload(content);
}
