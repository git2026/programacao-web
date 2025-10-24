import { useState, useEffect } from 'react';
import styles from './Projects.module.css';
import { projects as fallbackProjects } from '../../data/projects';

type ApiProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  github?: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar projetos da API
    fetch('http://localhost:5000/api/projects')
      .then((res) => res.json())
      .then((apiProjects: ApiProject[]) => {
        // Sempre atualizar com os projetos da API, mesmo que esteja vazio
        if (Array.isArray(apiProjects)) {
          const mappedProjects = apiProjects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            tech: p.technologies || [],
            links: {
              repo: p.github || undefined,
            },
            image: p.image || undefined,
          }));
          setProjects(mappedProjects);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao carregar projetos da API:', error);
        console.log('Usando projetos locais como fallback');
        setProjects(fallbackProjects);
        setLoading(false);
      });
  }, []);

  return (
    <section className={styles.projects}>
      <div className={styles.inner}>
        <h2>Projetos</h2>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando projetos...</p>
        ) : projects.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Nenhum projeto disponível
          </p>
        ) : (
          <ul className={styles.grid}>
            {projects.map((p) => (
              <li key={p.id} className={styles.card}>
                {p.image ? (
                  <img src={p.image} alt={`${p.title} thumbnail`} className={styles.thumb} />
                ) : null}
                <h3>{p.title}</h3>
                <p className={styles.desc}>{p.description}</p>
                {p.tech?.length ? (
                  <ul className={styles.tech}>
                    {p.tech.map((t: string) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : null}
                <div className={styles.links}>
                  {p.links.repo && (
                    <a href={p.links.repo} target="_blank" rel="noreferrer">
                      Repositório
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}


