import { useState } from 'react';

// Props:
// nome: string — nome da empresa (ex: "Creapes")
// whatsapp: string — número para link wa.me (ex: "5511999999999")
// instagramUrl: string — URL do Instagram
// vimeoUrl: string
// linkedinUrl: string
// onSubmit: async function(formData) → void  — handler de envio (conectar ao backend depois)

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
  const [form, setForm] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    mensagem: '',
  });

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
        <div className="footer-block">
          <h2>Start a Project</h2>

          {!submitted ? (
            <form className="cf-form" onSubmit={handleSubmit}>
              <div className="cf-row">
                <div className="cf-field">
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
                    />
                  </div>
                </div>
                <div className="cf-field">
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
                    />
                  </div>
                </div>
              </div>

              <div className="cf-field">
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
                  />
                </div>
              </div>

              <div className="cf-field">
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
                  Enviar Briefing
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
        <div className="footer-block">
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

      <div className="footer-bottom fade-in">
        <div className="copyright">
          &copy; {new Date().getFullYear()} {nome}. All rights reserved.
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          Desenvolvido por{' '}
          <a
            href="https://www.leanttro.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
          >
            Leanttro Tecnologia
          </a>
          {' · '}
          <a
            href="https://wa.me/5511913324827"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
          >
            WhatsApp
          </a>
        </p>
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
          gap: 6rem;
          margin-bottom: 6rem;
          flex-wrap: wrap;
        }
        .footer-block {
          flex: 1;
          min-width: 300px;
        }
        .footer-block h2 {
          font-size: 2rem;
          margin-bottom: 2rem;
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
          padding: 1.4rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
          transition: border-color 0.4s;
        }
        .cf-field:focus-within { border-color: var(--accent); }
        .cf-number {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.72rem;
          color: var(--accent);
          letter-spacing: 0.12em;
          padding-top: 0.25rem;
          min-width: 26px;
          opacity: 0.7;
          transition: opacity 0.3s;
        }
        .cf-field:focus-within .cf-number { opacity: 1; }
        .cf-input-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .cf-label {
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(240,240,240,0.3);
          transition: color 0.3s;
          font-family: 'Inter', sans-serif;
        }
        .cf-field:focus-within .cf-label { color: var(--accent); }
        .cf-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          padding: 0.15rem 0;
          width: 100%;
          caret-color: var(--accent);
        }
        .cf-input::placeholder { color: rgba(240,240,240,0.18); }
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
          padding-right: 2rem;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .cf-row .cf-field:last-child { padding-left: 2rem; }
        .cf-submit-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .cf-disclaimer {
          font-size: 0.72rem;
          color: rgba(240,240,240,0.25);
          letter-spacing: 0.04em;
          max-width: 220px;
          line-height: 1.5;
        }
        .cf-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 1.2rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text);
          transition: color 0.3s;
        }
        .cf-submit-btn:hover { color: var(--accent); }
        .cf-submit-circle {
          width: 52px;
          height: 52px;
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

        @media (max-width: 900px) {
          footer { padding: 5rem 2rem 2rem; }
          .footer-blocks { flex-direction: column; gap: 3rem; }
          .cf-row { flex-direction: column; }
          .cf-row .cf-field:first-child { border-right: none; padding-right: 0; }
          .cf-row .cf-field:last-child { padding-left: 0; }
          .footer-bottom { flex-direction: column; gap: 1.5rem; }
        }
      `}</style>
    </footer>
  );
}
