// Deliberately unmapped because the 67 KB implementation steps do not contain
// a clean matching step: Defender Real-Time Protection, Defender Cloud-Delivered
// Protection, Defender Tamper Protection, SMBv1, SMB server signing, SMB client
// signing, Windows Firewall domain/private/public profiles, RDP NLA, WDigest,
// UAC, Secure Boot, AutoRun, BitLocker OS drive checks, PowerShell Execution
// Policy, the AuditPolicy rows with no KB page entry (Security/Application/System
// Event Log Size and NTLM Outgoing Traffic Auditing), and all MDE rows.
export const auditStepMapping: Record<string, string[]> = {
  'memory integrity / hvci': ['1-ml3-3'],
  'credential guard': ['5-ml2-1'],
  'lsass protected process light (ppl)': ['5-ml2-2'],
  'process creation command line logging': ['4-ml2-3'],
  'powershell script block logging': ['4-ml2-1'],
  'powershell module logging': ['4-ml2-1'],
  'powershell transcription': ['4-ml2-1'],
  'powershell v2 engine disabled': ['4-ml3-1'],
  'powershell constrained language mode': ['4-ml3-2']
};

export const auditPolicyStepMapping: Record<string, string[]> = {
  'audit process creation': ['4-ml2-3']
};

export const auditPolicyEntryMapping: Record<string, string> = {
  'audit account lockout': 'account-lockout',
  'audit computer account management': 'computer-account-management',
  'audit other account management events': 'other-account-management',
  'audit security group management': 'security-group-management',
  'audit user account management': 'user-account-management',
  'audit policy change': 'audit-policy-change',
  'audit other policy change events': 'other-policy-change',
  'audit system integrity': 'system-integrity-event-collection',
  'audit group membership': 'group-membership',
  'audit logoff': 'logoff',
  'audit logon': 'logon',
  'audit other logon/logoff events': 'other-logon-logoff',
  'audit special logon': 'special-logon',
  'audit process creation': 'process-creation',
  'audit process termination': 'process-termination',
  'audit detailed file share': 'detailed-file-share',
  'audit file share': 'file-share',
  'audit other object access events': 'other-object-access',
  'audit file system': 'file-system',
  'audit kernel object': 'kernel-object',
  'audit registry': 'registry'
};

export function stepIdsForCheck(check: string): string[] {
  const normalised = check.trim().toLowerCase();
  if (normalised.startsWith('asr:')) return ['4-ml2-2'];
  return auditStepMapping[normalised] ?? [];
}

export function stepIdsForAuditPolicyCheck(check: string): string[] {
  return auditPolicyStepMapping[check.trim().toLowerCase()] ?? [];
}

export function auditPolicyEntryIdForCheck(check: string): string | undefined {
  return auditPolicyEntryMapping[check.trim().toLowerCase()];
}
