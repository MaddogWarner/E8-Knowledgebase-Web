import { controls } from '../data/controls';
import type { MaturityLevel, Microsoft365LicenseMode, OSScope, StepStateValue, StepStatus } from '../types';
import { auditEntriesPerStepCap, isoDate, trimNote, type AuditEntry, type AuditTrail } from './audit';
import { isLicenseMode } from './license';
import type { Profile } from './profiles';
import { isOSScope } from './scope';
import { iosToWebStepId, webToIosStepId } from './stepIds.mjs';

export const maximumBackupSize = 5_242_880;
export const backupErrors = {
  fileTooLarge: 'The selected backup is larger than the 5 MB safety limit. Export profiles individually if an all-profiles backup is too large.',
  invalidFile: 'The selected file is not a valid Essential 8 backup.'
};
export interface BackupProfile extends Profile {
  stepProgress: Record<string, StepStatus>;
  auditTrail: AuditTrail;
  targetMaturity: MaturityLevel;
  osScope: OSScope;
  licenseMode: Microsoft365LicenseMode;
}
export interface ImportedBackup {
  profiles: BackupProfile[];
  globalSettings: { deepAuditEnabled?: boolean; multiProfileEnabled?: boolean } | null;
}
const knownIds = new Set(controls.flatMap((control) => (['ml1', 'ml2', 'ml3'] as const).flatMap((level) => control[level].steps.map((step) => step.id))));
const wireStates: Record<StepStateValue, string> = {
  implemented: 'Implemented', notApplicable: 'Not Applicable', notImplemented: 'Not Implemented'
};
function state(value: unknown): StepStateValue | null {
  if (value === 'Implemented') return 'implemented';
  if (value === 'Not Applicable') return 'notApplicable';
  if (value === 'Not Implemented') return 'notImplemented';
  return null;
}
function invalid(): never { throw new Error(backupErrors.invalidFile); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) return invalid();
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return invalid();
  return isoDate(new Date(value));
}
function uuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)) return invalid();
  return value.toLowerCase();
}
function note(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return invalid();
  return trimNote(value);
}
function target(value: unknown): MaturityLevel {
  // Unknown or missing values fall back to the web default (ml1), not the iOS default.
  return value === 2 ? 'ml2' : value === 3 ? 'ml3' : 'ml1';
}
function progress(value: unknown): Record<string, StepStatus> {
  const result: Record<string, StepStatus> = {};
  for (const [id, raw] of Object.entries(object(value))) {
    const stepId = iosToWebStepId(id);
    if (!stepId || !knownIds.has(stepId)) continue;
    const entry = object(raw);
    const parsed = state(entry.state);
    if (!parsed) continue;
    const reason = note(entry.reason);
    if (parsed && parsed !== 'notImplemented') result[stepId] = parsed === 'notApplicable' && reason ? { state: parsed, reason } : { state: parsed };
  }
  return result;
}
function audit(value: unknown): AuditTrail {
  const result: AuditTrail = {};
  for (const [id, raw] of Object.entries(object(value))) {
    const stepId = iosToWebStepId(id);
    if (!stepId || !knownIds.has(stepId)) continue;
    if (!Array.isArray(raw)) return invalid();
    const entries: AuditEntry[] = [];
    for (const item of raw) {
      const entry = object(item);
      const previousState = state(entry.previousState);
      const newState = state(entry.newState);
      if (!previousState || !newState) continue;
      const parsed: AuditEntry = { id: uuid(entry.id), timestamp: date(entry.timestamp), previousState, newState };
      const text = note(entry.note);
      if (text) parsed.note = text;
      entries.push(parsed);
    }
    result[stepId] = entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-auditEntriesPerStepCap);
  }
  return result;
}
export function checkBackupSize(bytes: number): void {
  if (bytes > maximumBackupSize) throw new Error(backupErrors.fileTooLarge);
}
export function decodeBackup(text: string): ImportedBackup {
  checkBackupSize(new TextEncoder().encode(text).byteLength);
  let input: unknown;
  try {
    input = JSON.parse(text, (key, value: unknown) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') return invalid();
      return value;
    });
  } catch { return invalid(); }
  const root = object(input);
  if (!Number.isInteger(root.schemaVersion) || (root.schemaVersion as number) < 1) return invalid();
  if ((root.schemaVersion as number) > 2) throw new Error(`This backup uses schema version ${root.schemaVersion}. Update the app before importing it.`);
  if (typeof root.appVersion !== 'string') return invalid();
  date(root.exportedAt);
  if (root.schemaVersion === 1) {
    const settings = object(root.settings);
    if (settings.targetMaturityLevel != null && !Number.isInteger(settings.targetMaturityLevel)) return invalid();
    for (const key of ['osScopeFilter', 'microsoft365LicenseMode']) {
      if (settings[key] != null && typeof settings[key] !== 'string') return invalid();
    }
    return { profiles: [{
      id: crypto.randomUUID(), name: 'Imported', createdAt: isoDate(), stepProgress: progress(root.stepProgress), auditTrail: {},
      targetMaturity: target(settings.targetMaturityLevel), osScope: typeof settings.osScopeFilter === 'string' && isOSScope(settings.osScopeFilter) ? settings.osScopeFilter : 'both',
      licenseMode: typeof settings.microsoft365LicenseMode === 'string' && isLicenseMode(settings.microsoft365LicenseMode) ? settings.microsoft365LicenseMode : 'none'
    }], globalSettings: null };
  }
  if (!Array.isArray(root.profiles) || root.profiles.length === 0) return invalid();
  const seen = new Set<string>();
  const profiles = root.profiles.map((raw): BackupProfile => {
    const profile = object(raw);
    const id = uuid(profile.id);
    if (seen.has(id)) return invalid();
    seen.add(id);
    if (typeof profile.name !== 'string' || !profile.name.trim()) return invalid();
    if (!Number.isInteger(profile.targetMaturityLevelRaw) || typeof profile.osScopeFilterRaw !== 'string' || typeof profile.microsoft365LicenseModeRaw !== 'string') return invalid();
    return {
      id, name: profile.name.trim().slice(0, 40), createdAt: date(profile.createdAt), stepProgress: progress(profile.stepProgress), auditTrail: audit(profile.auditTrail),
      targetMaturity: target(profile.targetMaturityLevelRaw), osScope: isOSScope(profile.osScopeFilterRaw) ? profile.osScopeFilterRaw : 'both',
      licenseMode: isLicenseMode(profile.microsoft365LicenseModeRaw) ? profile.microsoft365LicenseModeRaw : 'none'
    };
  });
  let globalSettings: ImportedBackup['globalSettings'] = null;
  if (root.globalSettings !== null && root.globalSettings !== undefined) {
    const settings = object(root.globalSettings);
    globalSettings = {};
    for (const key of ['deepAuditEnabled', 'multiProfileEnabled'] as const) {
      if (settings[key] !== undefined && settings[key] !== null) {
        if (typeof settings[key] !== 'boolean') return invalid();
        globalSettings[key] = settings[key];
      }
    }
  }
  return { profiles, globalSettings };
}
export function encodeBackup(profiles: BackupProfile[], allProfiles: boolean, deepAuditEnabled: boolean, exportedAt = new Date()): string {
  const wire = {
    schemaVersion: 2, appVersion: __APP_VERSION__, exportedAt: isoDate(exportedAt),
    profiles: profiles.map((profile) => ({
      id: profile.id, name: profile.name, createdAt: isoDate(new Date(profile.createdAt)),
      stepProgress: Object.fromEntries(Object.entries(profile.stepProgress).filter(([id, entry]) => knownIds.has(id) && (entry.state === 'implemented' || entry.state === 'notApplicable')).map(([id, entry]) => [webToIosStepId(id)!, {
        state: wireStates[entry.state], ...(entry.state === 'notApplicable' && entry.reason ? { reason: trimNote(entry.reason) } : {})
      }])),
      auditTrail: Object.fromEntries(Object.entries(profile.auditTrail).filter(([id]) => knownIds.has(id)).map(([id, entries]) => [webToIosStepId(id)!, entries.slice(-auditEntriesPerStepCap).map((entry) => ({
        id: entry.id, timestamp: isoDate(new Date(entry.timestamp)), previousState: wireStates[entry.previousState], newState: wireStates[entry.newState], ...(entry.note ? { note: trimNote(entry.note) } : {})
      }))])),
      targetMaturityLevelRaw: Number(profile.targetMaturity.slice(-1)), osScopeFilterRaw: profile.osScope, microsoft365LicenseModeRaw: profile.licenseMode
    })),
    globalSettings: allProfiles ? { deepAuditEnabled, multiProfileEnabled: profiles.length > 1 } : null
  };
  const text = JSON.stringify(wire, null, 2);
  checkBackupSize(new TextEncoder().encode(text).byteLength);
  return text;
}
