import { Outlet } from 'react-router';
import { SearchBar } from './components/SearchBar';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { EvidenceProvider } from './lib/EvidenceContext';

export function App() {
  return (
    <EvidenceProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main-shell">
          <header className="topbar">
            <SearchBar />
            <ThemeToggle />
          </header>
          <main className="content-pane">
            <Outlet />
          </main>
          <footer className="app-footer">
            Content is scoped to controls achievable using built-in Windows OS tooling. Verify against the current ASD Essential Eight Maturity Model before implementation.
          </footer>
        </div>
      </div>
    </EvidenceProvider>
  );
}
