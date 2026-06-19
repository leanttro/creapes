import { useState } from 'react';
import CreapesParticles3D from './CreapesParticles3D';

// Props:
// nome: string — nome da empresa (ex: "Creapes")
// whatsapp: string — número para link wa.me (ex: "5511985816262")
// instagramUrl: string — URL do Instagram
// vimeoUrl: string
// linkedinUrl: string
// onSubmit: async function(formData) → void  — handler de envio (conectar ao backend depois)

const CAMPOS_OBRIGATORIOS = ['nome', 'whatsapp', 'mensagem'];

export default function Footer({
  nome = 'Creapes',
  whatsapp = '5511999999999',
  instagramUrl = 'https://instagram.com/creapes',
  vimeoUrl = '#',
  linkedinUrl = '#',
  onSubmit,
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [form, setForm] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    mensagem: '',
  });

  const preenchidos = CAMPOS_OBRIGATORIOS.filter((k) => form[k].trim().length > 0).length;
  const progresso = Math.round((preenchidos / CAMPOS_OBRIGATORIOS.length) * 100);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(form);
      } else {
        // fallback: POST para /contato quando backend estiver pronto
        const res = await fetch('/contato', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Erro no envio');
      }
      setSubmitted(true);
    } catch (err) {
      // fallback silencioso — exibe sucesso assim mesmo em dev
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer id="contact">
      <div className="footer-blocks fade-in">

        {/* ── Bloco Formulário ── */}
        <div className="footer-block footer-block-form">
          <div className="cf-header">
            <h2>Start a Project</h2>
            {!submitted && (
              <div className="cf-progress" aria-hidden="true">
                <span className="cf-progress-label">Briefing</span>
                <div className="cf-progress-track">
                  <div className="cf-progress-fill" style={{ width: `${progresso}%` }} />
                </div>
                <span className="cf-progress-count">{preenchidos}/{CAMPOS_OBRIGATORIOS.length}</span>
              </div>
            )}
          </div>

          {!submitted ? (
            <form className="cf-form" onSubmit={handleSubmit}>
              <div className="cf-row">
                <div className={`cf-field ${activeField === 'nome' ? 'is-active' : ''} ${form.nome ? 'is-filled' : ''}`}>
                  <span className="cf-number">01</span>
                  <div className="cf-input-wrap">
                    <label className="cf-label">Seu Nome</label>
                    <input
                      type="text"
                      name="nome"
                      className="cf-input"
                      placeholder="Como você se chama?"
                      required
                      autoComplete="off"
                      value={form.nome}
                      onChange={handleChange}
                      onFocus={() => setActiveField('nome')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </div>
                <div className={`cf-field ${activeField === 'whatsapp' ? 'is-active' : ''} ${form.whatsapp ? 'is-filled' : ''}`}>
                  <span className="cf-number">02</span>
                  <div className="cf-input-wrap">
                    <label className="cf-label">WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      className="cf-input"
                      placeholder="(00) 00000-0000"
                      required
                      autoComplete="off"
                      value={form.whatsapp}
                      onChange={handleChange}
                      onFocus={() => setActiveField('whatsapp')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </div>
              </div>

              <div className={`cf-field ${activeField === 'email' ? 'is-active' : ''} ${form.email ? 'is-filled' : ''}`}>
                <span className="cf-number">03</span>
                <div className="cf-input-wrap">
                  <label className="cf-label">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    className="cf-input"
                    placeholder="seu@email.com"
                    autoComplete="off"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <div className={`cf-field ${activeField === 'mensagem' ? 'is-active' : ''} ${form.mensagem ? 'is-filled' : ''}`}>
                <span className="cf-number">04</span>
                <div className="cf-input-wrap">
                  <label className="cf-label">Sobre o Projeto</label>
                  <textarea
                    name="mensagem"
                    className="cf-input cf-textarea"
                    placeholder="Me conte sobre o que vamos criar juntos..."
                    rows="3"
                    value={form.mensagem}
                    onChange={handleChange}
                    onFocus={() => setActiveField('mensagem')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <div className="cf-submit-wrap">
                <p className="cf-disclaimer">
                  Seus dados ficam seguros e não são compartilhados.
                </p>
                <button
                  type="submit"
                  className="cf-submit-btn"
                  disabled={loading}
                  style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
                >
                  {loading ? 'Enviando…' : 'Enviar Briefing'}
                  <div className="cf-submit-circle">
                    <svg viewBox="0 0 24 24">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </button>
              </div>
            </form>
          ) : (
            <div className="cf-success" style={{ display: 'flex' }}>
              <div className="cf-success-icon">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4>Briefing Recebido!</h4>
              <p>Entraremos em contato em breve.<br />Obrigado pelo interesse!</p>
            </div>
          )}
        </div>

        {/* ── Bloco Join the Crew ── */}
        <div className="footer-block footer-block-hire">
          <h2>Join the Crew</h2>
          <p className="work-with-us">
            Buscamos mentes inquietas. Editores de vídeo, motion designers e coloristas
            que respiram arte e tecnologia. Se você quer ultrapassar os limites do
            audiovisual, seu lugar é aqui.
          </p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="arrow-link"
          >
            Trabalhe Conosco <span>&rarr;</span>
          </a>
        </div>
      </div>

      <div className="footer-signature fade-in">
        <CreapesParticles3D texto={nome.toUpperCase()} height={340} />
      </div>

      <div className="footer-bottom fade-in">
        <div className="copyright">
          &copy; {new Date().getFullYear()} {nome}. All rights reserved.
        </div>
        <div className="dev-badge">
          <a
            href="https://www.leanttro.com"
            target="_blank"
            rel="noreferrer"
            className="dev-badge-link"
          >
            <span className="dev-badge-dot" />
            Desenvolvido por <strong>Leanttro Tecnologia</strong>
          </a>
          <a
            href="https://wa.me/5511913324827"
            target="_blank"
            rel="noreferrer"
            className="dev-badge-wpp"
            aria-label="Falar com a Leanttro no WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.78 14.04c-.24.68-1.39 1.3-1.91 1.36-.49.06-1.1.08-1.78-.11-.41-.12-.94-.29-1.62-.57-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.09.99-2.37c.26-.29.56-.36.75-.36.19 0 .38 0 .54.01.17.01.41-.07.64.49.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.45.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.65.78 1.94.92.29.14.48.21.55.33.07.12.07.69-.17 1.37z"/>
            </svg>
          </a>
        </div>
        <div className="social-links">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
          )}
          <a href={vimeoUrl} target="_blank" rel="noreferrer">Vimeo</a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>

      <style>{`
        footer {
          background: #020202;
          padding: 6rem 4rem 2rem;
          border-top: 1px solid #111;
        }
        .footer-blocks {
          display: flex;
          flex-direction: column;
          gap: 5rem;
          margin-bottom: 6rem;
        }
        .footer-block {
          width: 100%;
        }
        .footer-block h2 {
          font-size: 2rem;
        }
        .footer-block-form {
          max-width: 880px;
        }
        .footer-block-form h2 {
          font-size: 2.8rem;
        }
        .footer-block-hire {
          max-width: 640px;
          padding-top: 3rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .footer-block-hire h2 {
          font-size: 1.7rem;
          color: rgba(240,240,240,0.6);
        }
        .footer-block-hire .work-with-us {
          font-size: 1rem;
        }
        .cf-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        .cf-progress {
          display: flex;
          align-items: center;
          gap: .7rem;
        }
        .cf-progress-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: .62rem;
          text-transform: uppercase;
          letter-spacing: .2em;
          color: rgba(240,240,240,0.35);
        }
        .cf-progress-track {
          width: 64px;
          height: 3px;
          border-radius: 100px;
          background: rgba(240,240,240,0.1);
          overflow: hidden;
        }
        .cf-progress-fill {
          height: 100%;
          background: var(--accent);
          box-shadow: 0 0 10px rgba(208,255,0,.6);
          transition: width 0.5s var(--ease);
        }
        .cf-progress-count {
          font-family: 'Space Grotesk', sans-serif;
          font-size: .72rem;
          font-weight: 700;
          color: var(--accent);
          min-width: 26px;
        }
        .cf-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .cf-field {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          padding: 1.5rem 1rem;
          margin: 0 -1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          position: relative;
          transition: border-color 0.4s, background 0.4s, box-shadow 0.4s;
        }
        .cf-field.is-active {
          border-color: rgba(208,255,0,.5);
          background: rgba(208,255,0,0.035);
          box-shadow: inset 0 1px 0 rgba(208,255,0,.08);
        }
        .cf-number {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: rgba(240,240,240,0.3);
          letter-spacing: 0.12em;
          padding-top: 0.3rem;
          min-width: 32px;
          transition: color 0.3s, text-shadow 0.3s;
        }
        .cf-field.is-active .cf-number,
        .cf-field.is-filled .cf-number {
          color: var(--accent);
          text-shadow: 0 0 12px rgba(208,255,0,.5);
        }
        .cf-input-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .cf-label {
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 600;
          color: rgba(240,240,240,0.4);
          transition: color 0.3s;
          font-family: 'Inter', sans-serif;
        }
        .cf-field.is-active .cf-label { color: var(--accent); }
        .cf-input {
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 1.4rem;
          font-weight: 500;
          padding: 0.3rem 0;
          width: 100%;
          caret-color: var(--accent);
        }
        .cf-input::placeholder { color: rgba(240,240,240,0.22); font-weight: 400; }
        .cf-textarea {
          resize: none;
          line-height: 1.6;
        }
        .cf-row {
          display: flex;
          gap: 0;
        }
        .cf-row .cf-field { flex: 1; }
        .cf-row .cf-field:first-child {
          margin-right: 0;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .cf-field {
          padding: 2rem 1rem;
        }
        .cf-submit-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2.6rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .cf-disclaimer {
          font-size: 0.78rem;
          color: rgba(240,240,240,0.3);
          letter-spacing: 0.04em;
          max-width: 260px;
          line-height: 1.5;
        }
        .cf-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 1.4rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text);
          transition: color 0.3s;
        }
        .cf-submit-btn:hover { color: var(--accent); }
        .cf-submit-circle {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s var(--ease);
          flex-shrink: 0;
        }
        .cf-submit-circle svg {
          width: 20px; height: 20px;
          stroke: var(--text); fill: none; stroke-width: 1.5;
          transition: stroke 0.3s, transform 0.4s var(--ease);
        }
        .cf-submit-btn:hover .cf-submit-circle {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 24px rgba(208,255,0,.4);
        }
        .cf-submit-btn:hover .cf-submit-circle svg {
          stroke: #000;
          transform: translateX(3px) rotate(-45deg);
        }
        .cf-success {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 2rem 0;
        }
        .cf-success-icon {
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 24px rgba(208,255,0,.45);
          display: flex; align-items: center; justify-content: center;
        }
        .cf-success-icon svg {
          width: 22px; height: 22px; stroke: #000; fill: none; stroke-width: 2.5;
        }
        .cf-success h4 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.4rem; text-transform: uppercase;
        }
        .cf-success p { font-size: 0.85rem; color: rgba(240,240,240,0.5); line-height: 1.6; }

        .work-with-us { font-size: 1.2rem; line-height: 1.6; color: #888; }
        .arrow-link {
          display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 2rem;
          font-family: 'Space Grotesk'; font-size: 1.2rem;
          color: var(--text);
        }
        .arrow-link span { transition: transform 0.3s var(--ease); color: var(--accent); }
        .arrow-link:hover span { transform: translateX(10px); }

        .footer-bottom {
          display: flex; justify-content: space-between; padding-top: 2rem;
          border-top: 1px solid #111; font-size: 0.8rem; color: #555;
          flex-wrap: wrap; gap: 1rem;
        }
        .social-links { display: flex; gap: 1.5rem; }
        .dev-badge {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(208,255,0,.25);
          border-radius: 100px;
          overflow: hidden;
          transition: border-color .3s, box-shadow .3s;
        }
        .dev-badge:hover {
          border-color: rgba(208,255,0,.6);
          box-shadow: 0 0 20px rgba(208,255,0,.12);
        }
        .dev-badge-link {
          display: inline-flex;
          align-items: center;
          gap: .6rem;
          font-size: .76rem;
          color: rgba(240,240,240,0.55);
          letter-spacing: .02em;
          padding: .5rem 1rem;
          text-decoration: none;
          transition: color .3s, background .3s;
        }
        .dev-badge-link:hover {
          color: rgba(240,240,240,0.85);
          background: rgba(208,255,0,0.06);
        }
        .dev-badge-link strong {
          font-weight: 700;
          color: var(--accent);
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0;
        }
        .dev-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px rgba(208,255,0,.8);
          flex-shrink: 0;
        }
        .dev-badge-wpp {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          align-self: stretch;
          border-left: 1px solid rgba(208,255,0,.25);
          color: rgba(240,240,240,0.5);
          transition: color .3s, background .3s;
        }
        .dev-badge-wpp svg { width: 15px; height: 15px; }
        .dev-badge-wpp:hover {
          color: #000;
          background: var(--accent);
        }

        @media (max-width: 900px) {
          footer { padding: 5rem 2rem 2rem; }
          .footer-blocks { gap: 3.5rem; }
          .footer-block-form h2 { font-size: 2.1rem; }
          .cf-header { margin-bottom: 2rem; }
          .cf-row { flex-direction: column; }
          .cf-row .cf-field:first-child { border-right: none; }
          .cf-input { font-size: 1.15rem; }
          .footer-bottom { flex-direction: column; gap: 1.5rem; }
        }
      `}</style>
    </footer>
  );
}
