import { describe, expect, it } from 'vitest';
import { search } from '../lib/search';

describe('search', () => {
  it('matches ISM identifiers', () => {
    const results = search('ism-1657');
    expect(results.some((result) => result.path.includes('/control/1/ml1#1-ml1-1'))).toBe(true);
  });

  it('matches Windows Audit Policy entries', () => {
    const results = search('Audit Account Lockout');
    expect(results.some((result) => result.path === '/audit-policy#account-lockout')).toBe(true);
  });
});
