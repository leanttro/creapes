import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Portfolio — seção de scroll horizontal "cinematográfico": a section
 * inteira fica pinada (pin: true) enquanto o usuário rola verticalmente,
 * e esse scroll é traduzido em translateX na track (scrub: 1), exatamente
 * como o gsap.to(portfolioTrack, { x: -scrollDistance, scrollTrigger: {...} })
 * do original.
 *
 * Dados: no HTML, `port_videos` vinha do Jinja filtrando produtos da
 * categoria "portfolio". Aqui chega como prop `items` (ver portfolioItems
 * em lib/api.js). O padrão de tamanho/alinhamento alternado
 * (size-l/size-sq/size-s, align-top/center/bottom, translateY do
 * nth-child) é recalculado em JS a partir do índice, replicando a mesma
 * regra de "loop.index % 3 == 0", "% 2 == 0" etc do original.
 *
 * Fidelidade ao ScrollTrigger original:
 * - trigger: a própria section (.portfolio-horizontal-wrapper)
 * - start: 'top top', end: dinâmico (+= scrollDistance)
 * - pin: true, scrub: 1, anticipatePin: 1
 * - scrollDistance = track.scrollWidth - viewportWidth (calculado depois
 *   do layout estar montado, igual ao original que roda no <script> ao
 *   final do body).
 *
 * Cleanup: o ScrollTrigger criado é killado no unmount para não duplicar
 * pins ao desmontar/remontar o componente (ex: hot reload, navegação).
 *
 * FIX DE PERFORMANCE (corrigido agora):
 * - Antes: TODOS os itens do portfólio montavam seu iframe do Vimeo com
 *   autoplay=1 de uma vez só, mesmo os que estavam fora da área visível
 *   (o scroll horizontal pinado só move a track via transform, então
 *   "fora da tela" não significa "fora do DOM"). Isso somava aos players
 *   já tocando no Hero, multiplicando requests/xhr e travando a navegação.
 * - Agora: cada port-item usa IntersectionObserver pra só montar o
 *   iframe/video quando o card entra (ou está próximo) da viewport, e
 *   desmonta quando sai. Como o scroll é horizontal via transform, o
 *   threshold/rootMargin do observer funciona normalmente (ele observa
 *   a posição real do elemento na tela, não a posição no fluxo do DOM).
 */
export default function Portfolio({ items = [] }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Define tamanho e alinhamento de cada item seguindo a mesma regra
  // de módulo usada no Jinja original (loop.index começa em 1).
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

  function getQuoteSide(loopIndex) {
    // even -> quote à esquerda do item (right: 100%); odd -> à direita (left: 100%)
    return loopIndex % 2 === 0 ? 'left' : 'right';
  }

  function getQuoteVerticalStyle(loopIndex) {
    if (loopIndex % 3 === 0) return { top: '10vh' };
    if (loopIndex % 2 === 0) return { bottom: '10vh' };
    return { top: '50%', transform: 'translateY(-50%)' };
  }

  useEffect(() => {
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
      // Mata o ScrollTrigger associado e o tween para não deixar pin
      // fantasma se o componente for desmontado/remontado.
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section id="work" className="portfolio-horizontal-wrapper" ref={sectionRef}>
      <div className="portfolio-sticky">
        <div className="portfolio-bg-animation"></div>
        <div className="portfolio-glow"></div>

        <div className="minimal-3d-bg">
          <div className="minimal-obj m-obj-1"></div>
          <div className="minimal-obj m-obj-2"></div>
          <div className="minimal-obj m-obj-3"></div>
        </div>

        <h2 className="portfolio-section-title fade-in">Selected Work</h2>

        <div className="portfolio-track" ref={trackRef}>
          {items.map((item, idx) => {
            const loopIndex = idx + 1; // equivalente a loop.index (1-based) do Jinja
            const sizeClass = getSizeClass(loopIndex);
            const wrapperAlignClass = getWrapperAlignClass(loopIndex);
            const quoteSide = getQuoteSide(loopIndex);
            const quoteVerticalStyle = getQuoteVerticalStyle(loopIndex);

            const captionParts = [item.descricao, item.ano].filter(Boolean);

            return (
              <PortfolioItem
                key={item.id}
                item={item}
                wrapperAlignClass={wrapperAlignClass}
                sizeClass={sizeClass}
                quoteSide={quoteSide}
                quoteVerticalStyle={quoteVerticalStyle}
                captionParts={captionParts}
              />
            );
          })}
        </div>
      </div>

      <style>{`
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
          gap: 10vw;
          padding: 0 50vw 0 10vw;
          width: max-content;
          height: 80vh;
          margin-top: 10vh;
          z-index: 5;
          will-change: transform;
        }

        .port-wrapper.align-bottom { transform: translateY(18vh); }
        .port-wrapper.align-top { transform: translateY(-18vh); }
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
          bottom: 1rem;
          right: 1rem;
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

        .port-item:hover .port-item-caption {
          opacity: 1;
        }

        @media (max-width: 900px) {
          .portfolio-track { gap: 20vw; height: 60vh; margin-top: 15vh; padding: 0 60vw 0 10vw; }
          .size-l, .size-sq, .size-s { width: 50vw; }
        }
      `}</style>
    </section>
  );
}

/**
 * PortfolioItem — extraído em componente próprio só para poder usar
 * IntersectionObserver individual por card (precisa de uma ref por item).
 * Estrutura visual/classes idênticas à versão anterior; a única mudança
 * de comportamento é o gate "isVisible" controlando se o iframe/video
 * é montado ou não.
 */
function PortfolioItem({ item, wrapperAlignClass, sizeClass, quoteSide, quoteVerticalStyle, captionParts }) {
  const itemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        root: null,
        // rootMargin generoso na horizontal: como o scroll é via transform,
        // isso garante que o vídeo já comece a carregar um pouco antes de
        // entrar 100% na tela (evita "pop-in" do vídeo).
        rootMargin: '0px 50% 0px 50%',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`port-wrapper ${wrapperAlignClass}`}
      style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}
    >
      {item.descricao && (
        <div
          className="phrase-quote-block"
          style={{
            [quoteSide === 'left' ? 'right' : 'left']: 'calc(100% + 3vw)',
            textAlign: 'left',
            ...quoteVerticalStyle,
          }}
        >
          {item.descricao}
        </div>
      )}

      <div
        ref={itemRef}
        className={`port-item ${sizeClass}`}
        onClick={() => {
          window.location.href = `/case/${item.id}`;
        }}
      >
        {isVisible && item.isVimeo && item.bgLink ? (
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
          isVisible && !item.isVimeo && item.bgLink && (
            <video src={item.bgLink} autoPlay loop muted playsInline style={{ pointerEvents: 'none' }} />
          )
        )}

        <div className="port-info">
          <h3>{item.nome}</h3>
        </div>
        <div className="port-item-caption">{captionParts.join(' | ')}</div>
      </div>
    </div>
  );
}
