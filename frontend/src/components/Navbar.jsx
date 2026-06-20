import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Navbar com:
 * - Menu fullscreen overlay
 * - Player de música (ícone de som) no lugar da lupa
 * - Seletor de idioma PT / EN / ES ao lado
 *
 * O áudio é carregado via prop `audioUrl` (vem do config do backend).
 * O i18n muda o idioma globalmente via react-i18next.
 */
export default function Navbar({ brandName = 'Creapes', brandLogo = null, audioUrl = null }) {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(0.5);
  const [showVol, setShowVol]   = useState(false);
  const audioRef = useRef(null);
  const volTimer = useRef(null);

  const LANGS = ['PT', 'EN', 'ES'];
  const currentLang = i18n.language?.toUpperCase().slice(0, 2) || 'PT';
  const [langOpen, setLangOpen] = useState(false);

  // ── Audio setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.loop   = true;
    audio.volume = volume;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  }

  function handleVolChange(e) {
    setVolume(parseFloat(e.target.value));
    clearTimeout(volTimer.current);
    volTimer.current = setTimeout(() => setShowVol(false), 2000);
  }

  function handleSoundClick() {
    if (!audioUrl) return;
    togglePlay();
    setShowVol(true);
    clearTimeout(volTimer.current);
    volTimer.current = setTimeout(() => setShowVol(false), 2500);
  }

  // ── Links (traduzidos) ─────────────────────────────────────────────────────
  const links = [
    { href: '#hero',    label: t('nav.inicio')   },
    { href: '#work',    label: t('nav.portfolio') },
    { href: '#contact', label: t('nav.contato')  },
  ];

  return (
    <>
      {/* Overlay fullscreen */}
      <div id="nav-menu" className={`nav-overlay ${menuOpen ? 'active' : ''}`}>
        <button className="close-menu" onClick={() => setMenuOpen(false)}>✕</button>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <nav>
        {/* Esquerda: hambúrguer */}
        <div className="nav-left">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            <div className="menu-icon">
              <span></span>
              <span></span>
            </div>
            Menu
          </button>
        </div>

        {/* Centro: brand */}
        <div className="brand">
          <a href="/">
            {brandLogo ? <img src={brandLogo} alt={brandName} /> : brandName}
          </a>
        </div>

        {/* Direita: player + idioma */}
        <div className="nav-right">

          {/* Player de som */}
          {audioUrl && (
            <div className="sound-wrap">
              <button
                className={`sound-btn ${playing ? 'playing' : ''}`}
                onClick={handleSoundClick}
                title={playing ? 'Pausar música' : 'Tocar música'}
              >
                {playing ? (
                  /* Ícone de som ativo — 3 barrinhas animadas */
                  <span className="sound-bars" aria-hidden="true">
                    <span /><span /><span />
                  </span>
                ) : (
                  /* Ícone de som mudo */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                )}
              </button>

              {/* Slider de volume (aparece ao clicar) */}
              <div className={`vol-popup ${showVol ? 'visible' : ''}`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolChange}
                  className="vol-slider"
                />
              </div>
            </div>
          )}

          {/* Seletor de idioma — desktop: 3 botões / mobile: globo + dropdown */}
          <div className="lang-wrap lang-desktop">
            {LANGS.map((lang) => (
              <button
                key={lang}
                className={`lang-btn ${currentLang === lang ? 'active' : ''}`}
                onClick={() => i18n.changeLanguage(lang.toLowerCase())}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="lang-wrap lang-mobile">
            <button className="lang-globe-btn" onClick={() => setLangOpen(o => !o)} aria-label="Idioma">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {LANGS.map((lang) => (
                  <button
                    key={lang}
                    className={`lang-drop-btn ${currentLang === lang ? 'active' : ''}`}
                    onClick={() => { i18n.changeLanguage(lang.toLowerCase()); setLangOpen(false); }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </nav>

      <style>{`
        /* ── Overlay ── */
        .nav-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
          background: rgba(0,0,0,0.98); z-index: 100001;
          display: flex; justify-content: center; align-items: center;
          opacity: 0; pointer-events: none; transition: opacity 0.5s var(--ease);
        }
        .nav-overlay.active { opacity: 1; pointer-events: all; }
        .nav-overlay ul { list-style: none; text-align: center; }
        .nav-overlay li { margin: 2rem 0; overflow: hidden; }
        .nav-overlay a {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2rem, 5vw, 4rem);
          text-transform: uppercase; color: #fff; display: inline-block;
          transition: color 0.3s var(--ease), transform 0.3s var(--ease);
        }
        .nav-overlay a:hover { color: var(--accent); transform: scale(1.05); }
        .close-menu {
          position: absolute; top: 2rem; right: 4rem;
          background: none; border: none; color: #fff;
          font-size: 2rem; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: color 0.3s var(--ease);
        }
        .close-menu:hover { color: var(--accent); }

        /* ── Nav base ── */
        nav {
          position: fixed; top: 0; left: 0; width: 100%;
          padding: 0.8rem 4rem;
          display: flex; justify-content: space-between; align-items: center;
          background: #000000;
          z-index: 100000;
          isolation: isolate;
        }
        .nav-left, .nav-right { display: flex; align-items: center; flex: 1; gap: 8px; }
        .nav-right { justify-content: flex-end; }

        .brand {
          font-size: 1.5rem; font-weight: 700; letter-spacing: 0.1em;
          position: absolute; left: 50%; transform: translateX(-50%);
          color: #ffffff; display: flex; align-items: center; justify-content: center;
        }
        .brand a { display: flex; align-items: center; }
        .brand img { max-height: 35px; object-fit: contain; }

        .menu-btn {
          display: flex; align-items: center; gap: 0.8rem;
          background: none; border: none; color: #ffffff;
          font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 500;
          cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;
          transition: color 0.3s var(--ease);
        }
        .menu-btn:hover { color: var(--accent); }
        .menu-icon { display: flex; flex-direction: column; gap: 4px; }
        .menu-icon span { display: block; width: 24px; height: 1px; background-color: currentColor; transition: background-color 0.3s var(--ease); }

        /* ── Sound player ── */
        .sound-wrap { position: relative; display: flex; align-items: center; }

        .sound-btn {
          background: none; border: none; color: #ffffff;
          cursor: pointer; transition: color 0.3s var(--ease);
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
        }
        .sound-btn:hover { color: var(--accent); }
        .sound-btn.playing { color: var(--accent); }

        /* Barrinhas animadas quando tocando */
        .sound-bars {
          display: flex; align-items: flex-end; gap: 2px; height: 18px;
        }
        .sound-bars span {
          display: block; width: 3px; background: currentColor; border-radius: 2px;
          animation: soundbar 0.8s ease-in-out infinite alternate;
        }
        .sound-bars span:nth-child(1) { height: 8px;  animation-delay: 0s; }
        .sound-bars span:nth-child(2) { height: 16px; animation-delay: 0.2s; }
        .sound-bars span:nth-child(3) { height: 10px; animation-delay: 0.4s; }
        @keyframes soundbar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }

        /* Popup de volume */
        .vol-popup {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: rgba(0,0,0,0.9); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 10px 12px;
          opacity: 0; pointer-events: none;
          transition: opacity 0.2s ease;
          white-space: nowrap; z-index: 9999;
        }
        .vol-popup.visible { opacity: 1; pointer-events: all; }
        .vol-slider {
          -webkit-appearance: none; appearance: none;
          width: 90px; height: 3px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px; outline: none; cursor: pointer;
        }
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--accent); cursor: pointer;
        }

        /* ── Seletor de idioma ── */
        .lang-wrap {
          display: flex; align-items: center; gap: 2px;
          border-left: 1px solid rgba(255,255,255,0.15);
          padding-left: 12px; margin-left: 4px;
        }
        .lang-btn {
          background: none; border: none; color: rgba(255,255,255,0.4);
          font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.08em; cursor: pointer; padding: 3px 5px;
          transition: color 0.2s ease;
          text-transform: uppercase;
        }
        .lang-btn:hover { color: rgba(255,255,255,0.8); }
        .lang-btn.active { color: var(--accent); }

        @media (max-width: 900px) {
          nav { padding: 0.8rem 2rem; }
          .lang-wrap { padding-left: 8px; margin-left: 2px; }
        }
        .lang-desktop { display: flex; }
        .lang-mobile  { display: none; }
        @media (max-width: 600px) {
          nav { padding: 0.8rem 1.2rem; }
          .lang-desktop { display: none; }
          .lang-mobile {
            display: flex; align-items: center; position: relative;
            border-left: 1px solid rgba(255,255,255,0.15);
            padding-left: 10px; margin-left: 4px;
          }
          .lang-globe-btn {
            background: none; border: none; color: #fff;
            cursor: pointer; display: flex; align-items: center;
            padding: 4px; transition: color 0.2s;
          }
          .lang-globe-btn:hover { color: var(--accent); }
          .lang-dropdown {
            position: absolute; top: calc(100% + 10px); right: 0;
            background: #111; border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px; overflow: hidden; z-index: 99999;
            display: flex; flex-direction: column;
          }
          .lang-drop-btn {
            background: none; border: none; color: rgba(255,255,255,0.5);
            font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600;
            letter-spacing: 0.08em; text-transform: uppercase;
            padding: 10px 20px; cursor: pointer; text-align: center;
            transition: background 0.2s, color 0.2s;
          }
          .lang-drop-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
          .lang-drop-btn.active { color: var(--accent); }
        }
      `}</style>
    </>
  );
}
