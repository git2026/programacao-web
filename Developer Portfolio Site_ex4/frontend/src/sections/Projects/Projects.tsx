import { useState, useEffect, useCallback } from 'react';
import styles from './Projects.module.css';
import { APP_CONFIG } from '../../data/config';
import { setGlobalRefreshProjects } from '../../utils/projectRefresh';

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

  // Função para adicionar cache-busting às imagens
  const addCacheBusting = useCallback((imagePath: string) => {
    if (!imagePath) return imagePath;
    const separator = imagePath.includes('?') ? '&' : '?';
    return `${imagePath}${separator}t=${Date.now()}`;
  }, []);

  // Função para recarregar projetos (memoizada com useCallback)
  const internalRefreshProjects = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = APP_CONFIG.apiUrl ? `${APP_CONFIG.apiUrl}/api/projects` : '/api/projects';
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
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
      console.error('Erro ao carregar projetos:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [addCacheBusting]);

  // Carregar projetos na inicialização
  useEffect(() => {
    internalRefreshProjects();
  }, [internalRefreshProjects]);

  // Registar função global para refresh
  useEffect(() => {
    setGlobalRefreshProjects(internalRefreshProjects);
  }, [internalRefreshProjects]);

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