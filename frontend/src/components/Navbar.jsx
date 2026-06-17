import { useState } from 'react';

/**
 * Navbar — header fixo + overlay de menu fullscreen.
 *
 * No HTML original o brand vinha do Jinja:
 *   {% if loja.logo %} <img src="{{ loja.logo }}"> {% else %} {{ loja.nome }} {% endif %}
 * Aqui isso virou props `brandName` / `brandLogo`.
 *
 * O overlay (.nav-overlay) e seu estado ativo/inativo eram controlados
 * via classList no JS solto; agora é puro useState + classe condicional,
 * preservando a transição CSS de opacidade definida nos estilos locais
 * abaixo (idênticos ao original).
 */
export default function Navbar({ brandName = 'Creapes', brandLogo = null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '#hero', label: 'Início' },
    { href: '#work', label: 'Portfólio' },
    { href: '#contact', label: 'Contato' },
  ];

  return (
    <>
      <div id="nav-menu" className={`nav-overlay ${menuOpen ? 'active' : ''}`}>
        <button className="close-menu" onClick={() => setMenuOpen(false)}>
          ✕
        </button>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <nav>
        <div className="nav-left">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            <div className="menu-icon">
              <span></span>
              <span></span>
            </div>
            Menu
          </button>
        </div>

        <div className="brand">
          <a href="/">
            {brandLogo ? <img src={brandLogo} alt={brandName} /> : brandName}
          </a>
        </div>

        <div className="nav-right">
          <button className="search-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </nav>

      <style>{`
        .nav-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
          background: rgba(0,0,0,0.98); z-index: 99999;
          display: flex; justify-content: center; align-items: center;
          opacity: 0; pointer-events: none; transition: opacity 0.5s var(--ease);
        }
        .nav-overlay.active { opacity: 1; pointer-events: all; }
        .nav-overlay ul { list-style: none; text-align: center; }
        .nav-overlay li { margin: 2rem 0; overflow: hidden; }
        .nav-overlay a {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2rem, 5vw, 4rem);
          text-transform: uppercase;
          color: #fff;
          display: inline-block;
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

        nav {
          position: fixed;
          top: 0; left: 0; width: 100%;
          padding: 0.8rem 4rem;
          display: flex; justify-content: space-between; align-items: center;
          background: #000000;
          z-index: 100;
        }

        .nav-left, .nav-right { display: flex; align-items: center; flex: 1; }
        .nav-right { justify-content: flex-end; }

        .brand {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
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

        .search-btn {
          background: none; border: none; color: #ffffff;
          cursor: pointer; transition: color 0.3s var(--ease);
        }
        .search-btn:hover { color: var(--accent); }

        @media (max-width: 900px) {
          nav { padding: 0.8rem 2rem; }
        }
      `}</style>
    </>
  );
}
