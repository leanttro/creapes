/**
 * pages/Login.jsx
 * Página de login do painel admin da Creapes.
 * Mesma paleta e tipografia do Painel.jsx.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Loader2, AlertCircle } from 'lucide-react';
import { login, isLoggedIn } from '../lib/api';

// ── Design tokens (espelha Painel.jsx) ───────────────────────────────────────
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

export default function Login() {
  const navigate = useNavigate();

  // Se já tiver token válido, vai direto pro painel
  if (isLoggedIn()) {
    navigate('/painel', { replace: true });
    return null;
  }

  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [erro, setErro]       = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), senha);
      navigate('/painel', { replace: true });
    } catch (err) {
      setErro('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${T.bg3} inset !important;
          -webkit-text-fill-color: ${T.text} !important;
          caret-color: ${T.text};
        }
        .login-input:focus { border-color: ${T.accent} !important; }
        .btn-login:hover:not(:disabled) { background: ${T.accentDk} !important; }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: T.fontBody,
        padding: '24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
        }}>

          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 40,
            justifyContent: 'center',
          }}>
            <Film size={28} color={T.accent} />
            <span style={{
              fontFamily: T.fontHead,
              fontWeight: 700,
              fontSize: 22,
              color: T.text,
              letterSpacing: '-0.01em',
            }}>
              Creapes <span style={{ color: T.accent }}>·</span> Admin
            </span>
          </div>

          {/* Card */}
          <div style={{
            background: T.bg2,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: '36px 32px',
          }}>
            <h1 style={{
              fontFamily: T.fontHead,
              fontWeight: 700,
              fontSize: 20,
              color: T.text,
              marginBottom: 6,
            }}>
              Entrar no painel
            </h1>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 28 }}>
              Acesso restrito a administradores.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.muted,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  E-mail
                </label>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@creapes.com.br"
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: '11px 14px',
                    color: T.text,
                    fontFamily: T.fontBody,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              {/* Senha */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.muted,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Senha
                </label>
                <input
                  className="login-input"
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: '11px 14px',
                    color: T.text,
                    fontFamily: T.fontBody,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              {/* Erro */}
              {erro && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,77,77,0.1)',
                  border: `1px solid rgba(255,77,77,0.3)`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 20,
                  color: T.danger,
                  fontSize: 13,
                }}>
                  <AlertCircle size={15} />
                  {erro}
                </div>
              )}

              {/* Botão */}
              <button
                className="btn-login"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: T.accent,
                  color: T.bg,
                  border: 'none',
                  borderRadius: 8,
                  padding: '13px',
                  fontFamily: T.fontHead,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Entrando…</>
                  : 'Entrar'
                }
              </button>

            </form>
          </div>

          <p style={{
            textAlign: 'center',
            color: T.muted,
            fontSize: 12,
            marginTop: 20,
            opacity: 0.6,
          }}>
            Creapes © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
