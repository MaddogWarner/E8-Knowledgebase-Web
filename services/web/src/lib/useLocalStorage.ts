import { useEffect, useState } from 'react';

export function useLocalStorage<T extends string>(key: string, initialValue: T, isValid?: (value: string) => value is T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) return initialValue;
    if (!isValid) return storedValue as T;
    return isValid(storedValue) ? storedValue : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
