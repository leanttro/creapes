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
import { getCases, getConfig } from '../lib/api';

const Trailer3D = lazy(() => import('../components/Trailer3D'));
const InstagramFeed = lazy(() => import('../components/InstagramFeed'));

gsap.registerPlugin(ScrollTrigger);

// ── Fallbacks caso o backend falhe ──────────────────────────────────────────
const SITE_FALLBACK = {
  nome: 'Creapes',
  logo: null,
  whatsapp: '5511999999999',
  instagramUrl: 'https://instagram.com/creapes',
  vimeoUrl: 'https://vimeo.com/creapes',
  linkedinUrl: 'https://linkedin.com/company/creapes',
};

const CLIENT_LOGOS = [
  'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a0/Adidas_wordmark.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
];

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [site, setSite] = useState(SITE_FALLBACK);
  const [heroSlides, setHeroSlides] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);

  // ── Fetch dados do backend ─────────────────────────────────────────────────
  useEffect(() => {
    // Cases: separa hero (categoria "hero") de portfolio (resto)
    getCases()
      .then((cases) => {
        const hero = cases
          .filter((c) => c.categoria?.toLowerCase() === 'hero')
          .map((c) => ({
            id: c.id,
            nome: c.nome,
            ano: c.ano || '',
            bgVideo: c.link_projeto || null,
            isVimeo: c.link_projeto?.includes('vimeo') || false,
            caseId: c.id,
          }));

        const portfolio = cases
          .filter((c) => c.categoria?.toLowerCase() !== 'hero')
          .map((c) => ({
            id: c.id,
            nome: c.nome,
            descricao: c.descricao || '',
            ano: c.ano || '',
            bgLink: c.link_projeto || null,
            isVimeo: c.link_projeto?.includes('vimeo') || false,
          }));

        if (hero.length > 0) setHeroSlides(hero);
        if (portfolio.length > 0) setPortfolioItems(portfolio);
      })
      .catch(() => {
        // Mantém arrays vazios — componentes mostram fallback visual
      });

    // Config: nome, logo, whatsapp, redes sociais
    getConfig()
      .then((config) => {
        if (!config) return;
        setSite({
          nome: config.sobre_titulo || SITE_FALLBACK.nome,
          logo: null,
          whatsapp: config.whatsapp_comercial || SITE_FALLBACK.whatsapp,
          instagramUrl: config.instagram_url || SITE_FALLBACK.instagramUrl,
          vimeoUrl: SITE_FALLBACK.vimeoUrl,
          linkedinUrl: SITE_FALLBACK.linkedinUrl,
        });
      })
      .catch(() => {});
  }, []);

  // ── Fade-in IntersectionObserver ──────────────────────────────────────────
  useEffect(() => {
    if (!loaderDone) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    ScrollTrigger.refresh();

    return () => observer.disconnect();
  }, [loaderDone]);

  function handleLoaderComplete() {
    document.body.classList.remove('loading');
    setLoaderDone(true);
  }

  return (
    <>
      <div className="cinematic-overlay" aria-hidden="true" />
      <div className="cinematic-grade" aria-hidden="true" />
      <div className="cinematic-vignette" aria-hidden="true" />

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

      <Loader onComplete={handleLoaderComplete} />

      <div style={{ visibility: loaderDone ? 'visible' : 'hidden' }}>
        <Navbar brandName={site.nome} brandLogo={site.logo} />

        <Hero slides={heroSlides} />

        <Clientes logos={CLIENT_LOGOS} />

        <Evolve />

        <Portfolio items={portfolioItems} />

        <Suspense fallback={
          <section style={{ height: '350vh', background: 'var(--bg)' }} />
        }>
          <Trailer3D />
        </Suspense>

        <Suspense fallback={null}>
          <InstagramFeed posts={[]} />
        </Suspense>

        <Footer
          nome={site.nome}
          whatsapp={site.whatsapp}
          instagramUrl={site.instagramUrl}
          vimeoUrl={site.vimeoUrl}
          linkedinUrl={site.linkedinUrl}
        />
      </div>

      <style>{`
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
