import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { search } from '../lib/search';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const results = useMemo(() => search(query), [query]);

  function open(path: string) {
    setQuery('');
    navigate(path);
  }

  return (
    <div className="search-shell">
      <Search size={18} />
      <input
        type="search"
        placeholder="Search controls, commands and registry keys"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search controls, commands and registry keys"
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map((result) => (
            <button key={result.id} type="button" onClick={() => open(result.path)}>
              <strong>{result.title}</strong>
              <span>{result.context}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

