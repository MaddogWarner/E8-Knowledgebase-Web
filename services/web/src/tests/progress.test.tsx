import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileProvider } from '../lib/profiles';
import { useStepProgress } from '../lib/useStepProgress';

function wrapper({ children }: { children: ReactNode }) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

afterEach(() => {
  window.localStorage.clear();
});

describe('useStepProgress', () => {
  it('migrates legacy boolean ticks to implemented statuses', () => {
    window.localStorage.setItem('e8kb.progress', JSON.stringify({ '1-ml1-1': true, ignored: false }));

    const { result } = renderHook(() => useStepProgress(), { wrapper });
    const profileId = window.localStorage.getItem('e8kb.activeProfile');

    expect(result.current.status('1-ml1-1')).toEqual({ state: 'implemented' });
    expect(result.current.status('ignored')).toEqual({ state: 'notImplemented' });
    expect(window.localStorage.getItem('e8kb.progress')).toBeNull();
    expect(window.localStorage.getItem(`e8kb.p.${profileId}.stepProgressDict`)).toContain('implemented');
  });

  it('drops malformed entries and deletes not implemented statuses', () => {
    window.localStorage.setItem('e8kb.stepProgressDict', JSON.stringify({
      valid: { state: 'implemented' },
      malformed: { state: 'done' }
    }));

    const { result } = renderHook(() => useStepProgress(), { wrapper });

    expect(result.current.status('valid')).toEqual({ state: 'implemented' });
    expect(result.current.status('malformed')).toEqual({ state: 'notImplemented' });

    act(() => result.current.setStatus('valid', { state: 'notImplemented' }));
    expect(result.current.status('valid')).toEqual({ state: 'notImplemented' });
  });

  it('trims N/A reasons', () => {
    const { result } = renderHook(() => useStepProgress(), { wrapper });

    act(() => result.current.setStatus('1-ml1-1', { state: 'notApplicable', reason: '  Not in scope  ' }));

    expect(result.current.status('1-ml1-1')).toEqual({ state: 'notApplicable', reason: 'Not in scope' });
  });
});
