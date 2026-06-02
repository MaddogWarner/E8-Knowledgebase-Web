import {
  DatabaseBackup,
  DownloadCloud,
  FileSearch,
  KeyRound,
  Lock,
  Settings2,
  ShieldCheck,
  UserCog,
  type LucideIcon
} from 'lucide-react';

export const icons: Record<string, LucideIcon> = {
  ShieldCheck,
  DownloadCloud,
  FileSearch,
  Lock,
  UserCog,
  Settings2,
  KeyRound,
  DatabaseBackup
};

export function resolveIcon(icon: string): LucideIcon {
  return icons[icon] ?? ShieldCheck;
}

