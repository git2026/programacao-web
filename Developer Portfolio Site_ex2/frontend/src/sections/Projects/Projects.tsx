import { useState, useEffect } from 'react';
import styles from './Projects.module.css';

type ApiProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  github?: string;
};

// Função global para refresh
let globalRefreshProjects: (() => void) | null = null;

export const setGlobalRefreshProjects = (fn: () => void) => {
  globalRefreshProjects = fn;
};

export const refreshProjects = () => {
  if (globalRefreshProjects) {
    globalRefreshProjects();
  }
};

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para adicionar cache-busting às imagens
  const addCacheBusting = (imagePath: string) => {
    if (!imagePath) return imagePath;
    const separator = imagePath.includes('?') ? '&' : '?';
    return `${imagePath}${separator}t=${Date.now()}`;
  };

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
            image: p.image ? addCacheBusting(p.image) : undefined,
          }));
          setProjects(mappedProjects);
        }
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  }, []);

  // Registar função global
  useEffect(() => {
    setGlobalRefreshProjects(refreshProjects);
  }, []);

  // Função para recarregar projetos
  const refreshProjects = async () => {
    setLoading(true);
    try {
      // Primeiro verificar se o servidor está disponível
      await fetch('http://localhost:5000/api/projects/refresh');
      
      // Depois carregar os projetos
      const res = await fetch('http://localhost:5000/api/projects');
      const apiProjects: ApiProject[] = await res.json();
      
      if (Array.isArray(apiProjects)) {
        const mappedProjects = apiProjects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          tech: p.technologies || [],
          links: {
            repo: p.github || undefined,
          },
          image: p.image ? addCacheBusting(p.image) : undefined,
        }));
        setProjects(mappedProjects);
      }
    } catch (error) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.projects}>
      <div className={styles.inner}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>
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


