import { act, renderHook, render, fireEvent, screen } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileProvider, scopedStorageKey, useProfiles } from '../lib/profiles';
import { useStepProgress } from '../lib/useStepProgress';
import { auditEntriesPerStepCap, isoDate, readAudit, recordAudit } from '../lib/audit';
import { decodeBackup, backupErrors, maximumBackupSize } from '../lib/backup';
import { BackupSection } from '../components/BackupSection';
import iosV2 from './fixtures/ios-backup-v2.json';
function wrapper({ children }: { children: ReactNode }) { return <StrictMode><ProfileProvider>{children}</ProfileProvider></StrictMode>; }
afterEach(() => localStorage.clear());
function useAssessment() { return { progress: useStepProgress(), profiles: useProfiles() }; }

describe('deep audit', () => {
  it('records only real manual changes when enabled, with fallback notes, a cap and whole-second dates', () => {
    const { result } = renderHook(useAssessment, { wrapper });
    const key = scopedStorageKey(result.current.profiles.activeId, 'auditTrail');
    act(() => result.current.progress.setStatus('1-ml1-1', { state: 'implemented' }));
    expect(localStorage.getItem(key)).toBeNull();
    localStorage.setItem('e8kb.deepAudit', 'true');
    act(() => result.current.progress.setStatus('1-ml1-1', { state: 'implemented' }, 'same'));
    expect(localStorage.getItem(key)).toBeNull();
    act(() => result.current.progress.setStatus('1-ml1-1', { state: 'notApplicable', reason: '  Out of scope  ' }));
    const entry = readAudit(key)['1-ml1-1'][0];
    expect(entry).toMatchObject({ previousState: 'implemented', newState: 'notApplicable', note: 'Out of scope' });
    expect(entry.timestamp).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    // StrictMode must record once, and editing a reason is not a status change.
    act(() => result.current.progress.setStatus('1-ml1-1', { state: 'notApplicable', reason: 'changed' }));
    expect(readAudit(key)['1-ml1-1']).toHaveLength(1);
    for (let i = 0; i < 205; i++) act(() => result.current.progress.setStatus('1-ml1-1', { state: i % 2 ? 'notImplemented' : 'implemented' }, `note ${i}`));
    expect(readAudit(key)['1-ml1-1']).toHaveLength(auditEntriesPerStepCap);
    expect(readAudit(key)['1-ml1-1'].at(-1)?.note).toBe('note 204');
  });
  it('stores blank notes as absent and bounds note text', () => {
    const trail = recordAudit({}, '1-ml1-1', 'notImplemented', { state: 'implemented' }, true, '  ');
    expect(trail['1-ml1-1'][0].note).toBeUndefined();
    expect(recordAudit({}, '1-ml1-1', 'notImplemented', { state: 'implemented' }, true, 'a'.repeat(3000))['1-ml1-1'][0].note).toHaveLength(2000);
  });
  it('isolates and deletes profile history and clears both new keys on reset while keeping theme', () => {
    localStorage.setItem('e8kb.deepAudit', 'true');
    localStorage.setItem('e8kb.theme', 'dark');
    const { result } = renderHook(useAssessment, { wrapper });
    const original = result.current.profiles.activeId;
    act(() => result.current.progress.setStatus('1-ml1-1', { state: 'implemented' }));
    act(() => result.current.profiles.create('Hospital B'));
    const other = result.current.profiles.activeId;
    expect(localStorage.getItem(scopedStorageKey(other, 'auditTrail'))).toBeNull();
    expect(result.current.progress.status('1-ml1-1').state).toBe('notImplemented');
    act(() => result.current.profiles.switchTo(original));
    expect(readAudit(scopedStorageKey(original, 'auditTrail'))['1-ml1-1']).toHaveLength(1);
    act(() => result.current.profiles.remove(original));
    expect(localStorage.getItem(scopedStorageKey(original, 'auditTrail'))).toBeNull();
    act(() => result.current.progress.setStatus('1-ml1-1', { state: 'implemented' }));
    act(() => result.current.profiles.resetAllAppData());
    expect(localStorage.getItem('e8kb.deepAudit')).toBeNull();
    expect(localStorage.getItem(scopedStorageKey(other, 'auditTrail'))).toBeNull();
    expect(localStorage.getItem('e8kb.theme')).toBe('dark');
  });
});
describe('profile backup application', () => {
  it('backfills existing creation dates only once', () => {
    localStorage.setItem('e8kb.profiles', JSON.stringify([{ id: crypto.randomUUID(), name: 'Existing' }]));
    const { result, unmount } = renderHook(useProfiles, { wrapper });
    const createdAt = result.current.activeProfile.createdAt;
    expect(createdAt).toBe(isoDate());
    unmount();
    expect(renderHook(useProfiles, { wrapper }).result.current.activeProfile.createdAt).toBe(createdAt);
  });
  it('imports as new, resolves name clashes and emits the evidence-clearing event', () => {
    const { result } = renderHook(useProfiles, { wrapper });
    const original = result.current.activeId;
    const change = vi.fn();
    window.addEventListener('e8kb.profile.changed', change);
    const backup = decodeBackup(JSON.stringify(iosV2));
    act(() => result.current.importBackup(backup));
    expect(result.current.profiles).toHaveLength(2);
    expect(result.current.activeProfile.name).toBe('Default (imported)');
    expect(result.current.activeId).not.toBe(backup.profiles[0].id);
    expect(result.current.profiles.some((profile) => profile.id === original)).toBe(true);
    expect(change).toHaveBeenCalledTimes(1);
    window.removeEventListener('e8kb.profile.changed', change);
  });
  it('full restore replaces profiles and scoped settings, removes absent deepAudit and preserves theme', () => {
    const { result } = renderHook(useProfiles, { wrapper });
    const oldId = result.current.activeId;
    localStorage.setItem(scopedStorageKey(oldId, 'hideComplete'), 'true');
    localStorage.setItem('e8kb.deepAudit', 'true');
    localStorage.setItem('e8kb.theme', 'dark');
    const backup = decodeBackup(JSON.stringify({ ...iosV2, globalSettings: {} }));
    act(() => result.current.importBackup(backup));
    expect(result.current.profiles).toHaveLength(1);
    expect(result.current.activeId).toBe(backup.profiles[0].id);
    expect(localStorage.getItem(scopedStorageKey(oldId, 'hideComplete'))).toBeNull();
    expect(localStorage.getItem('e8kb.deepAudit')).toBeNull();
    expect(localStorage.getItem('e8kb.theme')).toBe('dark');
    expect(localStorage.getItem(scopedStorageKey(result.current.activeId, 'targetMaturity'))).toBe('ml3');
    backup.globalSettings = { deepAuditEnabled: true };
    act(() => result.current.importBackup(backup));
    expect(localStorage.getItem('e8kb.deepAudit')).toBe('true');
  });
  it('rolls back browser storage if a restore write fails', () => {
    const { result } = renderHook(useProfiles, { wrapper });
    const oldProfile = result.current.activeProfile;
    const backup = decodeBackup(JSON.stringify({ ...iosV2, globalSettings: {} }));
    const original = localStorage.setItem.bind(localStorage);
    let failed = false;
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      if (!failed && key.endsWith('.auditTrail')) { failed = true; throw new Error('Quota exceeded'); }
      original(key, value);
    });
    try {
      expect(() => act(() => result.current.importBackup(backup))).toThrow('Quota exceeded');
      expect(result.current.activeProfile).toEqual(oldProfile);
      expect(JSON.parse(localStorage.getItem('e8kb.profiles')!)).toEqual([oldProfile]);
      expect(localStorage.getItem(scopedStorageKey(backup.profiles[0].id, 'stepProgressDict'))).toBeNull();
    } finally { spy.mockRestore(); }
  });
  it('rejects an oversized file before reading its contents', async () => {
    render(<ProfileProvider><BackupSection /></ProfileProvider>);
    const text = vi.fn();
    fireEvent.change(screen.getByLabelText('Import backup'), { target: { files: [{ size: maximumBackupSize + 1, text }] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(backupErrors.fileTooLarge);
    expect(text).not.toHaveBeenCalled();
  });
});
