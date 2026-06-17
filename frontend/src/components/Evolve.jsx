import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Evolve — seção de transição com vídeo de fundo fixo (sticky), 4 frases
 * (PT/EN/FR/ZH) que trocam conforme o progresso de scroll dentro da
 * seção, cortinas pretas tipo letterbox, flash-bang entre trocas,
 * spotlight que segue o mouse, e scatter de caracteres no hover da
 * frase ativa.
 *
 * Fidelidade ao original:
 * - calcScroll(): mesma matemática de progress (rect.top / totalScroll)
 *   e os mesmos 4 blocos de 25% para decidir activeIndex.
 * - updateEvolveCurtain(): mesmas cortinas fixas no body via portal-like
 *   posicionamento (aqui via ref direto no DOM, criado/destruído pelo
 *   próprio componente).
 * - Scatter de caracteres: mesmo gsap.to com x/y/z random, rotationX/Y/Z
 *   random, stagger from "center", nas mesmas durações/eases.
 * - mousemove paralaxe (.hover-move) com depth 0.08, mesmo cálculo.
 *
 * Regras de performance aplicadas:
 * - Scroll listener throttled via requestAnimationFrame (rAF flag),
 *   nunca executando o cálculo pesado direto no evento de scroll.
 * - Todos os listeners (scroll, resize, mousemove, mouseenter/leave)
 *   são removidos no cleanup do useEffect.
 * - O vídeo de fundo é leve (sem Three.js aqui), mas o componente só
 *   ativa os listeners de mousemove enquanto a seção existe no DOM;
 *   como é renderizado sempre visível na Home (seção de narrativa
 *   central, não condicional), não há lazy-mount aqui — lazy-mount
 *   pesado fica reservado para Trailer3D/InstagramFeed.
 */

const PHRASES = [
  { id: 1, text: 'VAMOS EVOLUIR JUNTOS', className: 'phrase-1' },
  { id: 2, text: "LET'S EVOLVE TOGETHER", className: 'phrase-2' },
  { id: 3, text: 'ÉVOLUONS ENSEMBLE', className: 'phrase-3' },
  { id: 4, text: '让我们一起努力', className: 'phrase-4' },
];

