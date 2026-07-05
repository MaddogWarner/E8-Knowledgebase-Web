import { useEffect, useState } from 'react';
import type { StepStatus } from '../types';
import { useProfiles } from './profiles';

const progressKey = 'e8kb.stepProgressDict';
const legacyProgressKey = 'e8kb.progress';
const progressEvent = 'e8kb.progress.changed';
const defaultStatus: StepStatus = { state: 'notImplemented' };

type ProgressMap = Record<string, StepStatus>;

function sanitiseStatus(value: unknown): StepStatus | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const status = value as Record<string, unknown>;

  if (status.state === 'implemented') return { state: 'implemented' };
  if (status.state === 'notApplicable') {
    const reason = typeof status.reason === 'string' ? status.reason.trim() : '';
    return reason ? { state: 'notApplicable', reason } : { state: 'notApplicable' };
  }
  if (status.state === 'notImplemented') return null;
  return null;
}

function readProgress(dictKey: string): ProgressMap {
  if (typeof window === 'undefined') return {};

  try {
    const stored = window.localStorage.getItem(dictKey);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const valid = Object.entries(parsed).reduce<ProgressMap>((result, [stepId, value]) => {
      const status = sanitiseStatus(value);
      if (status) result[stepId] = status;
      return result;
    }, {});

    if (JSON.stringify(valid) !== stored) {
      window.localStorage.setItem(dictKey, JSON.stringify(valid));
    }

    return valid;
  } catch {
    return {};
  }
}

function migrateLegacyProgress(dictKey: string) {
  if (typeof window === 'undefined' || window.localStorage.getItem(dictKey)) return;
  const legacy = window.localStorage.getItem(legacyProgressKey);
  if (!legacy) return;

  try {
    const parsed: unknown = JSON.parse(legacy);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
    const converted = Object.entries(parsed).reduce<ProgressMap>((result, [stepId, value]) => {
      if (typeof stepId === 'string' && value === true) result[stepId] = { state: 'implemented' };
      return result;
    }, {});
    window.localStorage.setItem(dictKey, JSON.stringify(converted));
  } catch {
    return;
  } finally {
    window.localStorage.removeItem(legacyProgressKey);
  }
}

export function useStepProgress(): {
  status: (stepId: string) => StepStatus;
  setStatus: (stepId: string, status: StepStatus) => void;
  resetAll: () => void;
} {
  const { storageKey } = useProfiles();
  const dictKey = storageKey(progressKey);
  const [progress, setProgress] = useState<ProgressMap>(() => {
    migrateLegacyProgress(dictKey);
    return readProgress(dictKey);
  });

  useEffect(() => {
    migrateLegacyProgress(dictKey);
    setProgress(readProgress(dictKey));

    function refresh() {
      setProgress(readProgress(dictKey));
    }

    window.addEventListener('storage', refresh);
    window.addEventListener(progressEvent, refresh);
    window.addEventListener('e8kb.profile.changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(progressEvent, refresh);
      window.removeEventListener('e8kb.profile.changed', refresh);
    };
  }, [dictKey]);

  function write(next: ProgressMap) {
    window.localStorage.setItem(dictKey, JSON.stringify(next));
    setProgress(next);
    window.dispatchEvent(new Event(progressEvent));
  }

  function setStepStatus(stepId: string, nextStatus: StepStatus) {
    const next = { ...readProgress(dictKey) };
    const sanitised = sanitiseStatus(nextStatus);
    if (!sanitised) {
      delete next[stepId];
    } else {
      next[stepId] = sanitised;
    }
    write(next);
  }

  function resetAll() {
    window.localStorage.removeItem(dictKey);
    setProgress({});
    window.dispatchEvent(new Event(progressEvent));
  }

  return {
    status: (stepId: string) => progress[stepId] ?? defaultStatus,
    setStatus: setStepStatus,
    resetAll
  };
}
