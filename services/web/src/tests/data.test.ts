import { describe, expect, it } from 'vitest';
import { appInfo } from '../data/appInfo';
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
        }
      }
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
    expect(urls.some((url) => url.includes('cyber.gov.au') && url.includes('essential-eight'))).toBe(true);
    expect(urls.some((url) => url.includes('cyber.gov.au') && url.includes('ism'))).toBe(true);
    expect(urls.some((url) => url.includes('learn.microsoft.com') && url.includes('defender-endpoint'))).toBe(true);
    expect(urls.some((url) => url.includes('conditional-access'))).toBe(true);
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

