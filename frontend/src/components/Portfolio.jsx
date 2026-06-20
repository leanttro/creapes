import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function toSlug(nome) {
  return (nome || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function Portfolio({ items = [], ready = true }) {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  function getSizeClass(loopIndex) {
    if (loopIndex % 3 === 0) return 'size-s';
    if (loopIndex % 2 === 0) return 'size-sq';
    return 'size-l';
  }

  function getWrapperAlignClass(loopIndex) {
    if (loopIndex % 3 === 0) return 'align-top';
    if (loopIndex % 2 === 0) return 'align-bottom';
    return 'align-center';
  }

  // GSAP só roda no desktop
  useEffect(() => {
    if (isMobile) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const scrollWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = scrollWidth - viewportWidth;

    const tween = gsap.to(track, {
      x: () => -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + scrollDistance,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [items, isMobile]);

  if (items.length === 0) return null;

  return (
    <section id="work" className={`portfolio-horizontal-wrapper${isMobile ? ' is-mobile' : ''}`} ref={sectionRef}>
      <div className="portfolio-sticky">
        <div className="portfolio-bg-animation"></div>
        <div className="portfolio-glow"></div>

        <div className="minimal-3d-bg">
          <div className="minimal-obj m-obj-1"></div>
          <div className="minimal-obj m-obj-2"></div>
          <div className="minimal-obj m-obj-3"></div>
        </div>

        <h2 className="portfolio-section-title fade-in">{t('portfolio.titulo')}</h2>

        <div className="portfolio-track" ref={trackRef}>
          {items.map((item, idx) => {
            const loopIndex = idx + 1;
            const sizeClass = getSizeClass(loopIndex);
            const wrapperAlignClass = getWrapperAlignClass(loopIndex);
            const captionParts = [item.descricao, item.ano].filter(Boolean);

            return (
              <PortfolioItem
                key={item.id}
                item={item}
                idx={idx}
                ready={ready}
                wrapperAlignClass={wrapperAlignClass}
                sizeClass={sizeClass}
                captionParts={captionParts}
                isMobile={isMobile}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        /* ── DESKTOP (sem alteração) ── */
        .portfolio-horizontal-wrapper {
          height: 100vh;
          position: relative;
          background: var(--bg);
          padding: 0;
          margin-bottom: 0;
        }

        .portfolio-sticky {
          position: relative;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .portfolio-bg-animation {
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 150px 150px;
          transform: perspective(1000px) rotateX(70deg) translateY(-150px) translateZ(-300px);
          animation: gridMovePortfolio 25s linear infinite;
          opacity: 0.5;
        }

        .portfolio-glow {
          position: absolute;
          width: 100%; height: 100vh;
          background: radial-gradient(ellipse at center, rgba(208, 255, 0, 0.12) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          animation: pulseBgGlowPortfolio 10s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes gridMovePortfolio {
          0% { background-position: 0 0; }
          100% { background-position: 0 300px; }
        }

        @keyframes pulseBgGlowPortfolio {
          0% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
        }

        .minimal-3d-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; pointer-events: none; z-index: 1; overflow: hidden; perspective: 1200px; }
        .minimal-obj { position: absolute; border-radius: 50%; transform-style: preserve-3d; }
        .m-obj-1 { width: 70vw; height: 70vw; border: 1px solid rgba(255, 255, 255, 0.03); top: -20%; left: -10%; animation: rotateAbstract1 60s linear infinite; }
        .m-obj-2 { width: 50vw; height: 50vw; border: 1px dashed rgba(255, 255, 255, 0.02); bottom: -20%; right: -10%; animation: rotateAbstract2 70s linear infinite; }
        .m-obj-3 { width: 30vw; height: 30vw; background: rgba(255, 255, 255, 0.01); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.04); top: 30%; left: 35%; animation: rotateAbstract3 40s linear infinite; }

        @keyframes rotateAbstract1 { 0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(-300px); } 100% { transform: rotateX(360deg) rotateY(180deg) rotateZ(360deg) translateZ(-300px); } }
        @keyframes rotateAbstract2 { 0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(-150px); } 100% { transform: rotateX(-180deg) rotateY(-360deg) rotateZ(180deg) translateZ(-150px); } }
        @keyframes rotateAbstract3 { 0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(-50px); } 100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg) translateZ(-50px); } }

        .phrase-quote-block {
          position: absolute; width: max-content; max-width: 25vw;
          font-family: 'Space Grotesk', sans-serif; color: rgba(255,255,255,0.8);
          font-size: clamp(1.2rem, 1.8vw, 2.5rem); line-height: 1.3;
          pointer-events: none; z-index: 100; padding-left: 1.5vw;
          border-left: 2px solid var(--accent); white-space: normal;
          text-transform: uppercase; text-shadow: 0px 4px 15px rgba(0,0,0,0.8);
        }

        .portfolio-section-title {
          position: absolute;
          top: 4rem; left: 4rem;
          z-index: 10;
          font-size: 2.5rem;
          opacity: 0.9;
          text-shadow: 0 4px 20px rgba(0,0,0,0.8);
        }

        .portfolio-track {
          display: flex;
          align-items: center;
          gap: 22vw;
          padding: 0 50vw 0 10vw;
          width: max-content;
          height: 80vh;
          margin-top: 10vh;
          z-index: 5;
          will-change: transform;
        }

        .port-wrapper.align-bottom { transform: translateY(28vh); }
        .port-wrapper.align-top { transform: translateY(-28vh); }
        .port-wrapper.align-center { transform: translateY(0); }

        .port-item {
          position: relative;
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;
          background: #111;
          cursor: pointer;
          box-shadow: 0 30px 60px rgba(0,0,0,0.7);
          opacity: 0.8;
          transition: opacity 0.5s var(--ease), transform 0.8s var(--ease), box-shadow 0.5s var(--ease);
        }

        .port-item:hover {
          opacity: 1;
          box-shadow: 0 40px 80px rgba(0,0,0,0.9);
        }

        .port-item video, .port-item .vimeo-port-bg {
          width: 100%; height: 100%;
          object-fit: contain;
          filter: grayscale(90%) contrast(1.2);
          transition: filter 0.8s var(--ease);
        }

        .port-item:hover video, .port-item:hover .vimeo-port-bg {
          filter: grayscale(0%) contrast(1);
        }

        .size-l { width: 22vw; aspect-ratio: 16/9; }
        .size-sq { width: 14vw; aspect-ratio: 16/9; }
        .size-s { width: 12vw; aspect-ratio: 16/9; }

        .port-info {
          position: absolute;
          bottom: -100%; left: 0; width: 100%;
          padding: 1.5rem;
          background: linear-gradient(to top, rgba(5,5,5,0.98), transparent);
          transition: bottom 0.5s var(--ease);
          border-bottom: 2px solid var(--accent);
          box-sizing: border-box;
          pointer-events: none;
        }

        .port-item:hover .port-info { bottom: 0; }
        .port-info h3 { font-size: 1.2rem; margin-bottom: 0.4rem; color: var(--accent); }

        .port-item-caption {
          position: absolute;
          bottom: 1rem; right: 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          pointer-events: none;
          z-index: 6;
          opacity: 0;
          transition: opacity 0.5s var(--ease);
        }

        .port-item:hover .port-item-caption { opacity: 1; }

        /* ── MOBILE: scroll horizontal nativo, sem GSAP, sem pin ── */
        @media (max-width: 900px) {
          /* Section vira altura auto — sem pin, sem 100vh travado */
          .portfolio-horizontal-wrapper.is-mobile {
            height: auto;
          }

          /* sticky vira container normal */
          .portfolio-horizontal-wrapper.is-mobile .portfolio-sticky {
            height: auto;
            overflow: visible;
            padding: 5rem 0 4rem;
          }

          /* track: scroll horizontal nativo com snap */
          .portfolio-horizontal-wrapper.is-mobile .portfolio-track {
            width: 100%;
            overflow-x: auto;
            overflow-y: visible;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            scrollbar-width: none;
            gap: 1.5rem;
            padding: 2rem 1.5rem 3rem;
            height: auto;
            margin-top: 0;
            align-items: center;
            will-change: unset;
          }

          .portfolio-horizontal-wrapper.is-mobile .portfolio-track::-webkit-scrollbar {
            display: none;
          }

          /* cards: tamanho fixo, alinhamento reto, sem translateY */
          .portfolio-horizontal-wrapper.is-mobile .port-wrapper {
            transform: none !important;
            flex-shrink: 0;
            scroll-snap-align: center;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.8rem;
          }

          /* quote vira texto normal abaixo do card */
          .portfolio-horizontal-wrapper.is-mobile .phrase-quote-block {
            position: static;
            transform: none;
            max-width: 72vw;
            width: 72vw;
            font-size: clamp(0.8rem, 3.5vw, 1.1rem);
            padding-left: 0.8rem;
            white-space: normal;
          }

          /* todos os tamanhos viram iguais no mobile */
          .portfolio-horizontal-wrapper.is-mobile .size-l,
          .portfolio-horizontal-wrapper.is-mobile .size-sq,
          .portfolio-horizontal-wrapper.is-mobile .size-s {
            width: 72vw;
            aspect-ratio: 16/9;
          }

          /* info fica sempre visível no mobile (sem hover) */
          .portfolio-horizontal-wrapper.is-mobile .port-info {
            bottom: 0;
          }

          .portfolio-horizontal-wrapper.is-mobile .port-item-caption {
            opacity: 1;
          }

          /* título */
          .portfolio-horizontal-wrapper.is-mobile .portfolio-section-title {
            position: relative;
            top: auto; left: auto;
            padding: 0 1.5rem;
            margin-bottom: 0.5rem;
            font-size: 1.8rem;
          }
        }
      `}</style>
    </section>
  );
}

function PortfolioItem({ item, idx, ready, wrapperAlignClass, sizeClass, captionParts, isMobile }) {
  const itemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      {
        root: null,
        rootMargin: '0px 50% 0px 50%',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Igual ao Hero: idx 0 carrega assim que ready=true (sem esperar o IntersectionObserver),
  // os demais só montam quando entram no viewport via isVisible.
  const shouldLoad = ready && (idx === 0 || isVisible);

  return (
    <div
      className={`port-wrapper ${wrapperAlignClass}`}
      style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}
    >
      {/* No mobile o quote fica abaixo do card (order via flex-direction column no CSS) */}
      {!isMobile && item.descricao && (
        <div
          className="phrase-quote-block"
          style={{
            left: 'calc(100% + 2.5vw)',
            top: '50%',
            transform: 'translateY(-50%)',
            textAlign: 'left',
          }}
        >
          {item.descricao}
        </div>
      )}

      <div
        ref={itemRef}
        className={`port-item ${sizeClass}`}
        onClick={() => { window.location.href = `/case/${toSlug(item.nome)}`; }}
      >
        {shouldLoad && item.isVimeo && item.bgLink ? (
          <div
            className="vimeo-port-bg"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}
          >
            <iframe
              title={`port-vimeo-${item.id}`}
              src={`${item.bgLink}${item.bgLink.includes('?') ? '&' : '?'}background=1&autoplay=1&loop=1&muted=1&autopause=0`}
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, border: 'none', pointerEvents: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
            />
          </div>
        ) : (
          shouldLoad && !item.isVimeo && item.bgLink && (
            <video src={item.bgLink} autoPlay loop muted playsInline style={{ pointerEvents: 'none' }} />
          )
        )}

        <div className="port-info">
          <h3>{item.nome}</h3>
        </div>
        <div className="port-item-caption">{captionParts.join(' | ')}</div>
      </div>

      {/* No mobile o quote aparece abaixo do card */}
      {isMobile && item.descricao && (
        <div className="phrase-quote-block">
          {item.descricao}
        </div>
      )}
    </div>
  );
}
