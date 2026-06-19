import { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Clientes from '../components/Clientes';
import Evolve from '../components/Evolve';
import Portfolio from '../components/Portfolio';
import Footer from '../components/Footer';
import { getCases, getConfig, getBlogPosts } from '../lib/api';
import { Link } from 'react-router-dom';

const Trailer3D = lazy(() => import('../components/Trailer3D'));
const InstagramFeed = lazy(() => import('../components/InstagramFeed'));

// ── Helper de data pro carrossel do blog ──────────────────────────────────────
function formatBlogDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Seção de carrossel do blog ────────────────────────────────────────────────
function BlogCarousel() {
  const [posts, setPosts] = useState([]);
  const trackRef = useState(() => ({ current: null }))[0];

  useEffect(() => {
    getBlogPosts()
      .then((data) => setPosts(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => setPosts([]));
  }, []);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  if (posts.length === 0) return null;

  return (
    <section className="blog-carousel fade-in">
      <div className="blog-carousel__header">
        <div>
          <p className="blog-carousel__eyebrow">
            <span className="blog-carousel__eyebrow-line" />
            Blog
          </p>
          <h2 className="blog-carousel__title">Bastidores &amp; ideias</h2>
        </div>
        <div className="blog-carousel__actions">
          <button type="button" aria-label="Anterior" className="blog-carousel__nav" onClick={() => scrollBy(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" aria-label="Próximo" className="blog-carousel__nav" onClick={() => scrollBy(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <Link to="/blog" className="blog-carousel__viewall">Ver tudo</Link>
        </div>
      </div>

      <div className="blog-carousel__track" ref={(el) => { trackRef.current = el; }}>
        {posts.map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.id} className="blog-carousel__card">
            <div className="blog-carousel__thumb">
              {post.imagem_capa ? (
                <img src={post.imagem_capa} alt={post.titulo} loading="lazy" />
              ) : (
                <div className="blog-carousel__thumb-placeholder" />
              )}
            </div>
            <time className="blog-carousel__date">{formatBlogDate(post.data_publicacao)}</time>
            <h3 className="blog-carousel__card-title">{post.titulo}</h3>
            <p className="blog-carousel__card-resumo">{post.resumo}</p>
          </Link>
        ))}
      </div>

      <style>{`
        .blog-carousel {
          padding: 6rem 4rem;
          background: var(--bg, #0b0d0f);
        }
        .blog-carousel__header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 2.5rem; gap: 1.5rem; flex-wrap: wrap;
        }
        .blog-carousel__eyebrow {
          display: flex; align-items: center; gap: 1rem;
          font-size: .7rem; text-transform: uppercase; letter-spacing: .2em;
          color: #d0ff00; margin-bottom: 1rem;
        }
        .blog-carousel__eyebrow-line { display: block; width: 32px; height: 1px; background: #d0ff00; }
        .blog-carousel__title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 700;
          letter-spacing: -0.03em; color: #f0f0f0;
        }
        .blog-carousel__actions { display: flex; align-items: center; gap: .75rem; }
        .blog-carousel__nav {
          width: 42px; height: 42px; border-radius: 50%;
          border: 1px solid rgba(240,240,240,0.15); background: transparent;
          color: #f0f0f0; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color .3s, color .3s;
        }
        .blog-carousel__nav svg { width: 18px; height: 18px; }
        .blog-carousel__nav:hover { border-color: #d0ff00; color: #d0ff00; }
        .blog-carousel__viewall {
          font-size: .72rem; text-transform: uppercase; letter-spacing: .15em;
          color: rgba(240,240,240,0.6); font-weight: 700; margin-left: .5rem;
          font-family: 'Space Grotesk', sans-serif; transition: color .3s;
          text-decoration: none; white-space: nowrap;
        }
        .blog-carousel__viewall:hover { color: #d0ff00; }

        .blog-carousel__track {
          display: flex; gap: 1.5rem; overflow-x: auto; scroll-snap-type: x mandatory;
          padding-bottom: .5rem; scrollbar-width: none;
        }
        .blog-carousel__track::-webkit-scrollbar { display: none; }

        .blog-carousel__card {
          flex: 0 0 320px; scroll-snap-align: start;
          display: flex; flex-direction: column; gap: .75rem;
          text-decoration: none; color: inherit;
        }
        .blog-carousel__thumb {
          height: 200px; border-radius: 4px; overflow: hidden;
          background: linear-gradient(135deg, #1a1e22, #111416);
        }
        .blog-carousel__thumb img {
          width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(0.16,1,0.3,1);
        }
        .blog-carousel__card:hover .blog-carousel__thumb img { transform: scale(1.05); }
        .blog-carousel__thumb-placeholder { width: 100%; height: 100%; }
        .blog-carousel__date {
          font-size: .68rem; text-transform: uppercase; letter-spacing: .15em;
          color: rgba(240,240,240,0.38);
        }
        .blog-carousel__card-title {
          font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; font-weight: 700;
          line-height: 1.25; letter-spacing: -0.01em; color: #f0f0f0; transition: color .3s;
        }
        .blog-carousel__card:hover .blog-carousel__card-title { color: #d0ff00; }
        .blog-carousel__card-resumo {
          font-size: .85rem; line-height: 1.6; color: rgba(240,240,240,0.5);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        @media (max-width: 768px) {
          .blog-carousel { padding: 3.5rem 1.8rem; }
          .blog-carousel__card { flex: 0 0 78vw; }
        }
      `}</style>
    </section>
  );
}

gsap.registerPlugin(ScrollTrigger);

const SITE_FALLBACK = {
  nome: 'Creapes',
  logo: 'https://res.cloudinary.com/dhu1cqvrb/image/upload/v1781788827/creapeslogo_jajjgt.png',
  whatsapp: '5511999999999',
  instagramUrl: 'https://instagram.com/creapes',
  vimeoUrl: 'https://vimeo.com/creapes',
  linkedinUrl: 'https://linkedin.com/company/creapes',
};

// ── Converte URL do Vimeo normal para player embed ────────────────────────────
function buildVimeoEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('player.vimeo.com')) return url;
  const clean = url.split('?')[0].replace(/\/$/, '');
  const parts = clean.split('/');
  if (parts.length >= 5) return `https://player.vimeo.com/video/${parts[3]}?h=${parts[4]}`;
  if (parts.length === 4) return `https://player.vimeo.com/video/${parts[3]}`;
  return null;
}

