export const auditStepMapping: Record<string, string[]> = {
  'memory integrity / hvci': ['1-ml3-3'],
  'credential guard': ['5-ml2-1'],
  'lsass protected process light (ppl)': ['5-ml2-2'],
  'process creation command line logging': ['4-ml2-3'],
  'powershell script block logging': ['4-ml2-1'],
  'powershell module logging': ['4-ml2-1'],
  'powershell v2 engine disabled': ['4-ml3-1'],
  'powershell constrained language mode': ['4-ml3-2']
};

export function stepIdsForCheck(check: string): string[] {
  const normalised = check.trim().toLowerCase();
  if (normalised.startsWith('asr:')) return ['4-ml2-2'];
  return auditStepMapping[normalised] ?? [];
}
