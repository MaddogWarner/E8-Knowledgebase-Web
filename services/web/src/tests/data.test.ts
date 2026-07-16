import { describe, expect, it } from 'vitest';
import { appInfo } from '../data/appInfo';
import { auditPolicyEntryMapping } from '../data/auditMapping';
import { auditPolicyEntries } from '../data/auditPolicy';
import { controls } from '../data/controls';
import { protections } from '../data/m365';

describe('controls data', () => {
  it('contains eight uniquely identified controls with maturity content', () => {
    expect(controls).toHaveLength(8);
    expect(new Set(controls.map((control) => control.id)).size).toBe(8);

    for (const control of controls) {
      expect(control.name).toBeTruthy();
      expect(control.overview).toBeTruthy();
      expect(control.ml0Description).toBeTruthy();

      for (const level of ['ml1', 'ml2', 'ml3'] as const) {
        expect(control[level].summary).toBeTruthy();
        expect(control[level].steps.length).toBeGreaterThanOrEqual(1);
        for (const step of control[level].steps) {
          expect(step.title).toBeTruthy();
          expect(step.description).toBeTruthy();
          expect(Array.isArray(step.ismControls)).toBe(true);
          expect(['workstation', 'server', 'both']).toContain(step.osScope);
        }
      }
    }
  });

  it('contains the generated OS scope distribution', () => {
    const steps = controls.flatMap((control) => (['ml1', 'ml2', 'ml3'] as const).flatMap((level) => control[level].steps));
    expect(steps.filter((step) => step.osScope === 'workstation')).toHaveLength(16);
    expect(steps.filter((step) => step.osScope === 'server').map((step) => step.id)).toEqual(['8-ml1-1', '8-ml1-2']);
    expect(steps.filter((step) => step.osScope === 'both')).toHaveLength(49);
  });

  it('contains verified ISM mappings for 64 implementation steps', () => {
    const steps = controls.flatMap((control) => (['ml1', 'ml2', 'ml3'] as const).flatMap((level) => control[level].steps));
    expect(steps.filter((step) => step.ismControls.length > 0)).toHaveLength(64);
    for (const identifier of steps.flatMap((step) => step.ismControls)) {
      expect(identifier).toMatch(/^ISM-\d{4}$/);
    }
  });
});

describe('audit policy data', () => {
  it('contains generated Windows Audit Policy entries with valid recommendations', () => {
    expect(auditPolicyEntries.length).toBeGreaterThan(20);
    expect(auditPolicyEntries.some((entry) => entry.name === 'Audit Account Lockout')).toBe(true);
    for (const entry of auditPolicyEntries) {
      expect(['Success', 'Failure', 'Success & Failure', 'Not Recommended']).toContain(entry.recommendation);
      expect(entry.category).toBeTruthy();
      expect(entry.description).toBeTruthy();
    }
  });

  it('maps each generated Windows Audit Policy entry exactly once', () => {
    const entryIds = auditPolicyEntries.map((entry) => entry.id);
    const mappedIds = Object.values(auditPolicyEntryMapping);

    expect(new Set(mappedIds)).toEqual(new Set(entryIds));
    expect(new Set(mappedIds).size).toBe(mappedIds.length);
    for (const mappedId of mappedIds) {
      expect(entryIds).toContain(mappedId);
    }
  });
});

describe('app information', () => {
  it('contains expected privacy and reference information', () => {
    expect(appInfo.privacyPolicy).toContain('does not collect');
    expect(appInfo.privacyPolicy).toContain('microphone');
    expect(appInfo.privacyPolicy).toContain('camera');
    expect(appInfo.privacyPolicy).toContain('location services');
    expect(appInfo.aboutDescription).toContain('administrators');
    expect(appInfo.aboutDescription).toContain('quick reference');

    const urls = appInfo.referenceLinks.map((link) => link.url);
    expect(urls.every((url) => url.startsWith('https://'))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
    // Check the parsed host, not a whole-URL substring, so the assertions
    // can't pass on a lookalike host (e.g. cyber.gov.au.evil.example).
    const parsed = urls.map((url) => new URL(url));
    expect(parsed.some((url) => url.hostname === 'www.cyber.gov.au' && url.pathname.includes('essential-eight'))).toBe(true);
    expect(parsed.some((url) => url.hostname === 'www.cyber.gov.au' && url.pathname.includes('ism'))).toBe(true);
    expect(parsed.some((url) => url.hostname === 'learn.microsoft.com' && url.pathname.includes('defender-endpoint'))).toBe(true);
    expect(parsed.some((url) => url.hostname === 'learn.microsoft.com' && url.pathname.includes('conditional-access'))).toBe(true);
  });
});

describe('m365 protections', () => {
  it('applies cumulative licensing logic', () => {
    const none = protections(7, 'ml3', 'none');
    const e3P1 = protections(7, 'ml3', 'e3P1');
    const e3P2 = protections(7, 'ml3', 'e3P2');
    const e5 = protections(7, 'ml3', 'e5');

    expect(none).toHaveLength(0);
    expect(e3P1.length).toBeGreaterThan(0);
    expect(e3P2.length).toBeGreaterThan(e3P1.length);
    expect(e5.length).toBeGreaterThan(e3P2.length);
    expect(e5.some((item) => item.title.includes('E5'))).toBe(true);
  });
});