// ── Verifica se case pertence à categoria "hero" ──────────────────────────────
function isHeroCase(c) {
  const catNome = (c.categoria_nome || c.categoria?.nome || '').toLowerCase();
  const catSlug = (c.categoria_slug || c.categoria?.slug || '').toLowerCase();
  const catStr  = (typeof c.categoria === 'string' ? c.categoria : '').toLowerCase();
  return catNome.includes('hero') || catSlug.includes('hero') || catStr.includes('hero');
}

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [site, setSite] = useState(SITE_FALLBACK);
  const [heroSlides, setHeroSlides] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [clientLogos, setClientLogos] = useState([]);
  const [logosClientesRaw, setLogosClientesRaw] = useState('');

  // ── Fetch dados do backend ─────────────────────────────────────────────────
  useEffect(() => {
    getCases()
      .then((cases) => {
        const sorted = [...cases].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

        const hero = sorted
          .filter(isHeroCase)
          .map((c) => {
            const bgVideo = buildVimeoEmbedUrl(c.link_projeto) || c.link_projeto || null;
            return {
              id:      c.id,
              nome:    c.nome,
              ano:     c.estoque || c.ano || '',
              bgVideo,
              isVimeo: bgVideo?.includes('vimeo.com') || false,
              caseId:  c.id,
            };
          });

        const portfolio = sorted
          .filter((c) => !isHeroCase(c))
          .map((c) => {
            const isVimeo = c.link_projeto?.includes('vimeo') || false;
            const bgLink = isVimeo
              ? (buildVimeoEmbedUrl(c.link_projeto) || c.link_projeto)
              : (c.link_projeto || null);

            return {
              id:        c.id,
              nome:      c.nome,
              descricao: c.descricao || '',
              ano:       c.estoque || c.ano || '',
              bgLink,
              isVimeo,
            };
          });

        if (hero.length > 0)      setHeroSlides(hero);
        if (portfolio.length > 0) setPortfolioItems(portfolio);
      })
      .catch(() => {});

    getConfig()
      .then((config) => {
        if (!config) return;
        setSite({
          nome:        config.sobre_titulo      || SITE_FALLBACK.nome,
          logo:        config.logo_url || config.logo || SITE_FALLBACK.logo,
          whatsapp:    config.whatsapp_comercial || SITE_FALLBACK.whatsapp,
          instagramUrl: config.instagram_url    || SITE_FALLBACK.instagramUrl,
          vimeoUrl:    SITE_FALLBACK.vimeoUrl,
          linkedinUrl: SITE_FALLBACK.linkedinUrl,
        });
        if (config.logos_clientes || config.clientes_logos) {
          const raw = config.logos_clientes || config.clientes_logos;
          setLogosClientesRaw(raw);
          const urls = raw
            .split('\n')
            .map((u) => u.trim())
            .filter(Boolean);
          if (urls.length > 0) setClientLogos(urls);
        }
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

  // ── PERFORMANCE: pausa animações cinematic quando a aba fica inativa ──────
  useEffect(() => {
    const elements = [
      document.querySelector('.cinematic-overlay'),
      document.querySelector('.cinematic-overlay::after'),
    ];

    const handleVisibility = () => {
      const state = document.hidden ? 'paused' : 'running';
      const overlay = document.querySelector('.cinematic-overlay');
      if (overlay) {
        overlay.style.animationPlayState = state;
        // pausa também o pseudo-element via classe CSS
        overlay.classList.toggle('anim-paused', document.hidden);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleLoaderComplete = useCallback(() => {
    document.body.classList.remove('loading');
    setLoaderDone(true);
  }, []);

  return (
    <>
      <div className="cinematic-overlay" aria-hidden="true" />
      <div className="cinematic-grade"   aria-hidden="true" />
      <div className="cinematic-vignette" aria-hidden="true" />

      <Loader onComplete={handleLoaderComplete} />

      <div style={{ opacity: loaderDone ? 1 : 0, pointerEvents: loaderDone ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <Navbar brandName={site.nome} brandLogo={site.logo} />

        <Hero slides={heroSlides} ready={loaderDone} />

        <Clientes logos={clientLogos} />

        <Evolve ready={loaderDone} />

        <Portfolio items={portfolioItems} />

        <Suspense fallback={
          <section style={{ height: '350vh', background: 'var(--bg)' }} />
        }>
          <Trailer3D />
        </Suspense>

        <BlogCarousel />

        <Suspense fallback={null}>
          <InstagramFeed logosClientes={logosClientesRaw} />
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
          /* PERFORMANCE: will-change avisa o browser pra isolar em camada */
          will-change: opacity;
        }
        /* PERFORMANCE: pausa todas as animações do overlay quando .anim-paused */
        .cinematic-overlay.anim-paused,
        .cinematic-overlay.anim-paused::after {
          animation-play-state: paused !important;
        }
        .cinematic-overlay::after {
          content: "";
          position: absolute; top: -100%; left: -100%; width: 300%; height: 300%;
          background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
          opacity: 0.3;
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          /* PERFORMANCE: transform-only animation fica na GPU, não repinta o layout */
          will-change: transform;
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
        @media (max-width: 768px) {
          html, body {
            overflow-x: hidden;
            max-width: 100vw;
          }
        }
        @keyframes flicker {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.35; }
        }
        @keyframes grain {
          0%,100% { transform: translate(0,0); }
          10%  { transform: translate(-5%,-10%); }
          20%  { transform: translate(-15%,5%); }
          30%  { transform: translate(7%,-25%); }
          40%  { transform: translate(-5%,25%); }
          50%  { transform: translate(-15%,10%); }
          60%  { transform: translate(15%,0%); }
          70%  { transform: translate(0%,15%); }
          80%  { transform: translate(3%,35%); }
          90%  { transform: translate(-10%,10%); }
        }
      `}</style>
    </>
  );
}
