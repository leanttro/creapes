import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Evolve.css';

const PHRASES = [
  { id: 1, text: 'VAMOS EVOLUIR JUNTOS', className: 'phrase-1' },
  { id: 2, text: "LET'S EVOLVE TOGETHER", className: 'phrase-2' },
  { id: 3, text: 'ÉVOLUONS ENSEMBLE', className: 'phrase-3' },
  { id: 4, text: '让我们一起努力', className: 'phrase-4' },
];

export default function Evolve({
  ready = false,
  bgVideoSrc = 'https://res.cloudinary.com/dzcaxmbjn/video/upload/v1772571265/dynamic-ink-blots-symbolizing-movement-and-fluidit-2026-01-28-04-31-04-utc_eqom6l.mp4',
}) {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const flashRef = useRef(null);
  const spotlightRef = useRef(null);
  const phraseRefs = useRef([]);
  const curtainTopRef = useRef(null);
  const curtainBotRef = useRef(null);
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
            void flashBang.offsetWidth;
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
          phrase.className = i === 0
            ? `evolve-phrase phrase-${i + 1} active`
            : `evolve-phrase phrase-${i + 1}`;
        });
      } else if (rect.bottom < windowHeight) {
        evolveLastIndexRef.current = 3;
        evolvePhrases.forEach((phrase, i) => {
          phrase.className = i === 3
            ? `evolve-phrase phrase-${i + 1} active`
            : `evolve-phrase phrase-${i + 1} passed`;
        });
      }
    }

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

    calcScroll();
    updateEvolveCurtain();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

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

    const cleanupScatter = [];
    evolvePhrases.forEach((phrase) => {
      const hoverText = phrase.querySelector('.hover-move');
      if (!hoverText) return;

      const originalText = hoverText.dataset.original || hoverText.textContent.trim();
      hoverText.dataset.original = originalText;
      hoverText.innerHTML = originalText
        .split('')
        .map((char) =>
          char === ' '
            ? '<span class="char">&nbsp;</span>'
            : `<span class="char">${char}</span>`
        )
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
          x: 0, y: 0, z: 0,
          rotationX: 0, rotationY: 0, rotationZ: 0,
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
      if (evolveSticky) {
        evolveSticky.querySelectorAll('.hover-move').forEach((el) => gsap.killTweensOf(el));
      }
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    let id1, id2;
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        const firstPhrase = phraseRefs.current[0];
        if (!firstPhrase) return;
        firstPhrase.classList.remove('active');
        void firstPhrase.offsetWidth;
        firstPhrase.classList.add('active');
      });
    });

    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [ready]);

  return (
    <>
      {/* Cortinas fixas letterbox */}
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
          <div className="evolve-overlay" />
          <div className="flash-bang" ref={flashRef} />
          <div className="evolve-spotlight" ref={spotlightRef} />

          <div className="evolve-texts">
            {PHRASES.map((phrase, index) => (
              <h2
                key={phrase.id}
                ref={(el) => (phraseRefs.current[index] = el)}
                className={`evolve-phrase ${phrase.className}${index === 0 ? ' active' : ''}`}
              >
                <span className="hover-move">{phrase.text}</span>
              </h2>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
