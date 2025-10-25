import styles from './About.module.css';
import { profile } from '../../data/profile';

export default function About() {
  return (
    <section className={styles.about}>
      <div className={styles.inner}>
        <img 
          className={styles.avatar}
          src={`https://github.com/${profile.githubUsername}.png`}
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.content}>
          <h2>Sobre Mim</h2>
          <p>
            Sou desenvolvedor full-stack com experiência em aplicações web completas, desde websites 
            desenvolvido com PHP e MySQL até sistemas de streaming baseados em microserviços com 
            load balancing, entre outros. Especializo-me principalmente em Python para desenvolvimento 
            backend e machine learning, utilizando frameworks como Flask e bibliotecas como scikit-learn 
            para criar sistemas inteligentes para análise de dados.
          </p>
          <p>
            Também trabalho com tecnologias frontend modernas como React, Qt.io, HTML e outras para 
            desenvolver interfaces de utilizador interativas e elegantes. Acredito na importância de 
            arquiteturas escaláveis e descentralizadas e na aplicação prática de conceitos de DevOps, 
            utilizando Docker e Kubernetes para deploy de aplicações distribuídas. Cada projeto 
            representa uma oportunidade de aprender e aplicar novas tecnologias para resolver problemas 
            reais, sempre com foco na qualidade do código e na experiência do utilizador.
          </p>
          <div className={styles.contactInfo}>
            <h3>Contacto</h3>
            <p>
              Email: <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
            <p>
              GitHub: <a href={profile.github} target="_blank" rel="noreferrer">{profile.github}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

