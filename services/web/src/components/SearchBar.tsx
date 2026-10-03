import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { search } from '../lib/search';
import { isOSScope } from '../lib/scope';
import { useLocalStorage } from '../lib/useLocalStorage';
import type { OSScope } from '../types';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [osScope] = useLocalStorage<OSScope>('e8kb.osScope', 'both', isOSScope);
  const navigate = useNavigate();
  const results = useMemo(() => search(query, osScope), [query, osScope]);

  function open(path: string) {
    setQuery('');
    navigate(path);
  }

  return (
    <div className="search-shell">
      <Search size={18} />
      <input
        type="search"
        placeholder="Search GPOs, registries, commands, ISM or ATT&CK IDs..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search controls, commands, registry keys, ISM or ATT&CK IDs" aria-describedby="search-hint"
      />
      <span id="search-hint" className="sr-only">Search registry paths, GPO settings, commands, ISM control numbers, ATT&CK techniques, or controls across the entire knowledge base. For example, T1059.</span>
      {results.length > 0 && (
        <div className="search-results">
          {results.map((result) => (
            <button key={result.id} type="button" onClick={() => open(result.path)}>
              <strong>{result.title}</strong>
              <span>{result.context}</span>
              {result.matchedTechniques?.map((line) => <span key={line}>{line}</span>)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
