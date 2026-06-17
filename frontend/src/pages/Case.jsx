import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Dados mockados (substituir por fetch via lib/api.js depois) ──────────────
const MOCK_CASES = {
  '1': {
    id: '1',
    nome: 'Showreel 2024',
    descricao: 'Motion Design · São Paulo',
    resumo: 'Este projeto representa o melhor da produção audiovisual de alto impacto — cada quadro cuidadosamente planejado para criar experiências visuais que ficam na memória do espectador.',
    categoria: { nome: 'Showreel' },
    link_projeto: 'https://vimeo.com/1176338391',
    imagem: 'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=1920',
    depoimento: 'Cada projeto é uma oportunidade de contar uma história que ressoa — visualmente, emocionalmente, para sempre.',
    ficha_tecnica: 'Produção realizada com equipamentos de última geração, equipe especializada e processos criativos que garantem o mais alto padrão de qualidade audiovisual.',
    diretor: 'João Silva',
    dop: 'Maria Costa',
    whatsapp_projeto: '11999999999',
    estoque: '2024',
  },
  '2': {
    id: '2',
    nome: 'Motion Reel',
    descricao: 'Brand Film · Rio de Janeiro',
    resumo: 'Uma exploração visual do movimento e da forma, traduzindo a identidade de uma marca em linguagem cinematográfica de alta qualidade.',
    categoria: { nome: 'Motion Design' },
    link_projeto: null,
    imagem: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1920',
    depoimento: 'Transformamos conceitos abstratos em imagens que comunicam sem palavras.',
    ficha_tecnica: 'Pós-produção completa com colorização avançada e composição de VFX.',
    diretor: 'Ana Lima',
    dop: null,
    whatsapp_projeto: '11999999999',
    estoque: '2023',
  },
};

const PROXIMOS = {
  '1': { id: '2', nome: 'Motion Reel', descricao: 'Brand Film', estoque: '2023', imagem: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1920' },
  '2': { id: '1', nome: 'Showreel 2024', descricao: 'Motion Design', estoque: '2024', imagem: 'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=1920' },
};

const NOME_PRODUTORA = 'Creapes';

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildVimeoEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('player.vimeo.com')) return url;
  const clean = url.split('?')[0].replace(/\/$/, '');
  const parts = clean.split('/');
  if (parts.length >= 5) return `https://player.vimeo.com/video/${parts[3]}?h=${parts[4]}`;
  if (parts.length === 4) return `https://player.vimeo.com/video/${parts[3]}`;
  return null;
}

function buildVimeoPlayerUrl(url) {
  if (!url) return null;
  let final = buildVimeoEmbedUrl(url) || url;
  if (!final.includes('autoplay')) final += (final.includes('?') ? '&' : '?') + 'autoplay=1';
  return final;
}

