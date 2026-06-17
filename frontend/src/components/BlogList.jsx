import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ── Dados mockados (substituir por fetch via lib/api.js depois) ──────────────
const MOCK_POSTS = [
  {
    id: '1',
    titulo: 'Como criamos o Showreel 2024',
    slug: 'showreel-2024',
    resumo: 'Bastidores completos da produção mais ambiciosa da Creapes: do conceito ao frame final, passando por colorização, VFX e mixagem de som.',
    conteudo: '',
    imagem_capa: 'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=1200',
    data_publicacao: '2024-06-01',
  },
  {
    id: '2',
    titulo: 'Color Grading Cinematográfico: nossa abordagem',
    slug: 'color-grading-cinematografico',
    resumo: 'A cor define a emoção. Exploramos o processo criativo por trás da colorização que transformou a campanha da Nike em uma obra de arte visual.',
    conteudo: '',
    imagem_capa: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200',
    data_publicacao: '2024-04-18',
  },
  {
    id: '3',
    titulo: 'Brand Films: contar histórias que ficam',
    slug: 'brand-films-contar-historias',
    resumo: 'Por que os melhores filmes de marca são aqueles que ninguém percebe como publicidade — e como chegamos lá em cada projeto que produzimos.',
    conteudo: '',
    imagem_capa: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200',
    data_publicacao: '2024-02-10',
  },
  {
    id: '4',
    titulo: 'Motion Design em 2024: tendências e experimentações',
    slug: 'motion-design-2024-tendencias',
    resumo: 'Do glitch ao orgânico — um panorama das linguagens visuais que dominaram o motion design no último ano e como as absorvemos no nosso processo criativo.',
    conteudo: '',
    imagem_capa: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200',
    data_publicacao: '2024-01-22',
  },
  {
    id: '5',
    titulo: 'Documentário Natura Ekos: produzir com propósito',
    slug: 'documentario-natura-ekos',
    resumo: 'Uma semana na Amazônia com câmeras, equipe e uma responsabilidade: traduzir em imagens o que as palavras não conseguem dizer sobre biodiversidade.',
    conteudo: '',
    imagem_capa: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
    data_publicacao: '2023-11-05',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
function PostCard({ post, index, featured = false }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Link
      to={`/blog/${post.slug}`}
      ref={cardRef}
      className={`post-card${featured ? ' post-card--featured' : ''}`}
      style={{
        opacity: 0,
        transform: 'translateY(32px)',
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`,
      }}
    >
      <div className="post-card__thumb">
        {post.imagem_capa ? (
          <img src={post.imagem_capa} alt={post.titulo} loading="lazy" />
        ) : (
          <div className="post-card__thumb-placeholder" />
        )}
        <div className="post-card__thumb-overlay" />
        <span className="post-card__tag">Artigo</span>
      </div>

      <div className="post-card__body">
        <time className="post-card__date">{formatDate(post.data_publicacao)}</time>
        <h2 className="post-card__titulo">{post.titulo}</h2>
        <p className="post-card__resumo">{post.resumo}</p>
        <span className="post-card__cta">
          Ler artigo
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function BlogList() {
  const [posts] = useState(MOCK_POSTS);
  // Substituir por: useEffect(() => { getBlogPosts().then(setPosts); }, []);

  const [featured, ...rest] = posts;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div className="blog-root">
        {/* ── Header ── */}
        <header className="blog-header">
          <div className="blog-header__inner">
            <Link to="/" className="blog-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Voltar
            </Link>

            <div className="blog-header__meta">
              <p className="blog-eyebrow">
                <span className="blog-eyebrow__line" />
                Blog
              </p>
              <h1 className="blog-headline">
                Pensamentos,<br />
                <em>bastidores</em> &amp; visão.
              </h1>
              <p className="blog-subheadline">
                Produção audiovisual, criatividade e tudo que acontece antes das câmeras ligarem.
              </p>
            </div>
          </div>

          {/* Decoração de fundo */}
          <div className="blog-header__deco" aria-hidden="true">BLOG</div>
        </header>

        {/* ── Post em destaque ── */}
        {featured && (
          <section className="blog-featured">
            <PostCard post={featured} index={0} featured />
          </section>
        )}

        {/* ── Grid de posts ── */}
        {rest.length > 0 && (
          <section className="blog-grid-section">
            <div className="blog-grid">
              {rest.map((post, i) => (
                <PostCard key={post.id} post={post} index={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* ── Estado vazio ── */}
        {posts.length === 0 && (
          <div className="blog-empty">
            <p className="blog-empty__text">Nenhum post publicado ainda.</p>
          </div>
        )}
      </div>

      <style>{`
        /* ── Reset & base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .blog-root {
          --bg: #0b0d0f;
          --bg2: #111416;
          --accent: #d0ff00;
          --text: #f0f0f0;
          --muted: rgba(240,240,240,0.38);
          --border: rgba(240,240,240,0.07);
          --ease: cubic-bezier(0.16,1,0.3,1);
          --font-title: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', -apple-system, sans-serif;

          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          min-height: 100vh;
        }

        a { text-decoration: none; color: inherit; }

        /* ── Header ── */
        .blog-header {
          position: relative;
          overflow: hidden;
          padding: 6rem 4rem 5rem;
          border-bottom: 1px solid var(--border);
        }
        .blog-header__inner { position: relative; z-index: 2; }
        .blog-back {
          display: inline-flex; align-items: center; gap: .5rem;
          font-size: .72rem; text-transform: uppercase; letter-spacing: .18em;
          color: var(--muted);
          transition: color .3s;
          margin-bottom: 4rem;
        }
        .blog-back svg { width: 14px; height: 14px; }
        .blog-back:hover { color: var(--accent); }

        .blog-eyebrow {
          display: flex; align-items: center; gap: 1rem;
          font-size: .7rem; text-transform: uppercase; letter-spacing: .2em;
          color: var(--accent); margin-bottom: 1.5rem;
        }
        .blog-eyebrow__line { display: block; width: 32px; height: 1px; background: var(--accent); }

        .blog-headline {
          font-family: var(--font-title);
          font-size: clamp(3rem, 7vw, 7rem);
          font-weight: 700;
          line-height: .95;
          letter-spacing: -0.04em;
          margin-bottom: 1.5rem;
        }
        .blog-headline em { font-style: normal; color: var(--accent); }

        .blog-subheadline {
          font-size: 1rem; line-height: 1.65;
          color: var(--muted); max-width: 480px;
        }

        .blog-header__deco {
          position: absolute; top: 50%; right: -2rem;
          transform: translateY(-50%);
          font-family: var(--font-title);
          font-size: clamp(10rem, 20vw, 20rem);
          font-weight: 700; letter-spacing: -0.06em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(240,240,240,.03);
          pointer-events: none; user-select: none;
          white-space: nowrap;
        }

        /* ── Featured post ── */
        .blog-featured {
          padding: 4rem 4rem 0;
        }
        .blog-featured .post-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          background: var(--bg2);
          transition: border-color .4s;
        }
        .blog-featured .post-card:hover { border-color: rgba(208,255,0,.25); }
        .blog-featured .post-card__thumb {
          height: 480px;
        }
        .blog-featured .post-card__body {
          padding: 3.5rem;
          display: flex; flex-direction: column; justify-content: center;
        }
        .blog-featured .post-card__titulo {
          font-size: clamp(1.8rem, 3vw, 3rem);
          margin-bottom: 1.2rem;
        }
        .blog-featured .post-card__resumo {
          -webkit-line-clamp: 4;
        }
        .blog-featured .post-card__tag {
          top: 1.2rem; left: 1.2rem;
        }

        /* ── Grid ── */
        .blog-grid-section { padding: 3rem 4rem 6rem; }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        /* ── Post card (base) ── */
        .post-card {
          display: flex; flex-direction: column;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          transition: border-color .4s var(--ease), transform .4s var(--ease);
          cursor: pointer;
        }
        .post-card:hover { border-color: rgba(208,255,0,.25); transform: translateY(-4px); }

        .post-card__thumb {
          position: relative;
          height: 240px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .post-card__thumb img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .8s var(--ease);
        }
        .post-card:hover .post-card__thumb img { transform: scale(1.05); }
        .post-card__thumb-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #1a1e22, #111416);
        }
        .post-card__thumb-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%);
        }
        .post-card__tag {
          position: absolute; top: 1rem; left: 1rem;
          font-size: .65rem; text-transform: uppercase; letter-spacing: .15em;
          background: var(--accent); color: #000; font-weight: 700;
          padding: .3rem .8rem; border-radius: 100px;
          font-family: var(--font-title);
        }

        .post-card__body {
          padding: 2rem 2rem 2.5rem;
          display: flex; flex-direction: column; gap: .75rem;
          flex: 1;
        }
        .post-card__date {
          font-size: .68rem; text-transform: uppercase; letter-spacing: .15em;
          color: var(--muted);
        }
        .post-card__titulo {
          font-family: var(--font-title);
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          transition: color .3s;
        }
        .post-card:hover .post-card__titulo { color: var(--accent); }
        .post-card__resumo {
          font-size: .9rem;
          line-height: 1.7;
          color: var(--muted);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .post-card__cta {
          display: inline-flex; align-items: center; gap: .5rem;
          font-size: .72rem; text-transform: uppercase; letter-spacing: .15em;
          color: var(--accent);
          font-family: var(--font-title); font-weight: 700;
          margin-top: .5rem;
          transition: gap .3s;
        }
        .post-card__cta svg { width: 14px; height: 14px; }
        .post-card:hover .post-card__cta { gap: .8rem; }

        /* ── Empty ── */
        .blog-empty {
          display: flex; align-items: center; justify-content: center;
          min-height: 40vh;
        }
        .blog-empty__text { color: var(--muted); font-size: 1rem; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .blog-header { padding: 4rem 1.8rem 3.5rem; }
          .blog-featured { padding: 2rem 1.8rem 0; }
          .blog-featured .post-card { grid-template-columns: 1fr; }
          .blog-featured .post-card__thumb { height: 260px; }
          .blog-featured .post-card__body { padding: 2rem 1.8rem; }
          .blog-grid-section { padding: 2rem 1.8rem 4rem; }
          .blog-grid { grid-template-columns: 1fr; }
          .blog-header__deco { display: none; }
        }
      `}</style>
    </>
  );
}
