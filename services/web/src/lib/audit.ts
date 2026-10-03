import type { StepStateValue, StepStatus } from '../types';

export interface AuditEntry {
  id: string;
  timestamp: string;
  previousState: StepStateValue;
  newState: StepStateValue;
  note?: string;
}
export type AuditTrail = Record<string, AuditEntry[]>;
export const auditEntriesPerStepCap = 200;
export const noteTextMaxLength = 2000;
export const stepStateLabels: Record<StepStateValue, string> = {
  implemented: 'Implemented', notApplicable: 'Not applicable', notImplemented: 'Not implemented'
};
export function isoDate(date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
export function trimNote(value: string): string | undefined {
  return value.trim().slice(0, noteTextMaxLength) || undefined;
}
export function recordAudit(trail: AuditTrail, stepId: string, previous: StepStateValue, next: StepStatus, enabled: boolean, note?: string): AuditTrail {
  if (!enabled || previous === next.state) return trail;
  const entry: AuditEntry = {
    id: crypto.randomUUID(), timestamp: isoDate(), previousState: previous, newState: next.state,
    note: trimNote(note ?? '') ?? (next.state === 'notApplicable' ? trimNote(next.reason ?? '') : undefined)
  };
  return { ...trail, [stepId]: [...(trail[stepId] ?? []), entry].slice(-auditEntriesPerStepCap) };
}
export function readAudit(key: string): AuditTrail {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const result: AuditTrail = {};
    for (const [id, entries] of Object.entries(value)) {
      if (!/^[1-8]-ml[1-3]-[1-9]\d*$/.test(id) || !Array.isArray(entries)) continue;
      result[id] = entries.flatMap((raw: unknown): AuditEntry[] => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
        const entry = raw as Record<string, unknown>;
        if (typeof entry.id !== 'string' || typeof entry.timestamp !== 'string' || !Number.isFinite(Date.parse(entry.timestamp)) || !isStepState(entry.previousState) || !isStepState(entry.newState)) return [];
        return [{ id: entry.id, timestamp: isoDate(new Date(entry.timestamp)), previousState: entry.previousState, newState: entry.newState,
          note: typeof entry.note === 'string' ? trimNote(entry.note) : undefined }];
      }).slice(-auditEntriesPerStepCap);
    }
    return result;
  } catch { return {}; }
}

function isStepState(value: unknown): value is StepStateValue {
  return value === 'implemented' || value === 'notImplemented' || value === 'notApplicable';
}
