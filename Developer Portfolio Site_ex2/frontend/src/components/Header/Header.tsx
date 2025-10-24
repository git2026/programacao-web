import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { profile } from '../../data/profile';
import { APP_CONFIG } from '../../data/config';

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
        <ThemeToggle className={styles.themeToggle} />
      </nav>
    </header>
  );
}


