import { useState } from 'react';

/**
 * Hero — seção full-screen com carrossel de slides (vídeo de fundo)
 * e lista de títulos lateral inferior, igual ao original.
 *
 * No HTML original, `hero_videos` era filtrado em Jinja a partir de
 * `produtos` cuja categoria contivesse "hero". Aqui isso já chega
 * pronto via prop `slides` (ver valores de exemplo em lib/api.js ->
 * heroSlides), e o componente apenas itera.
 *
 * goToSlide() existia como função global no <script> solto; agora é
 * state local (currentSlide) trocado no onMouseEnter de cada título,
 * exatamente como o onmouseenter="goToSlide(i)" original.
 *
 * O clique no slide ou no título navegava para `/case/{{ p.id }}`;
 * aqui vira navegação simples via window.location, já que ainda não
 * há router instalado neste passo (App.jsx cuida disso depois).
 */
export default function Hero({ slides = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index) => {
    if (index === currentSlide) return;
    setCurrentSlide(index);
  };

  const goToCase = (caseId) => {
    window.location.href = `/case/${caseId}`;
  };

  if (slides.length === 0) return null;

  return (
    <header className="hero" id="hero">
      {slides.map((slide, index) => (
        <div key={slide.id} className={`slide ${index === currentSlide ? 'active' : ''}`}>
          {slide.isVimeo ? (
            <div
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                overflow: 'hidden', zIndex: -1, pointerEvents: 'none',
              }}
            >
              <iframe
                title={`bg-vimeo-${slide.id}`}
                src={`${slide.bgVideo}${slide.bgVideo.includes('?') ? '&' : '?'}background=1&autoplay=1&loop=1&muted=1&autopause=0`}
                style={{
                  width: '100%', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh',
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%) translateZ(0)',
                  backfaceVisibility: 'hidden', border: 'none',
                  filter: 'brightness(0.6)', pointerEvents: 'none',
                }}
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
          ) : (
            slide.bgVideo && (
              <video
                src={slide.bgVideo}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  position: 'absolute', top: 0, left: 0, zIndex: -1,
                  filter: 'brightness(0.6)', pointerEvents: 'none',
                }}
              />
            )
          )}

          <div className="play-link" onClick={() => goToCase(slide.caseId)}></div>
        </div>
      ))}

      <div className="hero-titles-list">
        {slides.map((slide, index) => (
          <h1
            key={slide.id}
            className={`hero-title-item ${index === currentSlide ? 'active' : ''}`}
            onMouseEnter={() => goToSlide(index)}
            onClick={() => goToCase(slide.caseId)}
          >
            {slide.nome} <span className="year">{slide.ano}</span>
          </h1>
        ))}
      </div>

      <style>{`
        .hero {
          height: 100vh;
          position: relative;
          overflow: hidden;
          background-color: var(--bg);
        }

        .slide {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 1.2s var(--ease);
          will-change: opacity;
          backface-visibility: hidden;
          z-index: 1;
        }

        .slide.active {
          opacity: 1;
          z-index: 2;
        }

        .play-link {
          display: block; width: 100%; height: 100%; position: relative; cursor: pointer;
        }

        .hero-titles-list {
          position: absolute;
          bottom: 4rem;
          left: 4rem;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .hero-title-item {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          color: rgba(245, 245, 247, 0.4);
          cursor: pointer;
          transition: all 0.3s var(--ease);
          line-height: 1;
          letter-spacing: -0.03em;
          margin: 0;
          display: inline-flex;
          align-items: flex-start;
        }

        .hero-title-item.active, .hero-title-item:hover {
          color: var(--text);
        }

        .hero-title-item .year {
          font-size: 0.8rem;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0;
          margin-left: 0.8rem;
          margin-top: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .hero-title-item.active .year, .hero-title-item:hover .year {
          opacity: 1;
        }

        @media (max-width: 900px) {
          .hero-titles-list { left: 2rem; bottom: 3rem; }
        }
      `}</style>
    </header>
  );
}
