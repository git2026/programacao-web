import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';
import About from './sections/About/About';
import { APP_CONFIG } from './data/config';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main" className="visually-hidden-focusable">Saltar para o conteúdo</a>
      <ScrollToTop />
      <Header />
      <main id="main" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to={APP_CONFIG.navigation.defaultRoute} replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to={APP_CONFIG.navigation.defaultRoute} replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}