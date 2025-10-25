// Componente para alternar entre tema claro e escuro
import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';
import { APP_CONFIG } from '../../data/config';

// Obter tema inicial do localStorage ou preferência do sistema
function getInitialTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem(APP_CONFIG.theme.storageKey);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : APP_CONFIG.theme.default as 'dark' | 'light';
}

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(APP_CONFIG.theme.storageKey, theme);
  }, [theme]);

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className || ''}`}
      aria-label="Alternar tema de cor"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

