import type { Microsoft365LicenseMode } from '../types';

export function isLicenseMode(value: string): value is Microsoft365LicenseMode {
  return value === 'none' || value === 'e3P1' || value === 'e3P2' || value === 'e5';
}
