// Props:
// logos: string[] — array de URLs das imagens dos clientes
// Valores de exemplo fixos; conectar ao backend depois via lib/api.js

export default function Clientes({ logos = [] }) {
  if (!logos || logos.length === 0) return null;

  // Duplica os logos para criar o efeito de marquee infinito (50% + 50%)
  const doubled = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="clients-section fade-in">
      <div className="clients-left">
        <h2>
          Nossos clientes<span className="accent-dot">.</span>
        </h2>
        <a href="#contact" className="clients-link">
          Conheça todos &rarr;
        </a>
      </div>

      <div className="clients-right">
        {/* Faixa 1 — direção normal */}
        <div className="clients-track">
          {doubled.map((src, i) => (
            <img key={`a-${i}`} src={src} alt="Cliente" loading="lazy" />
          ))}
        </div>
      </div>

      <style>{`
        .clients-section {
          padding: 1.5rem 4rem;
          background: var(--bg);
          display: flex;
          gap: 4rem;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          position: relative;
          z-index: 5;
        }
        .clients-left {
          flex: 0 0 22%;
        }
        .clients-left h2 {
          font-size: clamp(1.2rem, 1.8vw, 1.8rem);
          line-height: 1.1;
          margin-bottom: 0.3rem;
          color: var(--text);
          white-space: nowrap;
        }
        .accent-dot { color: var(--accent); }
        .clients-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.7;
          color: var(--text);
          text-decoration: none;
          transition: color 0.3s var(--ease);
        }
        .clients-link:hover { color: var(--accent); }

        .clients-right {
          flex: 1;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .clients-right::before,
        .clients-right::after {
          content: '';
          position: absolute;
          top: 0;
          width: 100px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        .clients-right::before {
          left: 0;
          background: linear-gradient(to right, var(--bg), transparent);
        }
        .clients-right::after {
          right: 0;
          background: linear-gradient(to left, var(--bg), transparent);
        }

        .clients-track {
          display: flex;
          gap: 4rem;
          align-items: center;
          animation: marquee-clients 120s linear infinite;
          width: max-content;
        }
        .clients-track.reverse {
          animation-direction: reverse;
          animation-duration: 90s;
        }
        .clients-track img {
          height: 140px;
          object-fit: contain;
          max-width: 300px;
          filter: grayscale(100%) brightness(0.6);
          transition: all 0.4s var(--ease);
          flex-shrink: 0;
        }
        .clients-track img:hover {
          filter: grayscale(0%) brightness(1);
          transform: scale(1.1);
          animation-play-state: paused;
        }

        @keyframes marquee-clients {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 900px) {
          .clients-section {
            flex-direction: column;
            padding: 2rem 2rem;
            gap: 2rem;
          }
          .clients-left {
            flex: none;
            width: 100%;
            text-align: center;
          }
          .clients-right::before,
          .clients-right::after { width: 50px; }
          .clients-track img { height: 100px; }
        }
      `}</style>
    </section>
  );
}
