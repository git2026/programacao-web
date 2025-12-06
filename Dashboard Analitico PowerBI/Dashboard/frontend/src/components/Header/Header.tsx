// Componente de cabeçalho com navegação
import styles from './Header.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <span className={styles.brand}>
          Dashboard Transportes
        </span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ThemeToggle className={styles.themeToggle} />
        </div>
      </nav>
    </header>
  );
}