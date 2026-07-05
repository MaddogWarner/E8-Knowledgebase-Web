/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface Profile {
  id: string;
  name: string;
}

interface ProfilesContextValue {
  profiles: Profile[];
  activeId: string;
  activeProfile: Profile;
  storageKey: (key: string) => string;
  switchTo: (id: string) => void;
  create: (name: string) => Profile | null;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  resetActiveProfile: () => void;
  resetAllAppData: () => void;
}

const profilesKey = 'e8kb.profiles';
const activeProfileKey = 'e8kb.activeProfile';
export const profileEvent = 'e8kb.profile.changed';
export const storageEvent = 'e8kb.localStorage.changed';

const scopedKeyNames = new Set(['stepProgressDict', 'targetMaturity', 'hideComplete', 'licenseMode']);
const unscopedKeys = ['e8kb.stepProgressDict', 'e8kb.progress', 'e8kb.targetMaturity', 'e8kb.hideComplete', 'e8kb.licenseMode'];

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

function normaliseName(name: string) {
  return name.trim().slice(0, 40);
}

function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function keyName(key: string) {
  return key.startsWith('e8kb.') ? key.slice('e8kb.'.length) : key;
}

export function isProfileScopedKey(key: string) {
  return scopedKeyNames.has(keyName(key));
}

export function scopedStorageKey(profileId: string, key: string) {
  const name = keyName(key);
  return isProfileScopedKey(name) ? `e8kb.p.${profileId}.${name}` : key;
}

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const profile = value as Record<string, unknown>;
  return typeof profile.id === 'string' && typeof profile.name === 'string' && profile.id.length > 0 && profile.name.trim().length > 0;
}

function readProfiles(): Profile[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(profilesKey) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProfile).map((profile) => ({ id: profile.id, name: normaliseName(profile.name) || 'Default' }));
  } catch {
    return [];
  }
}

function writeProfiles(profiles: Profile[], activeId: string) {
  window.localStorage.setItem(profilesKey, JSON.stringify(profiles));
  window.localStorage.setItem(activeProfileKey, activeId);
}

function migrateLegacyProgressDict() {
  if (window.localStorage.getItem('e8kb.stepProgressDict')) return;
  const legacy = window.localStorage.getItem('e8kb.progress');
  if (!legacy) return;

  try {
    const parsed: unknown = JSON.parse(legacy);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
    const converted = Object.entries(parsed).reduce<Record<string, { state: 'implemented' }>>((result, [stepId, value]) => {
      if (typeof stepId === 'string' && value === true) result[stepId] = { state: 'implemented' };
      return result;
    }, {});
    window.localStorage.setItem('e8kb.stepProgressDict', JSON.stringify(converted));
  } catch {
    return;
  } finally {
    window.localStorage.removeItem('e8kb.progress');
  }
}

function initialiseProfiles(): { profiles: Profile[]; activeId: string } {
  const existingProfiles = readProfiles();
  const storedActiveId = window.localStorage.getItem(activeProfileKey);

  if (existingProfiles.length > 0) {
    const activeId = existingProfiles.some((profile) => profile.id === storedActiveId) ? storedActiveId! : existingProfiles[0].id;
    writeProfiles(existingProfiles, activeId);
    return { profiles: existingProfiles, activeId };
  }

  migrateLegacyProgressDict();

  const defaultProfile = { id: randomId(), name: 'Default' };
  for (const key of unscopedKeys) {
    const name = keyName(key);
    const value = window.localStorage.getItem(key);
    if (value !== null && scopedKeyNames.has(name)) {
      window.localStorage.setItem(scopedStorageKey(defaultProfile.id, name), value);
    }
    window.localStorage.removeItem(key);
  }

  writeProfiles([defaultProfile], defaultProfile.id);
  return { profiles: [defaultProfile], activeId: defaultProfile.id };
}

function removeProfileKeys(profileId: string) {
  for (const key of scopedKeyNames) {
    window.localStorage.removeItem(scopedStorageKey(profileId, key));
  }
}

function dispatchProfileChange() {
  window.dispatchEvent(new Event(profileEvent));
  window.dispatchEvent(new Event(storageEvent));
  window.dispatchEvent(new Event('e8kb.progress.changed'));
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [{ profiles, activeId }, setState] = useState(initialiseProfiles);

  const value = useMemo<ProfilesContextValue>(() => {
    const activeProfile = profiles.find((profile) => profile.id === activeId) ?? profiles[0];

    return {
      profiles,
      activeId,
      activeProfile,
      storageKey: (key) => scopedStorageKey(activeId, key),
      switchTo: (id) => {
        if (!profiles.some((profile) => profile.id === id) || id === activeId) return;
        window.localStorage.setItem(activeProfileKey, id);
        setState({ profiles, activeId: id });
        dispatchProfileChange();
      },
      create: (name) => {
        const profileName = normaliseName(name);
        if (!profileName) return null;
        const profile = { id: randomId(), name: profileName };
        const nextProfiles = [...profiles, profile];
        writeProfiles(nextProfiles, profile.id);
        setState({ profiles: nextProfiles, activeId: profile.id });
        dispatchProfileChange();
        return profile;
      },
      rename: (id, name) => {
        const profileName = normaliseName(name);
        if (!profileName) return;
        const nextProfiles = profiles.map((profile) => (profile.id === id ? { ...profile, name: profileName } : profile));
        writeProfiles(nextProfiles, activeId);
        setState({ profiles: nextProfiles, activeId });
      },
      remove: (id) => {
        if (profiles.length <= 1) return;
        const nextProfiles = profiles.filter((profile) => profile.id !== id);
        if (nextProfiles.length === profiles.length) return;
        removeProfileKeys(id);
        const nextActiveId = id === activeId ? nextProfiles[0].id : activeId;
        writeProfiles(nextProfiles, nextActiveId);
        setState({ profiles: nextProfiles, activeId: nextActiveId });
        dispatchProfileChange();
      },
      resetActiveProfile: () => {
        removeProfileKeys(activeId);
        dispatchProfileChange();
      },
      resetAllAppData: () => {
        for (const key of Object.keys(window.localStorage)) {
          if (key.startsWith('e8kb.') && key !== 'e8kb.theme') window.localStorage.removeItem(key);
        }
        const profile = { id: randomId(), name: 'Default' };
        writeProfiles([profile], profile.id);
        setState({ profiles: [profile], activeId: profile.id });
        dispatchProfileChange();
      }
    };
  }, [activeId, profiles]);

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles(): ProfilesContextValue {
  const context = useContext(ProfilesContext);
  if (!context) throw new Error('useProfiles must be used within ProfileProvider');
  return context;
}
