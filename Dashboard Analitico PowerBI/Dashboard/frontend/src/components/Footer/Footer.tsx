// Componente de rodapé
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>© {year} Dashboard Transportes. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}