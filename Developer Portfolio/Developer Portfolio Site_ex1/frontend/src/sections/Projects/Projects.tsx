import styles from './Projects.module.css';
import { projects } from '../../data/projects';

export default function Projects() {
  return (
    <section className={styles.projects}>
      <div className={styles.inner}>
        <h2>Projetos</h2>
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
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : null}
              <div className={styles.links}>
                {p.links.live && (
                  <a href={p.links.live} target="_blank" rel="noreferrer">
                    Live
                  </a>
                )}
                {p.links.repo && (
                  <a href={p.links.repo} target="_blank" rel="noreferrer">
                    Repositório
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}


