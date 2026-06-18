import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Props:
// onComplete: function() — chamado quando a animação de entrada termina
// Home.jsx controla quando montar/desmontar esse componente

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const brandRef = useRef(null);
  const topPanelRef = useRef(null);
  const botPanelRef = useRef(null);

  // Captura onComplete em ref para não re-disparar o useEffect quando o pai re-renderiza
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const brandName = 'LOADING';
    const brandEl = brandRef.current;
    if (!brandEl) return;

    // Montar letras no DOM
    brandEl.innerHTML = brandName
      .split('')
      .map(
        char =>
          `<span class="loader-char-wrap"><span class="loader-char">${char}</span></span>`
      )
      .join('');

    const chars = brandEl.querySelectorAll('.loader-char');
    gsap.set(chars, { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onCompleteRef.current) onCompleteRef.current();
        if (loaderRef.current) loaderRef.current.style.display = 'none';
      },
    });

    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.07,
      ease: 'back.out(1.7)',
      delay: 0.2,
    })
      .to(chars, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power4.in',
        delay: 0.6,
      })
      .to(topPanelRef.current, {
        yPercent: -100,
        duration: 0.7,
        ease: 'expo.inOut',
      })
      .to(
        botPanelRef.current,
        { yPercent: 100, duration: 0.7, ease: 'expo.inOut' },
        '<'
      )
      .to(loaderRef.current, { opacity: 0, duration: 0.2 }, '-=0.2');

    return () => {
      tl.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="loader" ref={loaderRef}>
      <div className="loader-bg-flash" />
      <div className="loader-panel top" ref={topPanelRef} />
      <div className="loader-panel bottom" ref={botPanelRef} />
      <div className="loader-brand" ref={brandRef} />

      <style>{`
        #loader {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100vh;
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          overflow: hidden;
          background: #0f1923;
        }
        .loader-bg-flash {
          position: absolute;
          width: 100%; height: 100%;
          background: var(--bg);
          opacity: 0;
          z-index: 1;
        }
        .loader-panel {
          position: absolute;
          width: 100%; height: 50vh;
          background: #0f1923;
          z-index: 0;
        }
        .loader-panel.top { top: 0; }
        .loader-panel.bottom { bottom: 0; }
        .loader-brand {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          gap: 0.4vw;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.4rem, 3.2vw, 2.8rem);
          font-weight: 700;
          letter-spacing: 0.3em;
          color: #fff;
          z-index: 3;
        }
        .loader-char-wrap {
          display: inline-block;
          overflow: hidden;
          padding: 0.2rem;
        }
        .loader-char {
          display: inline-block;
          transform-origin: center bottom;
          will-change: transform, opacity, color;
        }
      `}</style>
    </div>
  );
}
