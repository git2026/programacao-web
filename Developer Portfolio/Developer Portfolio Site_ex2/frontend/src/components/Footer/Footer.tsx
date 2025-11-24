// Componente de rodapé
import styles from './Footer.module.css';
import { profile } from '../../data/profile';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>© {year} {profile.name}. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}