export default function Evolve({
  bgVideoSrc = 'https://res.cloudinary.com/dzcaxmbjn/video/upload/v1772571265/dynamic-ink-blots-symbolizing-movement-and-fluidit-2026-01-28-04-31-04-utc_eqom6l.mp4',
}) {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const flashRef = useRef(null);
  const spotlightRef = useRef(null);
  const phraseRefs = useRef([]);
  const curtainTopRef = useRef(null);
  const curtainBotRef = useRef(null);

  // Estado mutável fora do React (não precisa re-render por frame de scroll)
  const evolveLastIndexRef = useRef(-1);
  const rafScheduledRef = useRef(false);

  useEffect(() => {
    const evolveSection = wrapperRef.current;
    const evolveSticky = stickyRef.current;
    const flashBang = flashRef.current;
    const evolvePhrases = phraseRefs.current.filter(Boolean);
    const curtainTop = curtainTopRef.current;
    const curtainBot = curtainBotRef.current;
    const evolveSpotlightEl = spotlightRef.current;

    if (!evolveSection) return;

    // ── 1. Cálculo de progresso de scroll → frase ativa (mesma matemática do original) ──
    function calcScroll() {
      const windowHeight = window.innerHeight;
      const rect = evolveSection.getBoundingClientRect();

      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const totalScroll = rect.height - windowHeight;
        const currentScroll = -rect.top;
        const progress = currentScroll / totalScroll;

        let activeIndex = 0;
        if (progress > 0.75) activeIndex = 3;
        else if (progress > 0.5) activeIndex = 2;
        else if (progress > 0.25) activeIndex = 1;
        else activeIndex = 0;

        if (activeIndex !== evolveLastIndexRef.current) {
          if (flashBang && evolveLastIndexRef.current !== -1) {
            flashBang.classList.remove('fire');
            // eslint-disable-next-line no-unused-expressions
            flashBang.offsetWidth; // força reflow, igual ao void original
            flashBang.classList.add('fire');
          }
          evolveLastIndexRef.current = activeIndex;
        }

        evolvePhrases.forEach((phrase, index) => {
          if (index === activeIndex) {
            phrase.className = `evolve-phrase phrase-${index + 1} active`;
          } else if (index < activeIndex) {
            phrase.className = `evolve-phrase phrase-${index + 1} passed`;
          } else {
            phrase.className = `evolve-phrase phrase-${index + 1}`;
          }
        });
      } else if (rect.top > 0) {
        evolveLastIndexRef.current = -1;
        evolvePhrases.forEach((phrase, i) => {
          phrase.className = i === 0 ? `evolve-phrase phrase-${i + 1} active` : `evolve-phrase phrase-${i + 1}`;
        });
      } else if (rect.bottom < windowHeight) {
        evolveLastIndexRef.current = 3;
        evolvePhrases.forEach((phrase, i) => {
          phrase.className = i === 3 ? `evolve-phrase phrase-${i + 1} active` : `evolve-phrase phrase-${i + 1} passed`;
        });
      }
    }

    // ── 2. Cortinas tipo letterbox (mesma lógica do original) ──
    function updateEvolveCurtain() {
      if (!curtainTop || !curtainBot) return;
      const rect = evolveSection.getBoundingClientRect();
      const inSection = rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (inSection) {
        curtainTop.style.transform = 'translateY(56%)';
        curtainBot.style.transform = 'translateY(-56%)';
      } else {
        curtainTop.style.transform = 'translateY(0%)';
        curtainBot.style.transform = 'translateY(0%)';
      }
    }

    // ── REGRA DE PERFORMANCE: throttle do scroll via requestAnimationFrame ──
    function onScroll() {
      if (rafScheduledRef.current) return;
      rafScheduledRef.current = true;
      requestAnimationFrame(() => {
        calcScroll();
        updateEvolveCurtain();
        rafScheduledRef.current = false;
      });
    }

    function onResize() {
      calcScroll();
      updateEvolveCurtain();
    }

    // Cálculo inicial (equivalente ao window.addEventListener('load', ...))
    calcScroll();
    updateEvolveCurtain();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // ── 3. Paralaxe do texto (.hover-move) seguindo o mouse ──
    function onMouseMoveParallax(e) {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const depth = 0.08;
      const moveX = (clientX - centerX) * depth;
      const moveY = (clientY - centerY) * depth;

      const hoverMoves = evolveSticky.querySelectorAll('.hover-move');
      hoverMoves.forEach((text) => {
        gsap.to(text, { x: moveX, y: moveY, duration: 1, ease: 'power2.out' });
      });
    }

    // ── 4. Spotlight seguindo o mouse ──
    function onMouseMoveSpotlight(e) {
      if (!evolveSpotlightEl) return;
      const rect = evolveSticky.getBoundingClientRect();
      evolveSpotlightEl.style.left = `${e.clientX - rect.left}px`;
      evolveSpotlightEl.style.top = `${e.clientY - rect.top}px`;
    }
    function onMouseEnterSpotlight() {
      if (evolveSpotlightEl) evolveSpotlightEl.style.opacity = '1';
    }
    function onMouseLeaveSpotlight() {
      if (evolveSpotlightEl) evolveSpotlightEl.style.opacity = '0';
    }

    if (evolveSticky) {
      evolveSticky.addEventListener('mousemove', onMouseMoveParallax);
      evolveSticky.addEventListener('mousemove', onMouseMoveSpotlight);
      evolveSticky.addEventListener('mouseenter', onMouseEnterSpotlight);
      evolveSticky.addEventListener('mouseleave', onMouseLeaveSpotlight);
    }

    // ── 5. Scatter de caracteres no hover de cada frase ativa ──
    // Quebra cada frase em <span class="char"> (igual ao split('') original)
    const cleanupScatter = [];

    evolvePhrases.forEach((phrase) => {
      const hoverText = phrase.querySelector('.hover-move');
      if (!hoverText) return;

      const originalText = hoverText.dataset.original || hoverText.innerText;
      hoverText.dataset.original = originalText;
      hoverText.innerHTML = originalText
        .split('')
        .map((char) => (char === ' ' ? '<span class="char">&nbsp;</span>' : `<span class="char">${char}</span>`))
        .join('');

      const chars = hoverText.querySelectorAll('.char');

      function onEnter() {
        if (!phrase.classList.contains('active')) return;
        gsap.killTweensOf(chars);
        gsap.to(chars, {
          opacity: 0,
          x: () => `random(-150, 150)`,
          y: () => `random(-150, 150)`,
          z: () => `random(-50, 150)`,
          rotationX: () => `random(-360, 360)`,
          rotationY: () => `random(-360, 360)`,
          rotationZ: () => `random(-360, 360)`,
          duration: 1.2,
          stagger: { amount: 0.15, from: 'center' },
          ease: 'power2.out',
        });
      }

      function onLeave() {
        gsap.killTweensOf(chars);
        gsap.to(chars, {
          opacity: 1,
          x: 0,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          duration: 1.5,
          stagger: { amount: 0.15, from: 'center' },
          ease: 'expo.out',
        });
      }

      phrase.addEventListener('mouseenter', onEnter);
      phrase.addEventListener('mouseleave', onLeave);
      cleanupScatter.push(() => {
        phrase.removeEventListener('mouseenter', onEnter);
        phrase.removeEventListener('mouseleave', onLeave);
        gsap.killTweensOf(chars);
      });
    });

    // ── CLEANUP: remove todos os listeners e cancela tweens pendentes ──
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (evolveSticky) {
        evolveSticky.removeEventListener('mousemove', onMouseMoveParallax);
        evolveSticky.removeEventListener('mousemove', onMouseMoveSpotlight);
        evolveSticky.removeEventListener('mouseenter', onMouseEnterSpotlight);
        evolveSticky.removeEventListener('mouseleave', onMouseLeaveSpotlight);
      }
      cleanupScatter.forEach((fn) => fn());
      gsap.killTweensOf(evolveSticky?.querySelectorAll('.hover-move'));
    };
  }, []);

  return (
    <>
      {/* Cortinas fixas (letterbox) — equivalentes às divs soltas no body original */}
      <div
        ref={curtainTopRef}
        style={{
          position: 'fixed', top: '-50%', left: 0, width: '100%', height: '50%',
          background: '#000', zIndex: 9998, pointerEvents: 'none',
          transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
      <div
        ref={curtainBotRef}
        style={{
          position: 'fixed', bottom: '-50%', left: 0, width: '100%', height: '50%',
          background: '#000', zIndex: 9998, pointerEvents: 'none',
          transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      <div className="evolve-wrapper" ref={wrapperRef}>
        <div className="evolve-sticky" ref={stickyRef}>
          <div className="evolve-bg-video">
            <video autoPlay loop muted playsInline>
              <source src={bgVideoSrc} type="video/mp4" />
            </video>
          </div>
          <div className="evolve-overlay"></div>
          <div className="flash-bang" ref={flashRef}></div>
          <div className="evolve-spotlight" ref={spotlightRef}></div>

          <div className="evolve-texts">
            {PHRASES.map((phrase, index) => (
              <h2
                key={phrase.id}
                ref={(el) => (phraseRefs.current[index] = el)}
                className={`evolve-phrase ${phrase.className} ${index === 0 ? 'active' : ''}`}
              >
                <span className="hover-move">{phrase.text}</span>
              </h2>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .evolve-wrapper { height: 320vh; position: relative; background: var(--bg); }
        .evolve-sticky {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .evolve-bg-video {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;
        }
        .evolve-bg-video video {
          width: 100%; height: 100%; object-fit: cover;
        }
        .evolve-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,5,5,0.65); z-index: 2;
        }
        .flash-bang {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: #fff; opacity: 0; z-index: 3; pointer-events: none; mix-blend-mode: overlay;
        }
        .flash-bang.fire {
          animation: bang 0.4s cubic-bezier(0.1, 1, 0.2, 1);
        }
        @keyframes bang {
          0% { opacity: 1; filter: brightness(3); }
          100% { opacity: 0; filter: brightness(1); }
        }

        .evolve-spotlight {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
          background: radial-gradient(circle, rgba(208, 255, 0, 0.25) 0%, transparent 60%);
          mix-blend-mode: screen;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s var(--ease);
          will-change: left, top;
        }

        .evolve-texts {
          position: relative; z-index: 4; width: 100%; height: clamp(4rem, 8vw, 8rem);
          display: flex; justify-content: center; align-items: center; perspective: 1000px;
        }
        .evolve-phrase {
          position: absolute; width: 100%; text-align: center;
          font-size: clamp(2.5rem, 5vw, 6rem);
          opacity: 0;
          color: var(--text);
          text-shadow: 0 4px 30px rgba(0,0,0,1);
          margin: 0; pointer-events: none;
        }
        .evolve-phrase.active { pointer-events: all !important; cursor: default; }

        .hover-move {
          display: inline-block;
          will-change: transform;
        }
        .hover-move .char { display: inline-block; will-change: transform, opacity; }

        .phrase-1.active { animation: flashStrikeIn 0.5s cubic-bezier(0.1, 1, 0.2, 1) forwards; color: var(--accent); }
        .phrase-1.passed { animation: flashStrikeOut 0.3s forwards; }

        .phrase-2.active { animation: glitchStrikeIn 0.6s cubic-bezier(0.1, 1, 0.2, 1) forwards; color: #fff; text-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent); }
        .phrase-2.passed { animation: glitchStrikeOut 0.3s forwards; }

        .phrase-3.active { animation: blurStrikeIn 0.5s ease-out forwards; color: var(--accent); }
        .phrase-3.passed { animation: blurStrikeOut 0.3s forwards; }

        .phrase-4.active { animation: electricStrikeIn 0.5s forwards; color: #fff; text-shadow: 0 0 10px #fff; }
        .phrase-4.passed { animation: electricStrikeOut 0.3s forwards; }

        @keyframes flashStrikeIn {
          0% { opacity: 0; transform: scale(3) translateZ(200px); filter: brightness(10) blur(20px); }
          50% { opacity: 1; filter: brightness(5) blur(0px); }
          100% { opacity: 1; transform: scale(1) translateZ(0); filter: brightness(1) blur(0px); }
        }
        @keyframes flashStrikeOut {
          0% { opacity: 1; transform: scale(1); filter: brightness(1); }
          100% { opacity: 0; transform: scale(0.5) translateY(-100px); filter: brightness(5) blur(10px); }
        }

        @keyframes glitchStrikeIn {
          0% { opacity: 0; transform: skewX(-40deg) scale(1.5); filter: brightness(10); clip-path: polygon(0 0, 100% 0, 100% 10%, 0 10%); }
          15% { opacity: 1; transform: skewX(30deg) scale(1.3); clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); filter: brightness(5); }
          30% { transform: skewX(-20deg) scale(1.1); clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%); }
          45% { transform: skewX(10deg) scale(1.05); clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
          60% { transform: skewX(0deg) scale(1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); filter: brightness(3); }
          100% { opacity: 1; transform: skewX(0deg) scale(1); filter: brightness(1); clip-path: none; }
        }
        @keyframes glitchStrikeOut {
          0% { opacity: 1; transform: scale(1); filter: brightness(1); }
          50% { opacity: 1; transform: skewX(20deg) scale(1.2); filter: brightness(5); }
          100% { opacity: 0; transform: skewX(-40deg) scale(0.2) translateY(-100px); filter: brightness(10); }
        }

        @keyframes blurStrikeIn {
          0% { opacity: 0; transform: translateX(200px) scale(2); filter: blur(30px) brightness(5); letter-spacing: 40px; }
          100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px) brightness(1); letter-spacing: -0.02em; }
        }
        @keyframes blurStrikeOut {
          0% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px) brightness(1); }
          100% { opacity: 0; transform: translateX(-200px) scale(0.5); filter: blur(30px) brightness(5); letter-spacing: -20px; }
        }

        @keyframes electricStrikeIn {
          0% { opacity: 0; filter: contrast(10) brightness(10) invert(1); transform: scale(1.5); }
          10% { opacity: 1; filter: contrast(1) brightness(1) invert(0); }
          20% { opacity: 0; filter: contrast(10) brightness(10) invert(1); transform: scale(1.2); }
          30% { opacity: 1; filter: contrast(1) brightness(1) invert(0); }
          40% { opacity: 0; filter: contrast(5) brightness(5); }
          100% { opacity: 1; transform: scale(1); filter: none; }
        }
        @keyframes electricStrikeOut {
          0% { opacity: 1; transform: scale(1); }
          10% { opacity: 0; filter: brightness(10); }
          20% { opacity: 1; filter: brightness(1); }
          100% { opacity: 0; transform: scale(3); filter: blur(20px) brightness(5); }
        }
      `}</style>
    </>
  );
}
