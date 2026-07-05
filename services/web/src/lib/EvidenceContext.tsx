/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { deriveEvidence, type EvidenceSummary } from './evidence';
import { parseCsv } from './csv';
import { profileEvent } from './profiles';

interface EvidenceContextValue {
  evidence: Record<string, 'pass' | 'fail'>;
  summary: EvidenceSummary | null;
  applyCsv: (text: string) => void;
  clear: () => void;
}

const EvidenceContext = createContext<EvidenceContextValue | null>(null);

export function EvidenceProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<EvidenceSummary | null>(null);

  useEffect(() => {
    function clearEvidence() {
      setSummary(null);
    }

    window.addEventListener(profileEvent, clearEvidence);
    return () => window.removeEventListener(profileEvent, clearEvidence);
  }, []);

  const value = useMemo<EvidenceContextValue>(() => ({
    evidence: summary?.statuses ?? {},
    summary,
    applyCsv: (text: string) => setSummary(deriveEvidence(parseCsv(text))),
    clear: () => setSummary(null)
  }), [summary]);

  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}

export function useEvidence(): EvidenceContextValue {
  const context = useContext(EvidenceContext);
  if (!context) throw new Error('useEvidence must be used within EvidenceProvider');
  return context;
}
