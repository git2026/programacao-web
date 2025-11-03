import { useState, useEffect } from 'react';
import styles from './Skills.module.css';
import { APP_CONFIG } from '../../data/config';

type SkillsResponse = {
  primary: string[];
  secondary: string[];
  stats?: {
    totalProjects: number;
    totalTechnologies: number;
    threshold: number;
  };
};

export default function Skills() {
  const [primary, setPrimary] = useState<string[]>([]);
  const [secondary, setSecondary] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar competências organizadas da API
    const apiUrl = APP_CONFIG.apiUrl ? `${APP_CONFIG.apiUrl}/api/projects/skills` : '/api/projects/skills';
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: SkillsResponse) => {
        setPrimary(data.primary || []);
        setSecondary(data.secondary || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao carregar competências:', error);
        // Fallback com competências padrão
        setPrimary(['Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'HTML', 'CSS', 'MySQL', 'PostgreSQL', 'Flask', 'React']);
        setSecondary(['Bootstrap', 'Docker', 'Kubernetes', 'Redis', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'Tkinter', 'Swing', 'Git']);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className={styles.skills}>
        <div className={styles.inner}>
          <h2>Competências Técnicas</h2>
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>
        </div>
      </section>
    );
  }

  if (primary.length === 0 && secondary.length === 0) {
    return (
      <section className={styles.skills}>
        <div className={styles.inner}>
          <h2>Competências Técnicas</h2>
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Nenhuma competência disponível.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.skills}>
      <div className={styles.inner}>
        <h2>Competências Técnicas</h2>
        <p className={styles.subtitle}>
          Tecnologias e ferramentas utilizadas nos meus projetos
        </p>
        <div className={styles.columns}>
          {primary.length > 0 && (
            <div className={styles.column}>
              <h3>Principais</h3>
              <div className={styles.skillsGrid}>
                {primary.map((skill) => (
                  <span key={skill} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {secondary.length > 0 && (
            <div className={styles.column}>
              <h3>Secundárias</h3>
              <div className={styles.skillsGrid}>
                {secondary.map((skill) => (
                  <span key={skill} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}