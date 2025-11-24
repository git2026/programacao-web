// Componente de cabeçalho com navegação
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { profile } from '../../data/profile';
import { APP_CONFIG } from '../../data/config';
import { refreshProjects } from '../../sections/Projects/Projects';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <span className={styles.brand}>{profile.name}</span>
        <ul className={styles.menu}>
          {APP_CONFIG.navigation.routes.map((route) => (
            <li key={route.path}>
              <NavLink 
                to={route.path} 
                className={({ isActive }) => isActive ? styles.active : undefined}
              >
                {route.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={refreshProjects}
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'var(--hover)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'var(--surface)'}
          >
            🔄
          </button>
          <ThemeToggle className={styles.themeToggle} />
        </div>
      </nav>
    </header>
  );
}