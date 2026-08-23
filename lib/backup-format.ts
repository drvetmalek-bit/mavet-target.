import { normalizeAppData, type AppData } from "./target-data";

export const BACKUP_FORMAT = "mavet-target-backup";
export const BACKUP_VERSION = 1;

export type BackupPayload = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  data: AppData;
};

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BackupPayload>;
  return item.format === BACKUP_FORMAT && item.version === BACKUP_VERSION && !!item.data && typeof item.data === "object" && Array.isArray(item.data.targets) && Array.isArray(item.data.customers) && Array.isArray(item.data.products) && Array.isArray(item.data.sales) && Array.isArray(item.data.collections);
}

export function createBackupPayload(data: AppData): BackupPayload {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: normalizeAppData(data) };
}

export function readBackupPayload(raw: string): AppData {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("ملف النسخة الاحتياطية ليس ملف JSON صالحاً."); }
  if (!isBackupPayload(parsed)) throw new Error("هذا الملف ليس نسخة احتياطية متوافقة مع Mavet Target.");
  return normalizeAppData(parsed.data);
}
