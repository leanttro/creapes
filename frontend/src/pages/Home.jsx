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
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' });
  };

  if (posts.length === 0) return null;

  return (
    <section className="blog-carousel fade-in">
      <div className="blog-carousel__deco" aria-hidden="true">BLOG</div>

      <div className="blog-carousel__header">
        <div>
          <p className="blog-carousel__eyebrow">
            <span className="blog-carousel__eyebrow-line" />
            Blog
          </p>
          <h2 className="blog-carousel__title">
            Bastidores<br /><em>&amp; ideias.</em>
          </h2>
        </div>
        <div className="blog-carousel__actions">
          <Link to="/blog" className="blog-carousel__viewall">
            Ver tudo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="blog-carousel__navgroup">
            <button type="button" aria-label="Anterior" className="blog-carousel__nav" onClick={() => scrollBy(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" aria-label="Próximo" className="blog-carousel__nav blog-carousel__nav--accent" onClick={() => scrollBy(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="blog-carousel__track" ref={(el) => { trackRef.current = el; }}>
        {posts.map((post, i) => (
          <Link to={`/blog/${post.slug}`} key={post.id} className="blog-carousel__card">
            <span className="blog-carousel__index">{String(i + 1).padStart(2, '0')}</span>
            <div className="blog-carousel__thumb">
              {post.imagem_capa ? (
                <img src={post.imagem_capa} alt={post.titulo} loading="lazy" />
              ) : (
                <div className="blog-carousel__thumb-placeholder" />
              )}
              <div className="blog-carousel__thumb-glow" />
            </div>
            <div className="blog-carousel__card-body">
              <time className="blog-carousel__date">{formatBlogDate(post.data_publicacao)}</time>
              <h3 className="blog-carousel__card-title">{post.titulo}</h3>
              <p className="blog-carousel__card-resumo">{post.resumo}</p>
              <span className="blog-carousel__card-cta">
                Ler artigo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .blog-carousel {
          position: relative;
          padding: 7rem 4rem 8rem;
          background: radial-gradient(ellipse at top left, rgba(208,255,0,0.04) 0%, transparent 55%), #0b0d0f;
          overflow: hidden;
        }
        .blog-carousel__deco {
          position: absolute; top: 50%; right: -1rem; transform: translateY(-50%);
          font-family: 'Space Grotesk', sans-serif; font-size: clamp(8rem, 18vw, 18rem);
          font-weight: 700; letter-spacing: -0.06em; color: transparent;
          -webkit-text-stroke: 1px rgba(240,240,240,.04);
          pointer-events: none; user-select: none; white-space: nowrap; z-index: 0;
        }
        .blog-carousel__header {
          position: relative; z-index: 1;
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 3.5rem; gap: 1.5rem; flex-wrap: wrap;
        }
        .blog-carousel__eyebrow {
          display: flex; align-items: center; gap: 1rem;
          font-size: .72rem; text-transform: uppercase; letter-spacing: .22em;
          color: #d0ff00; margin-bottom: 1.2rem; font-weight: 700;
        }
        .blog-carousel__eyebrow-line {
          display: block; width: 36px; height: 2px; background: #d0ff00;
          box-shadow: 0 0 12px rgba(208,255,0,.7);
        }
        .blog-carousel__title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.4rem, 4.5vw, 4rem); font-weight: 700;
          letter-spacing: -0.04em; line-height: .98; color: #ffffff;
        }
        .blog-carousel__title em { font-style: normal; color: #d0ff00; }
        .blog-carousel__actions { display: flex; align-items: center; gap: 1.5rem; }
        .blog-carousel__viewall {
          display: inline-flex; align-items: center; gap: .6rem;
          font-size: .78rem; text-transform: uppercase; letter-spacing: .15em;
          color: #ffffff; font-weight: 700;
          font-family: 'Space Grotesk', sans-serif; transition: color .3s, gap .3s;
          text-decoration: none; white-space: nowrap; padding-bottom: .3rem;
          border-bottom: 1px solid rgba(240,240,240,.25);
        }
        .blog-carousel__viewall svg { width: 16px; height: 16px; }
        .blog-carousel__viewall:hover { color: #d0ff00; gap: .9rem; border-color: #d0ff00; }
        .blog-carousel__navgroup { display: flex; align-items: center; gap: .6rem; }
        .blog-carousel__nav {
          width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
          border: 1px solid rgba(240,240,240,0.18); background: transparent;
          color: #f0f0f0; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color .3s, color .3s, background .3s, transform .3s;
        }
        .blog-carousel__nav svg { width: 18px; height: 18px; }
        .blog-carousel__nav:hover { border-color: #d0ff00; color: #d0ff00; transform: scale(1.06); }
        .blog-carousel__nav--accent { background: #d0ff00; border-color: #d0ff00; color: #000; }
        .blog-carousel__nav--accent:hover { background: #e4ff4d; color: #000; box-shadow: 0 0 24px rgba(208,255,0,.45); }

        .blog-carousel__track {
          position: relative; z-index: 1;
          display: flex; gap: 2rem; overflow-x: auto; scroll-snap-type: x mandatory;
          padding-bottom: 1rem; scrollbar-width: none;
        }
        .blog-carousel__track::-webkit-scrollbar { display: none; }

        .blog-carousel__card {
          flex: 0 0 380px; scroll-snap-align: start;
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit;
          background: #14171a; border: 1px solid rgba(240,240,240,0.08);
          border-radius: 8px; overflow: hidden; position: relative;
          transition: border-color .4s cubic-bezier(0.16,1,0.3,1), transform .4s cubic-bezier(0.16,1,0.3,1), box-shadow .4s;
        }
        .blog-carousel__card:hover {
          border-color: rgba(208,255,0,.4); transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,.45);
        }
        .blog-carousel__index {
          position: absolute; top: 1.2rem; left: 1.2rem; z-index: 2;
          font-family: 'Space Grotesk', sans-serif; font-size: .72rem; font-weight: 700;
          color: #000; background: #d0ff00; padding: .3rem .7rem; border-radius: 100px;
          letter-spacing: .05em;
        }
        .blog-carousel__thumb {
          position: relative; height: 240px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at center, #1c2024 0%, #0e1012 100%);
        }
        .blog-carousel__thumb img {
          width: 100%; height: 100%; object-fit: contain; padding: 1.5rem;
          transition: transform .8s cubic-bezier(0.16,1,0.3,1);
        }
        .blog-carousel__card:hover .blog-carousel__thumb img { transform: scale(1.08); }
        .blog-carousel__thumb-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #1a1e22, #111416); }
        .blog-carousel__thumb-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 45%);
        }
        .blog-carousel__card-body { padding: 1.8rem 1.8rem 2.2rem; display: flex; flex-direction: column; gap: .7rem; }
        .blog-carousel__date {
          font-size: .7rem; text-transform: uppercase; letter-spacing: .15em;
          color: #d0ff00; font-weight: 700;
        }
        .blog-carousel__card-title {
          font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 700;
          line-height: 1.25; letter-spacing: -0.02em; color: #ffffff; transition: color .3s;
        }
        .blog-carousel__card:hover .blog-carousel__card-title { color: #d0ff00; }
        .blog-carousel__card-resumo {
          font-size: .9rem; line-height: 1.65; color: rgba(240,240,240,0.55);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .blog-carousel__card-cta {
          display: inline-flex; align-items: center; gap: .5rem;
          font-size: .74rem; text-transform: uppercase; letter-spacing: .15em;
          color: #ffffff; font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          margin-top: .6rem; transition: gap .3s, color .3s;
        }
        .blog-carousel__card-cta svg { width: 14px; height: 14px; }
        .blog-carousel__card:hover .blog-carousel__card-cta { gap: .9rem; color: #d0ff00; }

        @media (max-width: 768px) {
          .blog-carousel { padding: 4rem 1.8rem 4.5rem; }
          .blog-carousel__deco { display: none; }
          .blog-carousel__card { flex: 0 0 82vw; }
          .blog-carousel__thumb { height: 200px; }
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
