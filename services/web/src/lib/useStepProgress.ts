import { useEffect, useState } from 'react';

const progressKey = 'e8kb.progress';
const progressEvent = 'e8kb.progress.changed';

type ProgressMap = Record<string, true>;

function readProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};

  try {
    const stored = window.localStorage.getItem(progressKey);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<ProgressMap>((valid, [key, value]) => {
      if (typeof key === 'string' && value === true) valid[key] = true;
      return valid;
    }, {});
  } catch {
    return {};
  }
}

export function useStepProgress(): {
  isTicked: (stepId: string) => boolean;
  toggle: (stepId: string) => void;
} {
  const [progress, setProgress] = useState<ProgressMap>(readProgress);

  useEffect(() => {
    function refresh() {
      setProgress(readProgress());
    }

    window.addEventListener('storage', refresh);
    window.addEventListener(progressEvent, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(progressEvent, refresh);
    };
  }, []);

  function toggle(stepId: string) {
    const next = { ...readProgress() };
    if (next[stepId]) {
      delete next[stepId];
    } else {
      next[stepId] = true;
    }

    window.localStorage.setItem(progressKey, JSON.stringify(next));
    setProgress(next);
    window.dispatchEvent(new Event(progressEvent));
  }

  return {
    isTicked: (stepId: string) => progress[stepId] === true,
    toggle
  };
}
