import { useState, useEffect } from 'react';
import styles from './Skills.module.css';

type ApiProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  github?: string;
};

export default function Skills() {
  const [primary, setPrimary] = useState<string[]>([]);
  const [secondary, setSecondary] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar projetos da API e extrair tecnologias
    fetch('http://localhost:5000/api/projects')
      .then((res) => res.json())
      .then((apiProjects: ApiProject[]) => {
        if (Array.isArray(apiProjects) && apiProjects.length > 0) {
          // Contar frequência de cada tecnologia
          const techCount: { [key: string]: number } = {};
          
          apiProjects.forEach((project) => {
            if (project.technologies && Array.isArray(project.technologies)) {
              project.technologies.forEach((tech) => {
                techCount[tech] = (techCount[tech] || 0) + 1;
              });
            }
          });

          // Ordenar por frequência
          const sortedTechs = Object.entries(techCount)
            .sort((a, b) => b[1] - a[1])
            .map(([tech]) => tech);

          // Dividir em principais (primeiros 50%) e secundárias (restantes 50%)
          const splitIndex = Math.ceil(sortedTechs.length / 2);
          setPrimary(sortedTechs.slice(0, splitIndex));
          setSecondary(sortedTechs.slice(splitIndex));
        } else {
          // Se não houver projetos, deixar vazio
          setPrimary([]);
          setSecondary([]);
        }
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
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando competências...</p>
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


