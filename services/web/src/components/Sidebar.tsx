import { Cloud, Info, ScrollText, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router';
import { controls } from '../data/controls';
import { resolveIcon } from '../lib/icons';
import { useProfiles } from '../lib/profiles';

export function Sidebar() {
  const { profiles, activeId, activeProfile, switchTo, create, rename, remove } = useProfiles();
  const [expanded, setExpanded] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');

  function submitNewProfile() {
    if (create(newName)) {
      setNewName('');
      setExpanded(false);
    }
  }

  function submitRename() {
    if (!renameId) return;
    rename(renameId, renameName);
    setRenameId(null);
    setRenameName('');
  }

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <ShieldCheck size={26} />
        <span>Essential 8 Knowledge Base</span>
      </NavLink>
      <nav aria-label="Primary navigation">
        {controls.map((control) => {
          const Icon = resolveIcon(control.icon);
          return (
            <NavLink key={control.id} to={`/control/${control.id}/ml1`} className="nav-item">
              <Icon size={18} />
              <span>
                <small>Mitigation {control.id}</small>
                {control.name}
              </span>
            </NavLink>
          );
        })}
        <NavLink to="/audit-policy" className="nav-item">
          <ScrollText size={18} />
          <span>Windows Audit Policy</span>
        </NavLink>
        <NavLink to="/m365" className="nav-item">
          <Cloud size={18} />
          <span>Microsoft 365 Additional Controls</span>
        </NavLink>
        <NavLink to="/about" className="nav-item">
          <Info size={18} />
          <span>About & Privacy</span>
        </NavLink>
      </nav>
      <section className="profile-switcher">
        <button type="button" className="profile-current" onClick={() => setExpanded((current) => !current)}>
          <span>Profile</span>
          <strong>{activeProfile.name}</strong>
        </button>
        {expanded && (
          <div className="profile-panel">
            {profiles.map((profile) => (
              <div key={profile.id} className="profile-row">
                {renameId === profile.id ? (
                  <input
                    type="text"
                    value={renameName}
                    onChange={(event) => setRenameName(event.target.value)}
                    onBlur={submitRename}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') submitRename();
                      if (event.key === 'Escape') setRenameId(null);
                    }}
                    aria-label={`Rename ${profile.name}`}
                    autoFocus
                  />
                ) : (
                  <button type="button" className={profile.id === activeId ? 'active' : ''} onClick={() => switchTo(profile.id)}>
                    {profile.name}
                  </button>
                )}
                <button
                  type="button"
                  className="profile-action"
                  onClick={() => {
                    setRenameId(profile.id);
                    setRenameName(profile.name);
                  }}
                >
                  Rename
                </button>
                <button type="button" className="profile-action icon-only" disabled={profiles.length <= 1} onClick={() => remove(profile.id)} aria-label={`Delete ${profile.name}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="profile-new">
              <input
                type="text"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitNewProfile();
                }}
                placeholder="New profile..."
                aria-label="New profile name"
              />
              <button type="button" onClick={submitNewProfile}>Add</button>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
