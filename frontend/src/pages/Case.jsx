import { useState, useEffect } from 'react';

// ── Design tokens (espelha o Painel) ──────────────────────────────────────────
const T = {
  bg:       '#0f1923',
  bg2:      '#111d28',
  bg3:      '#162130',
  border:   '#1e3040',
  text:     '#f5f5f7',
  muted:    '#8a9bb0',
  accent:   '#d0ff00',
  accentDk: '#a8cc00',
  danger:   '#ff4d4d',
  fontHead: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', -apple-system, sans-serif",
};

// ── Utilitários ───────────────────────────────────────────────────────────────

/** Gera slug a partir de uma string qualquer */
function toSlug(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Lê o slug do pathname: /cases/:slug → slug */
function slugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  // suporta /cases/meu-case  ou  /case/meu-case  ou último segmento
  const idx = parts.findIndex(p => p === 'cases' || p === 'case');
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  return parts[parts.length - 1] || '';
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0', color: T.muted, fontFamily: T.fontBody, fontSize: 15 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation: 'spin 0.9s linear infinite', flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" fill="none" stroke={T.accent} strokeWidth="3" strokeDasharray="40 20" />
      </svg>
      Carregando case…
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 24px', color: T.muted, fontFamily: T.fontBody }}>
      <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>⬡</div>
      <p style={{ fontFamily: T.fontHead, fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 8 }}>Case não encontrado</p>
      <p style={{ fontSize: 14, marginBottom: 32 }}>O projeto que você buscou não existe ou foi removido.</p>
      <a href="/" style={{ color: T.accent, fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', fontFamily: T.fontHead }}>
        ← Voltar ao início
      </a>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${T.accent}18`,
      color: T.accent,
      border: `1px solid ${T.accent}40`,
      borderRadius: 20,
      padding: '3px 12px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      fontFamily: T.fontHead,
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
}

function MetaItem({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, fontFamily: T.fontHead }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.fontBody }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${T.border}`, margin: '36px 0' }} />;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Case() {
  const [caseData, setCaseData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const slug = slugFromPath();

    async function fetchCase() {
      try {
        setLoading(true);
        const res = await fetch('/api/cases');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cases = await res.json();

        // filtra pelo slug derivado do nome (campo `nome`) ou link_projeto
        const found = cases.find(c => toSlug(c.nome) === slug);
        if (!found) { setError(true); return; }
        setCaseData(found);
      } catch (err) {
        console.error('[Case] Erro ao buscar cases:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCase();
  }, []);

  // ── Keyframes globais ──
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&display=swap');
      @keyframes spin    { to { transform: rotate(360deg); } }
      @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.5; } }
      .case-hero-img     { transition: transform 0.6s ease; }
      .case-hero-img:hover { transform: scale(1.015); }
      .case-back-link    { color: ${T.muted}; text-decoration: none; font-size: 13px; font-weight: 600;
                           font-family: ${T.fontHead}; letter-spacing: 0.05em; text-transform: uppercase;
                           display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s; }
      .case-back-link:hover { color: ${T.accent}; }
      .case-cta-btn      { display: inline-flex; align-items: center; gap: 8px;
                           background: ${T.accent}; color: ${T.bg};
                           border: none; border-radius: 8px; padding: 13px 28px;
                           font-family: ${T.fontHead}; font-weight: 700; font-size: 13px;
                           cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;
                           text-decoration: none; transition: background 0.2s, transform 0.15s; }
      .case-cta-btn:hover { background: ${T.accentDk}; transform: translateY(-1px); }
      .case-video-btn    { display: inline-flex; align-items: center; gap: 8px;
                           background: transparent; color: ${T.text};
                           border: 1px solid ${T.border}; border-radius: 8px; padding: 12px 24px;
                           font-family: ${T.fontBody}; font-weight: 600; font-size: 13px;
                           cursor: pointer; transition: border-color 0.2s, color 0.2s; }
      .case-video-btn:hover { border-color: ${T.accent}; color: ${T.accent}; }
      .overlay-backdrop  { position: fixed; inset: 0; background: rgba(0,0,0,0.92);
                           backdrop-filter: blur(6px); z-index: 9000;
                           display: flex; align-items: center; justify-content: center; padding: 24px; }
      .overlay-close     { position: absolute; top: 20px; right: 20px;
                           background: none; border: none; color: ${T.muted}; font-size: 28px;
                           cursor: pointer; line-height: 1; transition: color 0.2s; }
      .overlay-close:hover { color: ${T.text}; }
      ::-webkit-scrollbar { width: 6px; background: ${T.bg}; }
      ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ── Fechar modal com Escape ──
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setVideoOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Layout base ──
  const page = (children) => (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.fontBody, color: T.text }}>
      {children}
    </div>
  );

  if (loading) return page(<Spinner />);
  if (error || !caseData) return page(<NotFound />);

  const {
    nome, descricao, resumo, categoria_nome,
    imagem, link_projeto, depoimento,
    ficha_tecnica, diretor, dop, ano,
  } = caseData;

  // Ficha técnica: pode ser JSON array ou string separada por \n
  let fichaTecnicaItems = [];
  if (ficha_tecnica) {
    try {
      const parsed = JSON.parse(ficha_tecnica);
      fichaTecnicaItems = Array.isArray(parsed) ? parsed : [ficha_tecnica];
    } catch {
      fichaTecnicaItems = ficha_tecnica.split('\n').filter(Boolean);
    }
  }

  const hasMeta     = diretor || dop || ano || categoria_nome;
  const hasVideo    = Boolean(link_projeto);
  const hasDepo     = Boolean(depoimento);
  const hasFicha    = fichaTecnicaItems.length > 0;

  return page(
    <>
      {/* ── Modal de vídeo ─────────────────────────────────────────────────── */}
      {videoOpen && hasVideo && (
        <div className="overlay-backdrop" onClick={() => setVideoOpen(false)}>
          <button className="overlay-close" onClick={() => setVideoOpen(false)} aria-label="Fechar vídeo">×</button>
          <div
            style={{ position: 'relative', width: '100%', maxWidth: 960, aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <iframe
              src={link_projeto}
              title={nome}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* ── Topo / breadcrumb ───────────────────────────────────────────────── */}
      <div style={{ padding: '28px 24px 0', maxWidth: 1100, margin: '0 auto' }}>
        <a href="/" className="case-back-link">
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> Todos os projetos
        </a>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 0', animation: 'fadeUp 0.5s ease both' }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {categoria_nome && <Badge>{categoria_nome}</Badge>}
          {ano && <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontHead, letterSpacing: '0.06em' }}>{ano}</span>}
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: T.fontHead,
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: T.text,
          margin: '0 0 16px',
          maxWidth: 800,
        }}>
          {nome}
        </h1>

        {/* Subtítulo / descricao */}
        {descricao && (
          <p style={{
            fontFamily: T.fontBody,
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: T.muted,
            lineHeight: 1.6,
            maxWidth: 640,
            margin: '0 0 32px',
          }}>
            {descricao}
          </p>
        )}

        {/* CTAs */}
        {hasVideo && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <button className="case-cta-btn" onClick={() => setVideoOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Assistir projeto
            </button>
          </div>
        )}

        {/* Imagem hero */}
        {imagem && (
          <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}`, position: 'relative' }}>
            {hasVideo && (
              <button
                onClick={() => setVideoOpen(true)}
                aria-label="Reproduzir vídeo"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', border: `2px solid ${T.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)', transition: 'transform 0.2s',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={T.accent} style={{ marginLeft: 3 }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </button>
            )}
            <img
              src={imagem}
              alt={nome}
              className="case-hero-img"
              style={{ display: 'block', width: '100%', maxHeight: 560, objectFit: 'cover' }}
            />
          </div>
        )}
      </header>

      {/* ── Corpo ────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>

        {/* Grade: Resumo + Ficha Técnica */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: hasFicha || hasMeta ? '1fr 320px' : '1fr',
          gap: 48,
          alignItems: 'start',
        }}>

          {/* Coluna esquerda: resumo + depoimento */}
          <div>
            {resumo && (
              <section>
                <h2 style={{ fontFamily: T.fontHead, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 16 }}>
                  Sobre o projeto
                </h2>
                <p style={{ fontFamily: T.fontBody, fontSize: 16, lineHeight: 1.75, color: T.text, margin: 0, whiteSpace: 'pre-line' }}>
                  {resumo}
                </p>
              </section>
            )}

            {hasDepo && (
              <>
                <Divider />
                <section>
                  <h2 style={{ fontFamily: T.fontHead, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 20 }}>
                    Depoimento
                  </h2>
                  <blockquote style={{
                    margin: 0,
                    padding: '20px 24px',
                    background: T.bg2,
                    border: `1px solid ${T.border}`,
                    borderLeft: `3px solid ${T.accent}`,
                    borderRadius: '0 10px 10px 0',
                  }}>
                    <p style={{ fontFamily: T.fontBody, fontSize: 15, lineHeight: 1.7, color: T.text, margin: 0, fontStyle: 'italic' }}>
                      "{depoimento}"
                    </p>
                  </blockquote>
                </section>
              </>
            )}
          </div>

          {/* Coluna direita: meta + ficha técnica */}
          {(hasMeta || hasFicha) && (
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Meta */}
              {hasMeta && (
                <div style={{
                  background: T.bg2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}>
                  <MetaItem label="Direção"  value={diretor} />
                  <MetaItem label="D.O.P."   value={dop} />
                  <MetaItem label="Ano"      value={ano} />
                  <MetaItem label="Categoria" value={categoria_nome} />
                </div>
              )}

              {/* Ficha técnica */}
              {hasFicha && (
                <div style={{
                  background: T.bg2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: '24px 20px',
                }}>
                  <h3 style={{
                    fontFamily: T.fontHead,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: T.accent,
                    marginTop: 0,
                    marginBottom: 16,
                  }}>
                    Ficha Técnica
                  </h3>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {fichaTecnicaItems.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: T.text, fontFamily: T.fontBody, lineHeight: 1.5 }}>
                        <span style={{ color: T.accent, marginTop: 2, flexShrink: 0 }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link externo (fallback se não for Vimeo embed) */}
              {hasVideo && !link_projeto.startsWith('https://player.vimeo') && !link_projeto.includes('.mp4') && (
                <a
                  href={link_projeto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="case-cta-btn"
                  style={{ justifyContent: 'center' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Ver projeto completo
                </a>
              )}
            </aside>
          )}
        </div>

        {/* ── Rodapé: botão de voltar ── */}
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a href="/" className="case-back-link">
            <span style={{ fontSize: 16 }}>←</span> Ver todos os projetos
          </a>
        </div>

      </main>

      {/* ── Responsividade mínima via media query inline ── */}
      <style>{`
        @media (max-width: 700px) {
          main > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
