import { controls } from '../data/controls';
import { describe, expect, it } from 'vitest';
import iosV2 from './fixtures/ios-backup-v2.json';
import iosV1 from './fixtures/ios-backup-v1.json';
import { backupErrors, checkBackupSize, decodeBackup, encodeBackup, maximumBackupSize } from '../lib/backup';
import { auditEntriesPerStepCap } from '../lib/audit';
const sample = () => decodeBackup(JSON.stringify(iosV2));

describe('iOS backup codec', () => {
  it('imports the iOS v2 golden fixture into the correct web steps', () => {
    const { profiles: [profile], globalSettings } = sample();
    expect(profile.id).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(profile.stepProgress).toEqual({ '1-ml1-1': { state: 'implemented' }, '1-ml1-2': { state: 'notApplicable', reason: 'No scope' }, '8-ml3-3': { state: 'implemented' } });
    expect(profile.auditTrail['1-ml1-1'][0]).toEqual({ id: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', timestamp: '2026-10-03T01:00:00Z', previousState: 'notImplemented', newState: 'implemented', note: 'Enabled service' });
    expect(profile.targetMaturity).toBe('ml3');
    expect(profile.licenseMode).toBe('e5');
    expect(globalSettings).toBeNull();
  });
  it('exports the exact Swift wire shape and round trips without browser-only data or fractional dates', () => {
    const profile = sample().profiles[0];
    profile.createdAt = '2026-07-13T00:00:00.123Z';
    profile.auditTrail['1-ml1-1'][0].timestamp = '2026-10-03T01:00:00.999Z';
    profile.stepProgress['1-ml1-3'] = { state: 'notImplemented' };
    const text = encodeBackup([profile], false, true, new Date('2026-10-03T01:02:03.456Z'));
    const expected = structuredClone(iosV2);
    expected.appVersion = '3.5.0';
    expected.profiles[0].id = expected.profiles[0].id.toLowerCase();
    expected.profiles[0].stepProgress['1-1-1'].reason = 'No scope';
    expected.profiles[0].auditTrail['1-1-0'][0].id = expected.profiles[0].auditTrail['1-1-0'][0].id.toLowerCase();
    expected.profiles[0].auditTrail['1-1-0'][0].note = 'Enabled service';
    expect(JSON.parse(text)).toEqual(expected);
    for (const timestamp of text.match(/\d{4}-\d\d-\d\dT[^"\s]+/g) ?? []) expect(timestamp).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    expect(decodeBackup(text)).toEqual(sample());
    expect(text).not.toMatch(/hideComplete|theme|evidence|showSplash|referenceOnly/);
  });
  it('round trips statuses on all 67 steps with both boundaries of each level intact', () => {
    const profile = sample().profiles[0];
    const steps = controls.flatMap((control) => (['ml1', 'ml2', 'ml3'] as const).flatMap((level) => control[level].steps));
    profile.stepProgress = Object.fromEntries(steps.map((step, index) => [step.id, index % 2 ? { state: 'notApplicable' as const, reason: 'No scope' } : { state: 'implemented' as const }]));
    const text = encodeBackup([profile], false, false);
    expect(Object.keys(JSON.parse(text).profiles[0].stepProgress)).toHaveLength(67);
    expect(decodeBackup(text).profiles[0].stepProgress).toEqual(profile.stepProgress);
  });
  it('converts every audit state raw value and rejects over-limit exports', () => {
    const profile = sample().profiles[0];
    profile.auditTrail['1-ml1-1'] = [
      { ...profile.auditTrail['1-ml1-1'][0], previousState: 'implemented', newState: 'notApplicable' },
      { ...profile.auditTrail['1-ml1-1'][0], previousState: 'notApplicable', newState: 'notImplemented' }
    ];
    expect(decodeBackup(encodeBackup([profile], false, false)).profiles[0].auditTrail).toEqual(profile.auditTrail);
    const entry = { ...profile.auditTrail['1-ml1-1'][0], note: 'a'.repeat(2000) };
    for (const step of controls.flatMap((control) => control.ml1.steps)) profile.auditTrail[step.id] = Array.from({ length: 200 }, () => entry);
    expect(() => encodeBackup([profile], true, true)).toThrow(backupErrors.fileTooLarge);
  });
  it('exports global settings only for all profiles and caps audit entries', () => {
    const profile = sample().profiles[0];
    profile.auditTrail['1-ml1-1'] = Array.from({ length: 205 }, () => profile.auditTrail['1-ml1-1'][0]);
    const wire = JSON.parse(encodeBackup([profile], true, true));
    expect(wire.globalSettings).toEqual({ deepAuditEnabled: true, multiProfileEnabled: false });
    expect(wire.profiles[0].auditTrail['1-1-0']).toHaveLength(auditEntriesPerStepCap);
  });
  it('imports the verbatim iOS v1 fixture and drops its unknown step', () => {
    const result = decodeBackup(JSON.stringify(iosV1));
    expect(result.profiles[0]).toMatchObject({ name: 'Imported', stepProgress: {}, targetMaturity: 'ml1', osScope: 'server', licenseMode: 'e5' });
    expect(result.globalSettings).toBeNull();
  });
  it('drops unknown steps/states and falls back on unknown setting raw values', () => {
    const wire = structuredClone(iosV2);
    Object.assign(wire.profiles[0].stepProgress, { '1-1-99': { state: 'Implemented' }, '1-1-2': { state: 'Done' } });
    wire.profiles[0].osScopeFilterRaw = 'unknown';
    wire.profiles[0].microsoft365LicenseModeRaw = 'unknown';
    expect(decodeBackup(JSON.stringify(wire)).profiles[0]).toMatchObject({ osScope: 'both', licenseMode: 'none', stepProgress: sample().profiles[0].stepProgress });
  });
  it('rejects hostile and malformed envelopes before exposing any data', () => {
    expect(() => decodeBackup('not JSON')).toThrow(backupErrors.invalidFile);
    expect(() => decodeBackup('{"__proto__":{"polluted":true},"schemaVersion":2}')).toThrow(backupErrors.invalidFile);
    expect(() => decodeBackup(JSON.stringify({ ...iosV2, schemaVersion: 3 }))).toThrow('This backup uses schema version 3. Update the app before importing it.');
    expect(() => decodeBackup(JSON.stringify({ ...iosV2, schemaVersion: 0 }))).toThrow(backupErrors.invalidFile);
    expect(() => decodeBackup(JSON.stringify({ ...iosV2, profiles: [] }))).toThrow(backupErrors.invalidFile);
    expect(() => decodeBackup(JSON.stringify({ ...iosV2, profiles: [iosV2.profiles[0], { ...iosV2.profiles[0], id: iosV2.profiles[0].id.toLowerCase() }] }))).toThrow(backupErrors.invalidFile);
    for (const patch of [{ name: '' }, { createdAt: 'yesterday' }, { createdAt: '2026-02-30T00:00:00Z' }, { id: '../theme' }, { auditTrail: [] }, { stepProgress: [] }]) expect(() => decodeBackup(JSON.stringify({ ...iosV2, profiles: [{ ...iosV2.profiles[0], ...patch }] }))).toThrow(backupErrors.invalidFile);
    expect(() => decodeBackup(JSON.stringify({ ...iosV2, globalSettings: { deepAuditEnabled: 'true' } }))).toThrow(backupErrors.invalidFile);
    expect(() => checkBackupSize(maximumBackupSize + 1)).toThrow(backupErrors.fileTooLarge);
    expect(() => decodeBackup(' '.repeat(maximumBackupSize + 1))).toThrow(backupErrors.fileTooLarge);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('falls back to the web default target maturity for unknown values', () => {
    const backup = structuredClone(iosV2) as { profiles: { targetMaturityLevelRaw: number }[] };
    backup.profiles[0].targetMaturityLevelRaw = 7;
    expect(decodeBackup(JSON.stringify(backup)).profiles[0].targetMaturity).toBe('ml1');
  });

  it('never exports a step with an unrecognised stored state', () => {
    const { profiles: [profile] } = sample();
    const corrupt = { ...profile, stepProgress: { ...profile.stepProgress, '1-ml1-3': { state: 'bogus' } } } as unknown as typeof profile;
    const wire = JSON.parse(encodeBackup([corrupt], false, false)) as { profiles: { stepProgress: Record<string, unknown> }[] };
    expect(wire.profiles[0].stepProgress['1-1-2']).toBeUndefined();
    expect(() => decodeBackup(JSON.stringify(wire))).not.toThrow();
  });
});
