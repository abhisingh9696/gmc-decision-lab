import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router'
import './index.css'
import Dashboard from './Dashboard.tsx'
import App from './App.tsx'

function AppShell() {
  const { pathname } = useLocation();
  const showQ3 = pathname === '/q3';

  // Keep the planner mounted while the official Q2 report is open. Route
  // changes therefore preserve every in-progress Q3–2017Q2 decision.
  return (
    <>
      <div hidden={!showQ3}><App /></div>
      {!showQ3 && <Dashboard />}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL}>
      <AppShell />
    </BrowserRouter>
  </StrictMode>,
)
