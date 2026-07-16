import { describe, expect, it } from 'vitest';
import { search } from '../lib/search';

describe('search', () => {
  it('matches ISM identifiers', () => {
    const results = search('ism-1657', 'both');
    expect(results.some((result) => result.path.includes('/control/1/ml1#1-ml1-1'))).toBe(true);
  });

  it('matches Windows Audit Policy entries', () => {
    const results = search('Audit Account Lockout', 'server');
    expect(results.some((result) => result.path === '/audit-policy#account-lockout')).toBe(true);
  });

  it('filters step results without filtering common or control-level results', () => {
    expect(search('Microsoft Edge auto-update', 'server').some((result) => result.id === '2-ml1-2')).toBe(false);
    expect(search('Microsoft Edge auto-update', 'both').some((result) => result.id === '2-ml1-2')).toBe(true);
    expect(search('Application Identity service', 'server').some((result) => result.id === '1-ml1-1')).toBe(true);
    expect(search('Application Control', 'server').some((result) => result.id === 'control-1')).toBe(true);
  });
});
