import { useState } from 'react';
import { checkBackupSize, decodeBackup, encodeBackup, backupErrors, type BackupProfile, type ImportedBackup } from '../lib/backup';
import { scopedStorageKey, useProfiles } from '../lib/profiles';
import { isOSScope } from '../lib/scope';
import { isLicenseMode } from '../lib/license';
import { isMaturityLevel } from '../lib/search';
import { readAudit } from '../lib/audit';
import { Modal } from './Modal';

export function BackupSection() {
  const { profiles, activeId, importBackup } = useProfiles();
  const [pending, setPending] = useState<ImportedBackup | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  function exportProfiles(all: boolean) {
    try {
      const snapshot: BackupProfile[] = profiles.filter((profile) => all || profile.id === activeId).map((profile) => {
        const key = (name: string) => scopedStorageKey(profile.id, name);
        const target = localStorage.getItem(key('targetMaturity')) ?? 'ml1';
        const scope = localStorage.getItem(key('osScope')) ?? 'both';
        const license = localStorage.getItem(key('licenseMode')) ?? 'none';
        return { ...profile, stepProgress: JSON.parse(localStorage.getItem(key('stepProgressDict')) ?? '{}'), auditTrail: readAudit(key('auditTrail')),
          targetMaturity: isMaturityLevel(target) ? target : 'ml1', osScope: isOSScope(scope) ? scope : 'both', licenseMode: isLicenseMode(license) ? license : 'none' };
      });
      const text = encodeBackup(snapshot, all, localStorage.getItem('e8kb.deepAudit') === 'true');
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `e8kb-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError('');
    } catch (error) { setError(error instanceof Error && error.message === backupErrors.fileTooLarge ? error.message : backupErrors.invalidFile); }
  }
  function apply(backup: ImportedBackup) {
    try {
      importBackup(backup);
      setPending(null);
      setMessage('Backup imported.');
    } catch { setPending(null); setError(backupErrors.invalidFile); }
  }
  async function importFile(file?: File) {
    if (!file) return;
    setMessage('');
    setError('');
    try {
      checkBackupSize(file.size);
      const backup = decodeBackup(await file.text());
      if (backup.globalSettings !== null) setPending(backup);
      else apply(backup);
    } catch (error) { setError(error instanceof Error && (error.message === backupErrors.fileTooLarge || /^This backup uses schema version \d+\. Update the app before importing it\.$/.test(error.message)) ? error.message : backupErrors.invalidFile); }
  }
  return <section className="content-section">
    <h2>Backup &amp; Restore</h2>
    <div className="reset-actions">
      <button type="button" className="print-button" onClick={() => exportProfiles(false)}>Export this profile</button>
      <button type="button" className="print-button" onClick={() => exportProfiles(true)}>Export all profiles</button>
      <label>Import backup<input type="file" accept=".json,application/json" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ''; }} /></label>
    </div>
    <p>Backups are plain JSON containing your profiles — step statuses, N/A reasons, audit history and per-profile settings. Export this profile to share one assessment, or all profiles to move everything to another browser or to the iOS app. Uploaded audit CSV evidence is never included.</p>
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {pending && <Modal title="Replace everything?" onClose={() => setPending(null)}>
      <p>All profiles, progress and audit history in this browser will be replaced. Theme preference is retained.</p>
      <div className="reset-actions"><button type="button" onClick={() => apply(pending)}>Replace everything</button><button type="button" onClick={() => setPending(null)}>Cancel</button></div>
    </Modal>}
  </section>;
}
