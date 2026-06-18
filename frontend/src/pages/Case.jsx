import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCases, getConfig } from '../lib/api';
import './Case.css';

gsap.registerPlugin(ScrollTrigger);

function toSlug(nome) {
  return (nome || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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
  const { slug } = useParams();

  const [prod, setProd]       = useState(null);
  const [proximo, setProximo] = useState(null);
  const [siteLogo, setSiteLogo] = useState('https://res.cloudinary.com/dhu1cqvrb/image/upload/v1781788827/creapeslogo_jajjgt.png');
  const [siteWpp, setSiteWpp]   = useState('');
  const [siteNome, setSiteNome] = useState('Creapes');
  const [loading, setLoading]   = useState(true);
  const [videoModal, setVideoModal] = useState(false);
  const [videoUrl, setVideoUrl]     = useState('');
  const [nextBgVisible, setNextBgVisible] = useState(false);

  const iframeRef    = useRef(null);
  const cursorBallRef = useRef(null);
  const cursorRingRef = useRef(null);
  const mx = useRef(window.innerWidth / 2);
  const my = useRef(window.innerHeight / 2);
  const rx = useRef(mx.current);
  const ry = useRef(my.current);
  const rafRef = useRef(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getCases()
      .then((cases) => {
        const matches = cases.filter((c) => toSlug(c.nome) === slug);
        const score = (c) => (c.descricao ? 2 : 0) + (c.link_projeto || c.link ? 2 : 0) + (c.resumo ? 1 : 0) + (c.imagem ? 1 : 0);
        const found = matches.sort((a, b) => score(b) - score(a))[0] || null;
        if (!found) { setLoading(false); return; }

        setProd({
          ...found,
          link_projeto: found.link_projeto || found.link || null,
          descricao:     found.descricao     || '',
          resumo:        found.resumo        || found.descricao || '',
          depoimento:    found.depoimento    || '',
          ficha_tecnica: found.ficha_tecnica || '',
          diretor:       found.diretor       || null,
          dop:           found.dop           || null,
          estoque:       found.estoque       || found.ano || '',
          categoria_nome: found.categoria_nome || (typeof found.categoria === 'object' ? found.categoria?.nome : found.categoria) || '',
          whatsapp_projeto: found.whatsapp_projeto || '',
        });

        const outros = cases.filter((c) => c.id !== found.id && toSlug(c.nome) !== slug);
        if (outros.length > 0) {
          const prox = outros[0];
          setProximo({
            slug:      toSlug(prox.nome),
            nome:      prox.nome,
            descricao: prox.descricao || '',
            estoque:   prox.estoque || prox.ano || '',
            imagem:    prox.imagem || null,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    getConfig()
      .then((config) => {
        if (!config) return;
        setSiteLogo(config.logo_url || config.logo || '');
        setSiteWpp(config.whatsapp_comercial || '');
        setSiteNome(config.sobre_titulo || 'Creapes');
      })
      .catch(() => {});
  }, [slug]);

  // ── Cursor ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const ball = cursorBallRef.current;
    const ring = cursorRingRef.current;
    if (!ball || !ring) return;

    const onMove = (e) => { mx.current = e.clientX; my.current = e.clientY; };
    document.addEventListener('mousemove', onMove);

    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.12;
      ry.current += (my.current - ry.current) * 0.12;
      ball.style.transform = `translate(${mx.current}px,${my.current}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx.current}px,${ry.current}px) translate(-50%,-50%)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Hover cursor ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!prod) return;
    const els = document.querySelectorAll('a, button, [data-cursor]');
    const add    = () => document.body.classList.add('cursor-hover');
    const remove = () => document.body.classList.remove('cursor-hover');
    els.forEach(el => { el.addEventListener('mouseenter', add); el.addEventListener('mouseleave', remove); });
    return () => els.forEach(el => { el.removeEventListener('mouseenter', add); el.removeEventListener('mouseleave', remove); });
  }, [prod]);

  // ── GSAP entry animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (!prod || loading) return;

    const tl = gsap.timeline();
    tl
      .to('#heroTitleInner', { y: '0%', duration: 1.1, ease: 'expo.out' })
      .to('#heroTag',        { opacity: 1, y: 0, duration: .6, ease: 'expo.out' }, '-=.7')
      .to('#heroCategory',   { opacity: 1, y: 0, duration: .6, ease: 'expo.out' }, '-=.55')
      .to('#heroPlay',       { opacity: 1, duration: .5 }, '-=.5')
      .to('#heroScrollHint', { opacity: 1, duration: .5 }, '-=.3')
      .to('#navBack',        { opacity: 1, x: 0, duration: .5 }, '-=.4')
      .to('#navBrand',       { opacity: 1, y: 0, duration: .5 }, '-=.4')
      .to('#navCta',         { opacity: 1, x: 0, duration: .5 }, '-=.4');

    // Scroll fade-ins
    document.querySelectorAll('.fade-in').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: .9, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
      );
    });

    // Counters
    ['c1','c2','c3','c4'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) gsap.to(el, { opacity: 1, y: 0, duration: .7, delay: i * .1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // Dividers
    ['div1','div2','div3'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      gsap.to(el, { scaleX: 1, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // Table rows
    gsap.utils.toArray('.detail-row').forEach((row, i) => {
      gsap.to(row, { opacity: 1, x: 0, duration: .5, delay: i * .08, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 90%' } });
    });

    // Hero parallax
    gsap.to('#heroMedia', { yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-content', { yPercent: 30, ease: 'none',
      scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: true } });

    ScrollTrigger.refresh();

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [prod, loading]);

  // ── Video modal ──────────────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) return <div className="not-found"><p>Carregando...</p></div>;
  if (!prod)   return <div className="not-found"><p>Case não encontrado.</p></div>;

  const bgVideo = prod.link_projeto ? buildVimeoEmbedUrl(prod.link_projeto) : null;
  const bgVideoSrc = bgVideo
    ? `${bgVideo}${bgVideo.includes('?') ? '&' : '?'}background=1&autoplay=1&loop=1&muted=1&quality=1080p`
    : null;

  return (
    <>
      {/* Cursor */}
      <div id="cursor"><div className="cursor-ball" ref={cursorBallRef}></div></div>
      <div className="cursor-ring" ref={cursorRingRef}></div>

      {/* Nav */}
      <nav className="case-nav">
        <Link to="/" className="nav-back" id="navBack">
          <svg viewBox="0 0 24 24"><polyline points="19 12 5 12"/><polyline points="12 5 5 12 12 19"/></svg>
          Voltar
        </Link>
        <Link to="/" className="nav-brand" id="navBrand">
          {siteLogo
            ? <img src={siteLogo} alt={siteNome} />
            : siteNome}
        </Link>
        {siteWpp
          ? <a href={`https://wa.me/55${siteWpp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="nav-cta" id="navCta">Fale Conosco</a>
          : <Link to="/#contato" className="nav-cta" id="navCta">Fale Conosco</Link>}
      </nav>

      {/* Hero */}
      <section className="case-hero">
        <div className="hero-media" id="heroMedia">
          {bgVideoSrc
            ? <iframe src={bgVideoSrc} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen title="hero-bg" />
            : prod.imagem
              ? <img src={prod.imagem} alt={prod.nome} />
              : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%)'}} />}
        </div>
        <div className="hero-overlay" />
        <div className="hero-grain" />

        {prod.link_projeto && (
          <button className="hero-play" id="heroPlay" onClick={() => openVideo(prod.link_projeto)}>
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        )}

        <div className="hero-content">
          <div className="hero-meta">
            <span className="hero-tag" id="heroTag">{prod.categoria_nome || 'Projeto'}</span>
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

      {/* Counter */}
      <div className="counter-bar">
        <div className="counter-item" id="c1">
          <div className="counter-label">Ano</div>
          <div className="counter-value">{prod.estoque || '—'}<span className="accent">.</span></div>
        </div>
        <div className="counter-item" id="c2">
          <div className="counter-label">Categoria</div>
          <div className="counter-value" style={{fontSize:'clamp(1rem,2vw,1.8rem)',paddingTop:'.6rem'}}>{prod.categoria_nome || 'Portfolio'}</div>
        </div>
        <div className="counter-item" id="c3">
          <div className="counter-label">Estilo / Local</div>
          <div className="counter-value" style={{fontSize:'clamp(1rem,2vw,1.8rem)',paddingTop:'.6rem'}}>{prod.descricao || '—'}</div>
        </div>
        <div className="counter-item" id="c4">
          <div className="counter-label">Produtora</div>
          <div className="counter-value" style={{fontSize:'clamp(1rem,2vw,1.8rem)',paddingTop:'.6rem',color:'var(--accent)'}}>{siteNome}</div>
        </div>
      </div>

      {/* Brief */}
      <section className="section">
        <div className="section-label fade-in">Case</div>
        <div className="brief-section">
          <div>
            <h2 className="brief-headline fade-in">Um projeto que<br/><em>fala por si</em><br/>mesmo.</h2>
          </div>
          <div className="brief-right fade-in">
            <p className="brief-body">
              {prod.resumo || 'Este projeto representa o melhor da produção audiovisual de alto impacto — cada quadro cuidadosamente planejado para criar experiências visuais que ficam na memória do espectador.'}
            </p>
            <div className="brief-chips">
              {prod.descricao && <span className="chip">{prod.descricao}</span>}
              {prod.estoque   && <span className="chip">{prod.estoque}</span>}
              {prod.categoria_nome && <span className="chip">{prod.categoria_nome}</span>}
              <span className="chip">Audiovisual</span>
              <span className="chip">{siteNome}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" id="div1" />

      {/* Full video */}
      {prod.link_projeto && (
        <section className="full-video-section">
          <div className="full-video-wrapper fade-in" onClick={() => openVideo(prod.link_projeto)} id="fullVideoWrapper">
            {prod.imagem
              ? <img src={prod.imagem} alt={prod.nome} style={{position:'absolute',inset:0,zIndex:0}} />
              : <div style={{position:'absolute',inset:0,background:'#111',zIndex:0}} />}
            <div className="full-video-overlay" style={{position:'absolute',inset:0,zIndex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div className="full-video-play">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Marquee */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[...Array(2)].map((_, r) => (
            <span key={r} style={{display:'contents'}}>
              <span className="marquee-item">{prod.nome} <span className="dot">✦</span></span>
              <span className="marquee-item filled">{siteNome} <span className="dot">✦</span></span>
              <span className="marquee-item">{prod.descricao || 'Audiovisual'} <span className="dot">✦</span></span>
              <span className="marquee-item filled">{prod.estoque || '2024'} <span className="dot">✦</span></span>
              <span className="marquee-item">Elite Audiovisual <span className="dot">✦</span></span>
              <span className="marquee-item filled">Produção de Vídeo <span className="dot">✦</span></span>
            </span>
          ))}
        </div>
      </div>

      {/* Quote */}
      <section className="quote-section section">
        <div className="quote-bg">{siteNome.slice(0,2).toUpperCase()}</div>
        <div className="quote-mark fade-in">"</div>
        <blockquote className="quote-text fade-in">
          {prod.depoimento || 'Cada projeto é uma oportunidade de contar uma história que ressoa — visualmente, emocionalmente, para sempre.'}
        </blockquote>
        <cite className="quote-author fade-in">— {siteNome}, Produtora Audiovisual</cite>
      </section>

      <div className="divider" id="div3" />

      {/* Details */}
      <section className="section">
        <div className="details-section">
          <div>
            <div className="section-label fade-in">Ficha Técnica</div>
            <h2 className="details-title fade-in">Detalhes<br/>do Projeto</h2>
            <p className="details-desc fade-in">
              {prod.ficha_tecnica || 'Produção realizada com equipamentos de última geração, equipe especializada e processos criativos que garantem o mais alto padrão de qualidade audiovisual.'}
            </p>
          </div>
          <div>
            <table className="details-table">
              <tbody>
                <tr className="detail-row"><td>Projeto</td><td>{prod.nome}</td></tr>
                {prod.estoque && <tr className="detail-row"><td>Ano</td><td>{prod.estoque}</td></tr>}
                {prod.descricao && <tr className="detail-row"><td>Estilo / Local</td><td>{prod.descricao}</td></tr>}
                {prod.categoria_nome && <tr className="detail-row"><td>Seção</td><td>{prod.categoria_nome}</td></tr>}
                <tr className="detail-row"><td>Produtora</td><td>{siteNome}</td></tr>
                {prod.diretor && <tr className="detail-row"><td>Direção</td><td>{prod.diretor}</td></tr>}
                {prod.dop     && <tr className="detail-row"><td>Dir. Fotografia</td><td>{prod.dop}</td></tr>}
                {prod.link_projeto && (
                  <tr className="detail-row">
                    <td>Assistir</td>
                    <td><a href={prod.link_projeto} target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'underline',textUnderlineOffset:'3px'}}>Ver no Vimeo ↗</a></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <p className="cta-eyebrow fade-in">Vamos criar juntos</p>
        <h2 className="cta-headline fade-in">Seu próximo<br/>projeto aqui.</h2>
        <div className="cta-btns fade-in">
          {siteWpp && (
            <a href={`https://wa.me/55${siteWpp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-primary">
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

      {/* Next */}
      {proximo && (
        <div className="next-section">
          <Link
            to={`/case/${proximo.slug}`}
            className="next-inner"
            id="nextLink"
            onMouseEnter={() => setNextBgVisible(true)}
            onMouseLeave={() => setNextBgVisible(false)}
          >
            <div>
              <p className="next-label">Próximo Projeto</p>
              <h3 className="next-title">{proximo.nome}</h3>
              {proximo.descricao && (
                <p style={{fontSize:'.8rem',color:'var(--muted)',marginTop:'.5rem',letterSpacing:'.05em'}}>
                  {proximo.descricao}{proximo.estoque ? ` · ${proximo.estoque}` : ''}
                </p>
              )}
            </div>
            <div className="next-arrow">
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </Link>
          {proximo.imagem && (
            <div className="next-bg" style={{backgroundImage:`url('${proximo.imagem}')`, opacity: nextBgVisible ? 1 : 0}} />
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="case-footer">
        <span className="footer-copy">© {prod.estoque || '2024'} {siteNome}. Todos os direitos reservados.</span>
        <button className="footer-back-top" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          Voltar ao topo
        </button>
      </footer>

      {/* Video Modal */}
      <div className={`video-modal${videoModal ? ' active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeVideo(); }}>
        <button className="modal-close" onClick={closeVideo}>✕</button>
        <div className="modal-iframe-wrap">
          <iframe ref={iframeRef} src={videoModal ? videoUrl : ''} allow="autoplay; fullscreen" allowFullScreen title="video" />
        </div>
      </div>
    </>
  );
}
