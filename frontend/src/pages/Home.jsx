import { useEffect, useState, lazy, Suspense } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Clientes from '../components/Clientes';
import Evolve from '../components/Evolve';
import Portfolio from '../components/Portfolio';
import Footer from '../components/Footer';

// Componentes pesados: lazy load via IntersectionObserver/Suspense
const Trailer3D = lazy(() => import('../components/Trailer3D'));
const InstagramFeed = lazy(() => import('../components/InstagramFeed'));

gsap.registerPlugin(ScrollTrigger);

// ── Dados mockados (substituir por fetch via lib/api.js depois) ──────────────
const SITE = {
  nome: 'Creapes',
  logo: null, // URL da logo ou null para mostrar texto
  whatsapp: '5511999999999',
  instagramUrl: 'https://instagram.com/creapes',
  vimeoUrl: 'https://vimeo.com/creapes',
  linkedinUrl: 'https://linkedin.com/company/creapes',
};

const HERO_VIDEOS = [
  {
    id: '1',
    nome: 'Showreel 2024',
    ano: '2024',
    vimeoUrl: 'https://player.vimeo.com/video/1176338391?h=9316747c6c&background=1&autoplay=1&loop=1&muted=1&autopause=0',
    caseUrl: '/case/1',
  },
  {
    id: '2',
    nome: 'Motion Reel',
    ano: '2023',
    vimeoUrl: 'https://player.vimeo.com/video/1176338391?h=9316747c6c&background=1&autoplay=1&loop=1&muted=1&autopause=0',
    caseUrl: '/case/2',
  },
  {
    id: '3',
    nome: 'Brand Films',
    ano: '2023',
    vimeoUrl: null,
    bgImage: 'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=1920',
    caseUrl: '/case/3',
  },
];

const CLIENT_LOGOS = [
  'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a0/Adidas_wordmark.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
];

const PORTFOLIO_ITEMS = [
  { id: '1', nome: 'Campanha Nike', descricao: 'Motion Design', ano: '2024', vimeoUrl: null, bgImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', caseUrl: '/case/1' },
  { id: '2', nome: 'Samsung Launch', descricao: 'Brand Film', ano: '2024', vimeoUrl: null, bgImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800', caseUrl: '/case/2' },
  { id: '3', nome: 'Itaú Unibanco', descricao: 'Institucional', ano: '2023', vimeoUrl: null, bgImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800', caseUrl: '/case/3' },
  { id: '4', nome: 'Natura Ekos', descricao: 'Documentário', ano: '2023', vimeoUrl: null, bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', caseUrl: '/case/4' },
  { id: '5', nome: 'Globo Esporte', descricao: 'Showreel', ano: '2023', vimeoUrl: null, bgImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', caseUrl: '/case/5' },
];

const INSTAGRAM_POSTS = [
  // Adicionar posts reais via backend — embedUrl de posts públicos do Instagram
  // Exemplo: { embedUrl: 'https://www.instagram.com/p/SEU_POST_ID/embed' }
];

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);

  // ── Fade-in IntersectionObserver ──────────────────────────────────────────
  useEffect(() => {
    if (!loaderDone) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    ScrollTrigger.refresh();

    return () => observer.disconnect();
  }, [loaderDone]);

  function handleLoaderComplete() {
    document.body.classList.remove('loading');
    setLoaderDone(true);
  }

  return (
    <>
      {/* Overlay cinematográfico — grain + vignette — fixo sobre tudo */}
      <div className="cinematic-overlay" aria-hidden="true" />
      <div className="cinematic-grade" aria-hidden="true" />
      <div className="cinematic-vignette" aria-hidden="true" />

      {/* Cortinas do Evolve — fixas, controladas por Evolve.jsx via CSS/JS */}
      <div
        id="evolve-curtain-top"
        style={{
          position: 'fixed', top: '-50%', left: 0,
          width: '100%', height: '50%',
          background: '#000', zIndex: 9998,
          pointerEvents: 'none',
          transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
      <div
        id="evolve-curtain-bottom"
        style={{
          position: 'fixed', bottom: '-50%', left: 0,
          width: '100%', height: '50%',
          background: '#000', zIndex: 9998,
          pointerEvents: 'none',
          transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Loader — desmonta (display:none) quando animação termina */}
      <Loader onComplete={handleLoaderComplete} />

      {/* Conteúdo principal — renderizado imediatamente mas invisível até loader terminar */}
      <div style={{ visibility: loaderDone ? 'visible' : 'hidden' }}>
        <Navbar nome={SITE.nome} logo={SITE.logo} />

        <Hero slides={HERO_VIDEOS} />

        {CLIENT_LOGOS.length > 0 && (
          <Clientes logos={CLIENT_LOGOS} />
        )}

        <Evolve />

        <Portfolio items={PORTFOLIO_ITEMS} />

        {/* Trailer3D: lazy load — só monta quando próximo da viewport */}
        <Suspense fallback={
          <section style={{ height: '350vh', background: 'var(--bg)' }} />
        }>
          <Trailer3D />
        </Suspense>

        {/* InstagramFeed: lazy load, só renderiza se houver posts */}
        {INSTAGRAM_POSTS.length > 0 && (
          <Suspense fallback={null}>
            <InstagramFeed posts={INSTAGRAM_POSTS} />
          </Suspense>
        )}

        <Footer
          nome={SITE.nome}
          whatsapp={SITE.whatsapp}
          instagramUrl={SITE.instagramUrl}
          vimeoUrl={SITE.vimeoUrl}
          linkedinUrl={SITE.linkedinUrl}
        />
      </div>

      <style>{`
        /* ── Cinematic overlay (grain + vignette) ─────────────────────── */
        .cinematic-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 9990;
          background: repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px,
            transparent 1px, transparent 2px
          );
          animation: flicker 0.15s infinite;
          opacity: 0.4;
          mix-blend-mode: overlay;
        }
        .cinematic-overlay::after {
          content: "";
          position: absolute; top: -100%; left: -100%; width: 300%; height: 300%;
          background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
          opacity: 0.3;
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
        }
        .cinematic-grade {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 9991;
          background: linear-gradient(45deg, rgba(16,22,38,0.4) 0%, rgba(255,145,0,0.1) 100%);
          mix-blend-mode: color;
        }
        .cinematic-vignette {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 9992;
          background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.95) 100%);
        }

        @keyframes flicker {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.35; }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
      `}</style>
    </>
  );
}
