import { useState, useEffect, useRef } from 'react';
import './Case.css';

function toSlug(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function slugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex(p => p === 'cases' || p === 'case');
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  return parts[parts.length - 1] || '';
}

// Mesmo logo usado na Home (fallback caso /api/config não responda)
const SITE_LOGO_FALLBACK = 'https://res.cloudinary.com/dhu1cqvrb/image/upload/v1781788827/creapeslogo_jajjgt.png';

export default function Case() {
  const [caseData, setCaseData]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [siteLogo, setSiteLogo]   = useState(SITE_LOGO_FALLBACK);
  const cursorBallRef = useRef(null);
  const cursorRingRef = useRef(null);
  const heroRef = useRef(null);
  const [heroInView, setHeroInView] = useState(false);

  // ── Cursor customizado ──────────────────────────────────────────────────────
  useEffect(() => {
    const ball = cursorBallRef.current;
    const ring = cursorRingRef.current;
    if (!ball || !ring) return;

    let rx = 0, ry = 0;
    function onMove(e) {
      ball.style.left = e.clientX + 'px';
      ball.style.top  = e.clientY + 'px';
    }
    function lerp() {
      rx += (parseFloat(ball.style.left || 0) - rx) * 0.12;
      ry += (parseFloat(ball.style.top  || 0) - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(lerp);
    }
    window.addEventListener('mousemove', onMove);
    lerp();

    function onEnter() { document.body.classList.add('cursor-hover'); }
    function onLeave() { document.body.classList.remove('cursor-hover'); }
    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => window.removeEventListener('mousemove', onMove);
  }, [caseData]);

  // ── Fechar modal com Escape ─────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setModalOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Animações de entrada (nav, hero) ────────────────────────────────────────
  useEffect(() => {
    if (!caseData) return;
    requestAnimationFrame(() => {
      // nav
      document.querySelectorAll('.nav-back,.nav-brand,.nav-cta').forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, 100 + i * 80);
      });
      // hero title
      const inner = document.querySelector('.hero-title-inner');
      if (inner) setTimeout(() => { inner.style.transform = 'translateY(0)'; inner.style.transition = 'transform 1s cubic-bezier(0.16,1,0.3,1)'; }, 200);
      // hero meta
      document.querySelectorAll('.hero-tag,.hero-category').forEach((el, i) => {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'opacity .6s, transform .6s'; }, 400 + i * 100);
      });
      // hero play
      const play = document.querySelector('.hero-play');
      if (play) setTimeout(() => { play.style.opacity = '1'; play.style.transition = 'opacity .6s .5s, border-color .3s, background .3s, transform .4s cubic-bezier(0.16,1,0.3,1)'; }, 500);
      // scroll hint
      const hint = document.querySelector('.hero-scroll-hint');
      if (hint) setTimeout(() => { hint.style.opacity = '1'; hint.style.transition = 'opacity .6s'; }, 900);
      // counter items
      document.querySelectorAll('.counter-item').forEach((el, i) => {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'opacity .6s, transform .6s'; }, 600 + i * 100);
      });
      // detail rows
      document.querySelectorAll('.detail-row').forEach((el, i) => {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'opacity .5s, transform .5s'; }, 800 + i * 80);
      });
      // divider
      const div = document.querySelector('.divider');
      if (div) setTimeout(() => { div.style.transform = 'scaleX(1)'; div.style.transition = 'transform .8s cubic-bezier(0.16,1,0.3,1)'; }, 500);
    });
  }, [caseData]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const slug = slugFromPath();
    async function fetchCase() {
      try {
        const res = await fetch('/api/cases');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cases = await res.json();
        const matches = cases.filter(c => toSlug(c.nome) === slug);
        const score = c => (c.descricao ? 2 : 0) + (c.link_projeto || c.link ? 2 : 0) + (c.resumo ? 1 : 0) + (c.imagem ? 1 : 0);
        const found = matches.sort((a, b) => score(b) - score(a))[0] || null;
        if (!found) { setError(true); return; }
        // normaliza campo link
        found.link_projeto = found.link_projeto || found.link || null;
        setCaseData(found);
      } catch (err) {
        console.error('[Case]', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, []);

  // ── Logo do site (mesmo da Home) ────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/config')
      .then(res => (res.ok ? res.json() : null))
      .then(config => {
        const logo = config?.logo_url || config?.logo;
        if (logo) setSiteLogo(logo);
      })
      .catch(() => {});
  }, []);

  // ── Detecta quando o hero entra na viewport, pra só then carregar o vídeo
  //    de fundo nesse momento (evita baixar o player antes da hora) ──────────
  useEffect(() => {
    if (!caseData) return;
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeroInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [caseData]);

  // ── Próximo case ────────────────────────────────────────────────────────────
  const [nextCase, setNextCase] = useState(null);
  useEffect(() => {
    if (!caseData) return;
    fetch('/api/cases')
      .then(r => r.json())
      .then(all => {
        const idx = all.findIndex(c => c.id === caseData.id);
        const next = all[(idx + 1) % all.length];
        if (next && next.id !== caseData.id) setNextCase(next);
      })
      .catch(() => {});
  }, [caseData]);

  // ── Cursor SVG ──────────────────────────────────────────────────────────────
  const cursorEl = (
    <>
      <div id="cursor">
        <div className="cursor-ball" ref={cursorBallRef} style={{ position: 'fixed', top: 0, left: 0 }} />
      </div>
      <div className="cursor-ring" ref={cursorRingRef} style={{ position: 'fixed', top: 0, left: 0 }} />
    </>
  );

  if (loading) return (
    <div className="not-found">
      <p>Carregando…</p>
    </div>
  );

  if (error || !caseData) return (
    <div className="not-found">
      <p>CASE NÃO ENCONTRADO.</p>
    </div>
  );

  const {
    nome, descricao, resumo, categoria_nome,
    imagem, link_projeto, depoimento,
    ficha_tecnica, diretor, dop, ano,
  } = caseData;

  // Ficha técnica
  let fichaTecnicaItems = [];
  if (ficha_tecnica) {
    try {
      const p = JSON.parse(ficha_tecnica);
      fichaTecnicaItems = Array.isArray(p) ? p : [ficha_tecnica];
    } catch {
      fichaTecnicaItems = ficha_tecnica.split('\n').filter(Boolean);
    }
  }

  const hasVideo = Boolean(link_projeto);
  const hasDepo  = Boolean(depoimento);
  const hasFicha = fichaTecnicaItems.length > 0;
  const hasMeta  = diretor || dop || ano || categoria_nome;

  // Embed Vimeo
  let embedUrl = link_projeto || '';
  if (embedUrl.includes('vimeo.com') && !embedUrl.includes('player.vimeo')) {
    const m = embedUrl.match(/vimeo\.com\/(\d+)/);
    const hash = embedUrl.split('/').pop();
    if (m) embedUrl = `https://player.vimeo.com/video/${m[1]}${hash && hash !== m[1] ? '?h=' + hash : ''}?autoplay=1&title=0&byline=0&portrait=0`;
  }

  // ── Vídeo de fundo do hero, igual ao da Home: mesma base do player, mas com
  //    parâmetros de "background" (mudo, em loop, sem controles) ─────────────
  const isVimeoVideo = Boolean(link_projeto && link_projeto.includes('vimeo.com'));
  let playerBaseUrl = '';
  if (isVimeoVideo) {
    if (link_projeto.includes('player.vimeo')) {
      playerBaseUrl = link_projeto.split('?')[0];
    } else {
      const m = link_projeto.match(/vimeo\.com\/(\d+)/);
      const hash = link_projeto.split('/').pop();
      if (m) playerBaseUrl = `https://player.vimeo.com/video/${m[1]}${hash && hash !== m[1] ? '?h=' + hash : ''}`;
    }
  }
  const bgEmbedUrl = playerBaseUrl
    ? `${playerBaseUrl}${playerBaseUrl.includes('?') ? '&' : '?'}background=1&autoplay=1&loop=1&muted=1&autopause=0`
    : '';

  return (
    <>
      {cursorEl}

      {/* ── NAV ── */}
      <nav className="case-nav">
        <a href="/" className="nav-back">
          <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Voltar
        </a>
        <a href="/" className="nav-brand">
          <img src={siteLogo} alt="Creapes" />
        </a>
        <a href="/#contato" className="nav-cta">Fale conosco</a>
      </nav>

      {/* ── HERO ── */}
      <section className="case-hero" ref={heroRef}>
        <div className="hero-media">
          {imagem
            ? <img src={imagem} alt={nome} />
            : <div style={{ background: '#0a0a0a', width: '100%', height: '100%' }} />
          }

          {heroInView && isVimeoVideo && bgEmbedUrl && (
            <iframe
              title={`hero-bg-${nome}`}
              src={bgEmbedUrl}
              style={{ position: 'absolute', top: 0, left: 0 }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}

          {heroInView && !isVimeoVideo && link_projeto && (
            <video
              src={link_projeto}
              autoPlay
              loop
              muted
              playsInline
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          )}
        </div>
        <div className="hero-overlay" />
        <div className="hero-grain" />

        {hasVideo && (
          <button
            className="hero-play"
            onClick={() => setModalOpen(true)}
            aria-label="Reproduzir vídeo"
            onMouseEnter={() => document.body.classList.add('cursor-video')}
            onMouseLeave={() => document.body.classList.remove('cursor-video')}
          >
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        )}

        <div className="hero-content">
          <div style={{ flex: 1 }}>
            <h1 className="hero-title">
              <span className="hero-title-inner">{nome}</span>
            </h1>
          </div>
          <div className="hero-meta">
            {categoria_nome && <span className="hero-tag">{categoria_nome}</span>}
            {ano && <span className="hero-category">{ano}</span>}
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── COUNTER BAR ── */}
      {(diretor || dop || ano || categoria_nome) && (
        <div className="counter-bar">
          {diretor && (
            <div className="counter-item">
              <div className="counter-label">Direção</div>
              <div className="counter-value">{diretor}</div>
            </div>
          )}
          {dop && (
            <div className="counter-item">
              <div className="counter-label">D.O.P.</div>
              <div className="counter-value">{dop}</div>
            </div>
          )}
          {ano && (
            <div className="counter-item">
              <div className="counter-label">Ano</div>
              <div className="counter-value">{ano}</div>
            </div>
          )}
          {categoria_nome && (
            <div className="counter-item">
              <div className="counter-label">Categoria</div>
              <div className="counter-value" style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)' }}>{categoria_nome}</div>
            </div>
          )}
        </div>
      )}

      {/* ── BRIEF ── */}
      {(descricao || resumo) && (
        <section className="section">
          <div className="section-label">Sobre o projeto</div>
          <div className="brief-section">
            {descricao && (
              <h2 className="brief-headline">
                {descricao}
              </h2>
            )}
            {resumo && (
              <div className="brief-right">
                <p className="brief-body">{resumo}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── DIVIDER ── */}
      <div className="divider" />

      {/* ── FULL VIDEO ── */}
      {hasVideo && (
        <section className="full-video-section">
          <div
            className="full-video-wrapper"
            onClick={() => setModalOpen(true)}
            onMouseEnter={() => document.body.classList.add('cursor-video')}
            onMouseLeave={() => document.body.classList.remove('cursor-video')}
          >
            {imagem
              ? <img src={imagem} alt={nome} />
              : <div style={{ background: '#111', width: '100%', height: '100%' }} />
            }
            <div className="full-video-overlay">
              <button className="full-video-play" aria-label="Play">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── MARQUEE ── */}
      {nome && (
        <div className="marquee-section">
          <div className="marquee-track">
            {[...Array(6)].map((_, i) => (
              <span key={i} className={`marquee-item${i % 2 === 0 ? ' filled' : ''}`}>
                {nome} <span className="dot">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── DEPOIMENTO ── */}
      {hasDepo && (
        <section className="section quote-section">
          <div className="quote-bg">"</div>
          <div className="quote-mark">"</div>
          <blockquote className="quote-text">{depoimento}</blockquote>
          {nome && <p className="quote-author">— {nome}</p>}
        </section>
      )}

      {/* ── DETAILS / FICHA TÉCNICA ── */}
      {(resumo || hasFicha) && (
        <section className="section">
          <div className="section-label">Ficha técnica</div>
          <div className="details-section">
            {resumo && (
              <div>
                <h3 className="details-title">O projeto</h3>
                <p className="details-desc">{resumo}</p>
              </div>
            )}
            {hasFicha && (
              <table className="details-table">
                <tbody>
                  {fichaTecnicaItems.map((item, i) => {
                    const [label, ...rest] = item.split(':');
                    const value = rest.join(':').trim();
                    return (
                      <tr key={i} className="detail-row">
                        <td>{value ? label.trim() : `Item ${i + 1}`}</td>
                        <td>{value || label.trim()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <p className="cta-eyebrow">Vamos criar juntos</p>
        <h2 className="cta-headline">Próximo<br />projeto<br /><em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>é o seu</em></h2>
        <div className="cta-btns">
          <a href="/#contato" className="btn-primary">
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6 6l1.27-.51a2 2 0 0 1 2.11.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Fale conosco
          </a>
          <a href="/" className="btn-secondary">
            <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Ver portfólio
          </a>
        </div>
      </section>

      {/* ── NEXT PROJECT ── */}
      {nextCase && (
        <div className="next-section">
          {nextCase.imagem && (
            <div className="next-bg" style={{ backgroundImage: `url(${nextCase.imagem})` }} />
          )}
          <a href={`/case/${toSlug(nextCase.nome)}`} className="next-inner">
            <div>
              <p className="next-label">Próximo projeto</p>
              <p className="next-title">{nextCase.nome}</p>
            </div>
            <div className="next-arrow">
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </a>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="case-footer">
        <span className="footer-copy">© {new Date().getFullYear()} Creapes</span>
        <button className="footer-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          Topo
        </button>
      </footer>

      {/* ── MODAL DE VÍDEO ── */}
      <div className={`video-modal${modalOpen ? ' active' : ''}`}>
        <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
        <div className="modal-iframe-wrap">
          {modalOpen && hasVideo && (
            <iframe
              src={embedUrl}
              title={nome}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </>
  );
}
