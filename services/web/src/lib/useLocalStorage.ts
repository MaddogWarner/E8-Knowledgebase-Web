import { useCallback, useEffect, useState } from 'react';
import { storageEvent, useProfiles } from './profiles';

export function useLocalStorage<T extends string>(key: string, initialValue: T, isValid?: (value: string) => value is T) {
  const { storageKey } = useProfiles();
  const resolvedKey = storageKey(key);

  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    const storedValue = window.localStorage.getItem(resolvedKey);
    if (!storedValue) return initialValue;
    if (!isValid) return storedValue as T;
    return isValid(storedValue) ? storedValue : initialValue;
  }, [initialValue, isValid, resolvedKey]);

  const [value, setValue] = useState<T>(() => {
    return readValue();
  });

  useEffect(() => {
    setValue(readValue());

    function refresh() {
      setValue(readValue());
    }

    window.addEventListener('storage', refresh);
    window.addEventListener(storageEvent, refresh);
    window.addEventListener('e8kb.profile.changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(storageEvent, refresh);
      window.removeEventListener('e8kb.profile.changed', refresh);
    };
  }, [readValue]);

  function setStoredValue(nextValue: T) {
    window.localStorage.setItem(resolvedKey, nextValue);
    setValue(nextValue);
    window.dispatchEvent(new Event(storageEvent));
  }

  return [value, setStoredValue] as const;
}
