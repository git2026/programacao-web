import styles from './Skills.module.css';

const primary = ['Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'HTML', 'CSS', 'MySQL', 'PostgreSQL', 'Flask', 'React'];
const secondary = ['Bootstrap', 'Docker', 'Kubernetes', 'Redis', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'Tkinter', 'Swing', 'Git'];

export default function Skills() {
  return (
    <section className={styles.skills}>
      <div className={styles.inner}>
        <h2>Competências Técnicas</h2>
        <p className={styles.subtitle}>
          Tecnologias e ferramentas que utilizadas nos meus projetos
        </p>
        <div className={styles.columns}>
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
        </div>
      </div>
    </section>
  );
}


