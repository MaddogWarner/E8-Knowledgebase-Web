import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { App } from './App';
import './index.css';
import { AboutPage } from './pages/AboutPage';
import { AuditPolicyPage } from './pages/AuditPolicyPage';
import { ControlPage } from './pages/ControlPage';
import { HomePage } from './pages/HomePage';
import { M365SettingsPage } from './pages/M365SettingsPage';
import { NotFound } from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'control/:controlId', element: <ControlPage /> },
      { path: 'control/:controlId/:level', element: <ControlPage /> },
      { path: 'audit-policy', element: <AuditPolicyPage /> },
      { path: 'm365', element: <M365SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFound /> }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
