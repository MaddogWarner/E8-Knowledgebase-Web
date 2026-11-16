import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileProvider, useProfiles } from '../lib/profiles';
import { isMaturityLevel } from '../lib/search';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useStepProgress } from '../lib/useStepProgress';
import type { MaturityLevel } from '../types';

function wrapper({ children }: { children: ReactNode }) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

afterEach(() => {
  window.localStorage.clear();
});

// Both hooks reload when the profile-scoped storage key changes; these guard that behaviour.
describe('profile switching', () => {
  it('reloads step progress for the newly active profile', () => {
    const { result } = renderHook(() => ({ profiles: useProfiles(), progress: useStepProgress() }), { wrapper });
    const firstId = result.current.profiles.activeId;

    act(() => result.current.progress.setStatus('1-ml1-1', { state: 'implemented' }));
    expect(result.current.progress.status('1-ml1-1')).toEqual({ state: 'implemented' });

    act(() => {
      result.current.profiles.create('Second');
    });
    expect(result.current.profiles.activeId).not.toBe(firstId);
    expect(result.current.progress.status('1-ml1-1')).toEqual({ state: 'notImplemented' });

    act(() => result.current.profiles.switchTo(firstId));
    expect(result.current.progress.status('1-ml1-1')).toEqual({ state: 'implemented' });
  });

  it('reloads stored settings for the newly active profile', () => {
    const { result } = renderHook(() => ({
      profiles: useProfiles(),
      target: useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel)
    }), { wrapper });
    const firstId = result.current.profiles.activeId;

    act(() => result.current.target[1]('ml3'));
    expect(result.current.target[0]).toBe('ml3');

    act(() => {
      result.current.profiles.create('Second');
    });
    expect(result.current.target[0]).toBe('ml1');

    act(() => result.current.profiles.switchTo(firstId));
    expect(result.current.target[0]).toBe('ml3');
  });
});