export default function Case() {
  const { id } = useParams();
  const navigate = useNavigate();
  const prod = MOCK_CASES[id] || MOCK_CASES['1'];
  const proximo = PROXIMOS[id];

  const [videoModal, setVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [nextBgVisible, setNextBgVisible] = useState(false);

  // Cursor personalizado
  const cursorBallRef = useRef(null);
  const cursorRingRef = useRef(null);
  const mx = useRef(window.innerWidth / 2);
  const my = useRef(window.innerHeight / 2);
  const rx = useRef(mx.current);
  const ry = useRef(my.current);
  const rafCursor = useRef(null);

  // BTS drag scroll
  const btsRef = useRef(null);
  const btsDown = useRef(false);
  const btsStartX = useRef(0);
  const btsSLeft = useRef(0);

  const heroMediaRef = useRef(null);
  const heroContentRef = useRef(null);

  const embedUrl = buildVimeoEmbedUrl(prod.link_projeto);

  function openVideo(url) {
    const final = buildVimeoPlayerUrl(url);
    if (!final) return;
    setVideoUrl(final);
    setVideoModal(true);
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    setVideoModal(false);
    setVideoUrl('');
    document.body.style.overflow = '';
  }

  // ── Cursor ───────────────────────────────────────────────────────────────
  useEffect(() => {
    function onMouseMove(e) { mx.current = e.clientX; my.current = e.clientY; }
    document.addEventListener('mousemove', onMouseMove);

    function animCursor() {
      rx.current += (mx.current - rx.current) * 0.12;
      ry.current += (my.current - ry.current) * 0.12;
      if (cursorBallRef.current)
        cursorBallRef.current.style.transform = `translate(${mx.current}px,${my.current}px) translate(-50%,-50%)`;
      if (cursorRingRef.current)
        cursorRingRef.current.style.transform = `translate(${rx.current}px,${ry.current}px) translate(-50%,-50%)`;
      rafCursor.current = requestAnimationFrame(animCursor);
    }
    rafCursor.current = requestAnimationFrame(animCursor);

    const hoverEls = document.querySelectorAll('a,button,[data-clickable]');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (rafCursor.current) cancelAnimationFrame(rafCursor.current);
    };
  }, []);

  // ── GSAP page entry + scroll ──────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.add('loading');

    const tl = gsap.timeline({
      onComplete: () => document.body.classList.remove('loading'),
    });
    tl.to('#heroTitleInner',  { y: '0%',  duration: 1.1, ease: 'expo.out' })
      .to('#heroTag',         { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=.7')
      .to('#heroCategory',    { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=.55')
      .to('#heroPlay',        { opacity: 1, duration: 0.5 }, '-=.5')
      .to('#heroScrollHint',  { opacity: 1, duration: 0.5 }, '-=.3')
      .to('#navBack',         { opacity: 1, x: 0, duration: 0.5 }, '-=.4')
      .to('#navBrand',        { opacity: 1, y: 0, duration: 0.5 }, '-=.4')
      .to('#navCta',          { opacity: 1, x: 0, duration: 0.5 }, '-=.4');

    // Scroll fade-ins
    document.querySelectorAll('.case-fade-in').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
      );
    });

    // Counter items
    ['c1','c2','c3','c4'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) gsap.to(el, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // Dividers
    ['div1','div2','div3'].forEach(did => {
      const el = document.getElementById(did);
      if (el) gsap.to(el, { scaleX: 1, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // Table rows
    gsap.utils.toArray('.detail-row').forEach((row, i) => {
      gsap.to(row, { opacity: 1, x: 0, duration: 0.5, delay: i * 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 90%' } });
    });

    // Parallax hero
    if (heroMediaRef.current) {
      gsap.to(heroMediaRef.current, { yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    if (heroContentRef.current) {
      gsap.to(heroContentRef.current, { yPercent: 30, ease: 'none',
        scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [id]);

  // ── ESC fecha modal ───────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') closeVideo(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ── BTS drag scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const bts = btsRef.current;
    if (!bts) return;
    const onDown  = e => { btsDown.current = true; btsStartX.current = e.pageX - bts.offsetLeft; btsSLeft.current = bts.scrollLeft; };
    const onLeave = () => { btsDown.current = false; };
    const onUp    = () => { btsDown.current = false; };
    const onMove  = e => { if (!btsDown.current) return; e.preventDefault(); const x = e.pageX - bts.offsetLeft; bts.scrollLeft = btsSLeft.current - (x - btsStartX.current) * 1.4; };
    bts.addEventListener('mousedown',  onDown);
    bts.addEventListener('mouseleave', onLeave);
    bts.addEventListener('mouseup',    onUp);
    bts.addEventListener('mousemove',  onMove);
    return () => {
      bts.removeEventListener('mousedown',  onDown);
      bts.removeEventListener('mouseleave', onLeave);
      bts.removeEventListener('mouseup',    onUp);
      bts.removeEventListener('mousemove',  onMove);
    };
  }, []);

  const marqueeItems = [
    prod.nome, NOME_PRODUTORA, prod.descricao || 'Audiovisual', prod.estoque || '2024',
    'Elite Audiovisual', 'Produção de Vídeo',
    prod.nome, NOME_PRODUTORA, prod.descricao || 'Audiovisual', prod.estoque || '2024',
    'Elite Audiovisual', 'Produção de Vídeo',
  ];

  const detailRows = [
    { label: 'Projeto',       value: prod.nome },
    prod.estoque   && { label: 'Ano',           value: prod.estoque },
    prod.descricao && { label: 'Estilo / Local', value: prod.descricao },
    prod.categoria && { label: 'Seção',          value: prod.categoria.nome },
                       { label: 'Produtora',     value: NOME_PRODUTORA },
    prod.diretor   && { label: 'Direção',         value: prod.diretor },
    prod.dop       && { label: 'Dir. Fotografia', value: prod.dop },
    prod.link_projeto && {
      label: 'Assistir',
      value: null,
      link: prod.link_projeto,
    },
  ].filter(Boolean);

  return (
    <>
      {/* ── Custom cursor ── */}
      <div id="cursor" style={{ position:'fixed', pointerEvents:'none', zIndex:999999, mixBlendMode:'difference', top:0, left:0 }}>
        <div ref={cursorBallRef} className="cursor-ball" />
      </div>
      <div ref={cursorRingRef} className="cursor-ring" />

      {/* ── Nav ── */}
      <nav className="case-nav">
        <a href="/" className="nav-back" id="navBack" onClick={e => { e.preventDefault(); navigate('/'); }}>
          <svg viewBox="0 0 24 24"><polyline points="19 12 5 12"/><polyline points="12 5 5 12 12 19"/></svg>
          Voltar
        </a>
        <div className="nav-brand" id="navBrand">{NOME_PRODUTORA}</div>
        {prod.whatsapp_projeto && (
          <a
            href={`https://wa.me/55${prod.whatsapp_projeto.replace(/\D/g, '')}`}
            target="_blank" rel="noreferrer"
            className="nav-cta" id="navCta"
          >Fale Conosco</a>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="case-hero">
        <div className="hero-media" id="heroMedia" ref={heroMediaRef}>
          {embedUrl ? (
            <iframe
              src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}background=1&autoplay=1&loop=1&muted=1&quality=1080p`}
              frameBorder="0" allow="autoplay; fullscreen" allowFullScreen
            />
          ) : prod.imagem ? (
            <img src={prod.imagem} alt={prod.nome} />
          ) : (
            <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%)' }} />
          )}
        </div>
        <div className="hero-overlay" />
        <div className="hero-grain" />

        {prod.link_projeto && (
          <button className="hero-play" id="heroPlay" onClick={() => openVideo(prod.link_projeto)} data-clickable>
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        )}

        <div className="hero-content" ref={heroContentRef}>
          <div className="hero-meta">
            <span className="hero-tag" id="heroTag">{prod.categoria?.nome || 'Projeto'}</span>
            <span className="hero-category" id="heroCategory">{prod.descricao || 'Audiovisual'}</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-inner" id="heroTitleInner">{prod.nome}</span>
          </h1>
        </div>

        <div className="hero-scroll-hint" id="heroScrollHint">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Counter bar ── */}
      <div className="counter-bar">
        {[
          { label: 'Ano',       value: prod.estoque || '—', accent: false },
          { label: 'Categoria', value: prod.categoria?.nome || 'Portfolio', small: true },
          { label: 'Estilo / Local', value: prod.descricao || '—', small: true },
          { label: 'Produtora', value: NOME_PRODUTORA, small: true, accent: true },
        ].map((item, i) => (
          <div className="counter-item" id={`c${i+1}`} key={i}>
            <div className="counter-label">{item.label}</div>
            <div className="counter-value" style={{ fontSize: item.small ? 'clamp(1rem,2vw,1.8rem)' : undefined, paddingTop: item.small ? '.6rem' : undefined, color: item.accent ? 'var(--accent)' : undefined }}>
              {item.value}{!item.small && <span className="accent">.</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Brief ── */}
      <section className="section">
        <div className="section-label case-fade-in">Case</div>
        <div className="brief-section">
          <div>
            <h2 className="brief-headline case-fade-in">
              Um projeto que<br /><em>fala por si</em><br />mesmo.
            </h2>
          </div>
          <div className="brief-right case-fade-in">
            <p className="brief-body">{prod.resumo}</p>
            <div className="brief-chips">
              {prod.descricao && <span className="chip">{prod.descricao}</span>}
              {prod.estoque   && <span className="chip">{prod.estoque}</span>}
              {prod.categoria && <span className="chip">{prod.categoria.nome}</span>}
              <span className="chip">Audiovisual</span>
              <span className="chip">{NOME_PRODUTORA}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" id="div1" />

      {/* ── Full video ── */}
      {prod.link_projeto && (
        <section className="full-video-section">
          <div
            className="full-video-wrapper case-fade-in"
            onClick={() => openVideo(prod.link_projeto)}
            id="fullVideoWrapper"
            data-clickable
          >
            {prod.imagem
              ? <img src={prod.imagem} alt={prod.nome} style={{ position:'absolute',inset:0,zIndex:0 }} />
              : <div style={{ position:'absolute',inset:0,background:'#111',zIndex:0 }} />
            }
            <div className="full-video-overlay" style={{ position:'absolute',inset:0,zIndex:1,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <div className="full-video-play">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Marquee ── */}
      <div className="marquee-section">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className={`marquee-item${i % 2 === 1 ? ' filled' : ''}`}>
              {item} <span className="dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Quote ── */}
      <section className="quote-section section">
        <div className="quote-bg">{NOME_PRODUTORA.slice(0,2).toUpperCase()}</div>
        <div className="quote-mark case-fade-in">"</div>
        <blockquote className="quote-text case-fade-in">{prod.depoimento}</blockquote>
        <cite className="quote-author case-fade-in">— {NOME_PRODUTORA}, Produtora Audiovisual</cite>
      </section>

      <div className="divider" id="div3" />

      {/* ── Ficha técnica ── */}
      <section className="section">
        <div className="details-section">
          <div className="details-left">
            <div className="section-label case-fade-in">Ficha Técnica</div>
            <h2 className="details-title case-fade-in">Detalhes<br />do Projeto</h2>
            <p className="details-desc case-fade-in">{prod.ficha_tecnica}</p>
          </div>
          <div className="details-right">
            <table className="details-table">
              <tbody>
                {detailRows.map((row, i) => (
                  <tr className="detail-row" key={i}>
                    <td>{row.label}</td>
                    <td>
                      {row.link
                        ? <a href={row.link} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', textDecoration:'underline', textUnderlineOffset:'3px' }}>Ver no Vimeo ↗</a>
                        : row.value
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <p className="cta-eyebrow case-fade-in">Vamos criar juntos</p>
        <h2 className="cta-headline case-fade-in">Seu próximo<br />projeto aqui.</h2>
        <div className="cta-btns case-fade-in">
          {prod.whatsapp_projeto && (
            <a href={`https://wa.me/55${prod.whatsapp_projeto.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-primary">
              <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Falar no WhatsApp
            </a>
          )}
          <Link to="/" className="btn-secondary">
            <svg viewBox="0 0 24 24"><polyline points="19 12 5 12"/><polyline points="12 5 5 12 12 19"/></svg>
            Ver Portfólio Completo
          </Link>
        </div>
      </section>

      {/* ── Próximo case ── */}
      {proximo && (
        <div className="next-section">
          <Link
            to={`/case/${proximo.id}`}
            className="next-inner"
            onMouseEnter={() => setNextBgVisible(true)}
            onMouseLeave={() => setNextBgVisible(false)}
          >
            <div>
              <p className="next-label">Próximo Projeto</p>
              <h3 className="next-title">{proximo.nome}</h3>
              {proximo.descricao && (
                <p style={{ fontSize:'.8rem', color:'var(--muted)', marginTop:'.5rem', letterSpacing:'.05em' }}>
                  {proximo.descricao}{proximo.estoque && ` · ${proximo.estoque}`}
                </p>
              )}
            </div>
            <div className="next-arrow">
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </Link>
          {proximo.imagem && (
            <div className="next-bg" style={{ backgroundImage:`url('${proximo.imagem}')`, opacity: nextBgVisible ? 1 : 0 }} />
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="case-footer">
        <span className="footer-copy">© {prod.estoque || '2024'} {NOME_PRODUTORA}. Todos os direitos reservados.</span>
        <a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }); }} className="footer-back-top">
          <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          Voltar ao topo
        </a>
      </footer>

      {/* ── Video Modal ── */}
      {videoModal && (
        <div
          id="videoModal"
          style={{ position:'fixed', inset:0, background:'#000', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', opacity: videoModal ? 1 : 0, pointerEvents: videoModal ? 'all' : 'none', transition:'opacity .5s var(--ease)' }}
          onClick={e => { if (e.target === e.currentTarget) closeVideo(); }}
        >
          <button className="modal-close" onClick={closeVideo}>✕</button>
          <div className="modal-iframe-wrap">
            <iframe src={videoUrl} allow="autoplay; fullscreen" allowFullScreen title="Vídeo do projeto" />
          </div>
        </div>
      )}

      <style>{`
        /* ── Cursor ── */
        .cursor-ball {
          width: 12px; height: 12px; background: var(--accent);
          border-radius: 50%; transform: translate(-50%,-50%);
          transition: width .25s var(--ease), height .25s var(--ease), opacity .2s;
          will-change: transform; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 999999; mix-blend-mode: difference;
        }
        .cursor-ring {
          position: fixed; top: 0; left: 0; pointer-events: none; z-index: 999998;
          width: 44px; height: 44px;
          border: 1px solid rgba(208,255,0,0.5); border-radius: 50%;
          transform: translate(-50%,-50%);
          transition: width .4s var(--ease), height .4s var(--ease), border-color .3s, opacity .2s;
          will-change: transform;
        }
        body.cursor-hover .cursor-ball { width: 6px; height: 6px; opacity: .6; }
        body.cursor-hover .cursor-ring  { width: 70px; height: 70px; border-color: var(--accent); }

        /* ── Nav ── */
        .case-nav {
          position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.4rem 4rem;
        }
        .nav-back {
          display: flex; align-items: center; gap: .8rem;
          font-size: .75rem; font-weight: 500; text-transform: uppercase; letter-spacing: .15em;
          color: #fff; opacity: 0; transform: translateX(-20px);
          transition: opacity .4s, transform .4s, color .3s;
        }
        .nav-back svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 1.5; }
        .nav-back:hover { color: var(--accent); }
        .nav-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; color: #fff;
          opacity: 0; transform: translateY(-10px);
          transition: opacity .4s .1s, transform .4s .1s;
        }
        .nav-cta {
          font-size: .75rem; font-weight: 500; text-transform: uppercase; letter-spacing: .12em;
          color: #fff; opacity: 0; transform: translateX(20px);
          border: 1px solid rgba(255,255,255,.3); padding: .55rem 1.4rem; border-radius: 100px;
          transition: opacity .4s .2s, transform .4s .2s, border-color .3s, background .3s;
        }
        .nav-cta:hover { border-color: #fff; background: rgba(255,255,255,.05); }

        /* ── Hero ── */
        .case-hero {
          position: relative; height: 100vh; overflow: hidden;
          display: flex; align-items: flex-end;
        }
        .hero-media { position: absolute; inset: 0; z-index: 0; }
        .hero-media img, .hero-media iframe, .hero-media video {
          width: 100%; height: 100%; object-fit: cover;
        }
        .hero-media iframe { pointer-events: none; transform: scale(1.08); }
        .hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.45) 40%, rgba(0,0,0,.15) 70%, transparent 100%);
        }
        .hero-grain {
          position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 256px;
          animation: grainShift 0.5s steps(1) infinite;
        }
        @keyframes grainShift {
          0%  { background-position:  0%   0%; } 20% { background-position: 60%  40%; }
          40% { background-position: 30%  80%; } 60% { background-position: 80%  20%; }
          80% { background-position: 10%  60%; } 100%{ background-position:  0%   0%; }
        }
        .hero-content {
          position: relative; z-index: 3;
          padding: 0 4rem 4rem; width: 100%;
          display: flex; align-items: flex-end; justify-content: space-between; gap: 4rem;
        }
        .hero-meta { display: flex; flex-direction: column; gap: .5rem; flex-shrink: 0; padding-bottom: .4rem; }
        .hero-tag {
          font-size: .7rem; font-weight: 500; text-transform: uppercase; letter-spacing: .2em;
          color: var(--accent); opacity: 0; transform: translateY(20px);
        }
        .hero-category {
          font-size: .75rem; letter-spacing: .12em; text-transform: uppercase;
          color: rgba(240,240,240,0.38); opacity: 0; transform: translateY(20px);
        }
        .hero-title {
          font-size: clamp(3.5rem, 8vw, 9rem);
          line-height: .92; letter-spacing: -0.04em; color: #fff; flex: 1; overflow: hidden;
        }
        .hero-title-inner { display: block; transform: translateY(120%); will-change: transform; }
        .hero-scroll-hint {
          position: absolute; bottom: 1.8rem; left: 50%; transform: translateX(-50%);
          z-index: 3; display: flex; flex-direction: column; align-items: center; gap: .5rem; opacity: 0;
        }
        .hero-scroll-hint span { font-size: .65rem; text-transform: uppercase; letter-spacing: .2em; color: rgba(240,240,240,0.38); }
        .scroll-line {
          width: 1px; height: 40px; background: rgba(240,240,240,0.38);
          transform-origin: top; animation: scrollLine 1.6s var(--ease) infinite;
        }
        @keyframes scrollLine {
          0%   { transform: scaleY(0); transform-origin: top;    opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top;    opacity: 1; }
          51%  { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
        .hero-play {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          z-index: 4; width: 100px; height: 100px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,.25); border-radius: 50%;
          backdrop-filter: blur(8px); background: rgba(0,0,0,.25);
          opacity: 0; transition: border-color .3s, background .3s, transform .4s var(--ease);
          cursor: pointer;
        }
        .hero-play svg { width: 32px; height: 32px; fill: #fff; transition: fill .3s; margin-left: 4px; }
        .hero-play:hover { border-color: var(--accent); background: rgba(208,255,0,.1); transform: translate(-50%,-50%) scale(1.1); }
        .hero-play:hover svg { fill: var(--accent); }

        /* ── Counter bar ── */
        .counter-bar { border-top: 1px solid rgba(240,240,240,0.07); border-bottom: 1px solid rgba(240,240,240,0.07); display: flex; }
        .counter-item { flex: 1; padding: 2.5rem 4rem; border-right: 1px solid rgba(240,240,240,0.07); opacity: 0; transform: translateY(30px); }
        .counter-item:last-child { border-right: none; }
        .counter-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .18em; color: rgba(240,240,240,0.38); margin-bottom: .6rem; }
        .counter-value { font-family: 'Space Grotesk', sans-serif; font-size: clamp(2rem,4vw,3.5rem); font-weight: 700; letter-spacing: -0.04em; color: var(--text); line-height: 1; }
        .counter-value .accent { color: var(--accent); }

        /* ── Sections ── */
        .section { padding: 8rem 4rem; position: relative; background: var(--bg); }
        .section-label {
          font-size: .7rem; text-transform: uppercase; letter-spacing: .2em;
          color: var(--accent); margin-bottom: 1.2rem;
          display: flex; align-items: center; gap: 1rem;
        }
        .section-label::before { content: ''; display: block; width: 32px; height: 1px; background: var(--accent); }
        .brief-section { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start; }
        .brief-headline { font-size: clamp(2.2rem,3.5vw,4rem); line-height: 1.05; color: var(--text); }
        .brief-headline em { font-style: normal; color: var(--accent); }
        .brief-right { padding-top: 1rem; }
        .brief-body { font-size: 1.05rem; line-height: 1.75; color: rgba(240,240,240,0.38); margin-bottom: 2.5rem; }
        .brief-chips { display: flex; flex-wrap: wrap; gap: .6rem; }
        .chip { font-size: .72rem; text-transform: uppercase; letter-spacing: .12em; border: 1px solid rgba(240,240,240,0.07); padding: .45rem 1rem; border-radius: 100px; color: rgba(240,240,240,0.38); transition: border-color .3s, color .3s; }
        .chip:hover { border-color: var(--accent); color: var(--accent); }
        .divider { height: 1px; background: rgba(240,240,240,0.07); margin: 0 4rem; transform: scaleX(0); transform-origin: left; }

        /* ── Full video ── */
        .full-video-section { padding: 0; position: relative; background: var(--bg); }
        .full-video-wrapper { position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; cursor: pointer; }
        .full-video-wrapper iframe, .full-video-wrapper video { width: 100%; height: 100%; border: none; }
        .full-video-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .full-video-overlay { background: rgba(0,0,0,.4); transition: background .4s; }
        .full-video-wrapper:hover .full-video-overlay { background: rgba(0,0,0,.15); }
        .full-video-play {
          width: 120px; height: 120px;
          border: 1px solid rgba(255,255,255,.3); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all .4s var(--ease); backdrop-filter: blur(12px); background: rgba(0,0,0,.3);
        }
        .full-video-play svg { width: 40px; height: 40px; fill: #fff; margin-left: 6px; transition: fill .3s; }
        .full-video-wrapper:hover .full-video-play { border-color: var(--accent); background: rgba(208,255,0,.1); transform: scale(1.08); }
        .full-video-wrapper:hover .full-video-play svg { fill: var(--accent); }

        /* ── Marquee ── */
        .marquee-section { padding: 3rem 0; overflow: hidden; border-top: 1px solid rgba(240,240,240,0.07); border-bottom: 1px solid rgba(240,240,240,0.07); background: var(--bg); }
        .marquee-track { display: flex; gap: 0; white-space: nowrap; animation: marqueeScroll 18s linear infinite; }
        .marquee-item { display: inline-flex; align-items: center; gap: 2.5rem; padding: 0 3rem; font-family: 'Space Grotesk',sans-serif; font-size: clamp(1.8rem,3vw,2.8rem); font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: transparent; -webkit-text-stroke: 1px rgba(240,240,240,.18); }
        .marquee-item .dot { color: var(--accent); -webkit-text-stroke: 0; font-size: 1.2rem; }
        .marquee-item.filled { color: var(--text); -webkit-text-stroke: 0; opacity: .7; }
        @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* ── Quote ── */
        .quote-section { padding: 10rem 4rem; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden; }
        .quote-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 30vw; font-family: 'Space Grotesk',sans-serif; font-weight: 700; color: transparent; -webkit-text-stroke: 1px rgba(240,240,240,.03); white-space: nowrap; pointer-events: none; user-select: none; letter-spacing: -0.05em; }
        .quote-mark { font-family: 'Space Grotesk',sans-serif; font-size: 6rem; color: var(--accent); line-height: .5; margin-bottom: 2rem; opacity: .5; }
        .quote-text { font-family: 'Space Grotesk',sans-serif; font-size: clamp(1.6rem,3.5vw,3rem); line-height: 1.2; letter-spacing: -0.02em; max-width: 900px; margin-bottom: 2.5rem; }
        .quote-author { font-size: .8rem; text-transform: uppercase; letter-spacing: .2em; color: rgba(240,240,240,0.38); }

        /* ── Details ── */
        .details-section { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start; }
        .details-title { font-size: clamp(2rem,3vw,3.5rem); margin-bottom: 2rem; }
        .details-desc { font-size: 1rem; line-height: 1.8; color: rgba(240,240,240,0.38); }
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table tr { border-bottom: 1px solid rgba(240,240,240,0.07); opacity: 0; transform: translateX(20px); }
        .detail-row td { padding: 1.2rem 0; vertical-align: top; }
        .detail-row td:first-child { font-size: .7rem; text-transform: uppercase; letter-spacing: .15em; color: rgba(240,240,240,0.38); width: 40%; padding-right: 2rem; padding-top: 1.4rem; }
        .detail-row td:last-child { font-size: 1rem; font-weight: 500; }

        /* ── CTA ── */
        .cta-section { padding: 10rem 4rem; display: flex; flex-direction: column; align-items: center; text-align: center; background: linear-gradient(to bottom, var(--bg), rgba(208,255,0,.04), var(--bg)); position: relative; overflow: hidden; }
        .cta-glow { position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(208,255,0,.18) 0%, transparent 70%); pointer-events: none; }
        .cta-eyebrow { font-size: .72rem; text-transform: uppercase; letter-spacing: .25em; color: var(--accent); margin-bottom: 1.5rem; }
        .cta-headline { font-size: clamp(3rem,7vw,8rem); line-height: .92; letter-spacing: -0.04em; margin-bottom: 3rem; }
        .cta-btns { display: flex; gap: 1.2rem; flex-wrap: wrap; justify-content: center; }
        .btn-primary { display: inline-flex; align-items: center; gap: .8rem; background: var(--accent); color: #000; font-family: 'Space Grotesk',sans-serif; font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; padding: 1.1rem 2.5rem; border-radius: 100px; transition: transform .3s var(--ease), box-shadow .3s; }
        .btn-primary:hover { transform: scale(1.04); box-shadow: 0 10px 40px rgba(208,255,0,.3); color: #000; }
        .btn-primary svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; }
        .btn-secondary { display: inline-flex; align-items: center; gap: .8rem; border: 1px solid rgba(240,240,240,0.07); color: var(--text); font-family: 'Space Grotesk',sans-serif; font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; padding: 1.1rem 2.5rem; border-radius: 100px; transition: border-color .3s, background .3s; }
        .btn-secondary:hover { border-color: rgba(240,240,240,.3); background: rgba(255,255,255,.04); color: var(--text); }
        .btn-secondary svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; }

        /* ── Next project ── */
        .next-section { border-top: 1px solid rgba(240,240,240,0.07); position: relative; overflow: hidden; }
        .next-inner { display: flex; align-items: center; justify-content: space-between; padding: 5rem 4rem; gap: 3rem; position: relative; z-index: 2; transition: background .4s; text-decoration: none; color: var(--text); }
        .next-inner:hover { background: rgba(255,255,255,.025); }
        .next-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .2em; color: rgba(240,240,240,0.38); margin-bottom: .8rem; }
        .next-title { font-size: clamp(1.8rem,3vw,3rem); line-height: 1; transition: color .3s; }
        .next-inner:hover .next-title { color: var(--accent); }
        .next-arrow { width: 60px; height: 60px; border: 1px solid rgba(240,240,240,0.07); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .4s var(--ease); }
        .next-arrow svg { width: 22px; height: 22px; stroke: var(--text); fill: none; stroke-width: 1.5; transition: stroke .3s; }
        .next-inner:hover .next-arrow { border-color: var(--accent); background: var(--accent); transform: rotate(-45deg); }
        .next-inner:hover .next-arrow svg { stroke: #000; }
        .next-bg { position: absolute; inset: 0; z-index: 1; background-size: cover; background-position: center; transition: opacity .5s; filter: grayscale(60%) brightness(.35); }

        /* ── Footer ── */
        .case-footer { border-top: 1px solid rgba(240,240,240,0.07); padding: 2.5rem 4rem; display: flex; align-items: center; justify-content: space-between; background: var(--bg); }
        .footer-copy { font-size: .72rem; color: rgba(240,240,240,0.38); letter-spacing: .08em; }
        .footer-back-top { font-size: .72rem; text-transform: uppercase; letter-spacing: .15em; color: rgba(240,240,240,0.38); display: flex; align-items: center; gap: .6rem; transition: color .3s; text-decoration: none; }
        .footer-back-top svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; }
        .footer-back-top:hover { color: var(--accent); }

        /* ── Modal ── */
        .modal-close { position: absolute; top: 2rem; right: 3rem; background: none; border: none; color: #fff; font-family: 'Space Grotesk',sans-serif; font-size: 1.8rem; cursor: pointer; transition: color .3s; }
        .modal-close:hover { color: var(--accent); }
        .modal-iframe-wrap { width: 92%; max-width: 1600px; aspect-ratio: 16/9; }
        .modal-iframe-wrap iframe { width: 100%; height: 100%; border: none; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .case-nav { padding: 1.2rem 1.8rem; }
          .hero-content { padding: 0 1.8rem 3rem; flex-direction: column; gap: 1.2rem; align-items: flex-start; }
          .hero-title { font-size: clamp(2.8rem,10vw,5rem); }
          .counter-item { padding: 1.8rem 1.8rem; }
          .counter-value { font-size: 2rem; }
          .section { padding: 5rem 1.8rem; }
          .brief-section, .details-section { grid-template-columns: 1fr; gap: 3rem; }
          .next-inner { padding: 3.5rem 1.8rem; }
          .case-footer { padding: 2rem 1.8rem; flex-direction: column; gap: 1.2rem; text-align: center; }
          #cursor, .cursor-ring { display: none; }
          body { cursor: auto; }
        }
      `}</style>
    </>
  );
}
