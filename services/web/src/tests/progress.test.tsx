import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComplianceChart } from '../components/ComplianceChart';
import { ProgressBar } from '../components/ProgressBar';
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

describe('ProgressBar', () => {
  it('renders interactive filter chips with counts and pressed state', () => {
    const onToggleFilter = vi.fn();

    render(
      <ProgressBar
        evidenced={1}
        implemented={2}
        notApplicable={3}
        failed={4}
        remaining={5}
        activeFilters={['implemented']}
        onToggleFilter={onToggleFilter}
      />
    );

    expect(screen.getByRole('button', { name: 'Evidence provided · 1' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Marked implemented · 2' })).toHaveAttribute('aria-pressed', 'true');

    screen.getByRole('button', { name: 'Audit: non-compliant · 4' }).click();
    expect(onToggleFilter).toHaveBeenCalledWith('failed');
  });

  it('renders a static legend when no toggle handler is supplied', () => {
    render(<ProgressBar evidenced={1} implemented={2} notApplicable={3} failed={4} remaining={5} />);

    expect(screen.queryByRole('button', { name: /Evidence provided/ })).not.toBeInTheDocument();
    expect(screen.getByText('Evidence provided')).toBeInTheDocument();
  });
});

describe('ComplianceChart', () => {
  it('links each chart row to the matching ML1 control page', () => {
    render(
      <MemoryRouter>
        <ComplianceChart rows={[{ id: 3, name: 'Configure MS Office Macros', implemented: 1, notApplicable: 0, pending: 2 }]} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /3\. Configure MS Office Macros/ })).toHaveAttribute('href', '/control/3/ml1');
  });
});
