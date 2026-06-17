import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Trailer3D — seção com cena Three.js de 500 cubos flutuantes, câmera
 * que avança conforme o scroll, e dois "steps" de conteúdo (showreel ->
 * call to action) que fazem cross-fade também conforme o scroll.
 *
 * Fidelidade ao original (r128 puro):
 * - 500 cubos com THREE.BoxGeometry(1,1,1) + MeshStandardMaterial,
 *   85% cor escura aleatória (#222/#111), 15% cor de destaque (#d0ff00).
 * - FogExp2(0x050505, 0.012), AmbientLight, DirectionalLight,
 *   PointLight pulsante (intensity = 1.5 + sin(t*2)).
 * - cameraC.position.z anima de 40 até -60 (40 - scrollPercent*100)
 *   conforme o scroll dentro da seção (350vh de altura, sticky no topo).
 *   cubesGroup roda em Y e Z proporcional ao scroll.
 * - step-1 (showreel/iframe) e step-2 (CTA) cross-fade exatamente nos
 *   mesmos thresholds de scrollPercent (0.5 é o ponto de troca).
 * - Cada cubo individualmente gira e flutua (sin(time+i)) no loop de
 *   animação, mesma fórmula do original.
 *
 * REGRAS DE PERFORMANCE (obrigatórias) aplicadas aqui:
 * 1. IntersectionObserver pausa o requestAnimationFrame quando a seção
 *    sai da viewport (isInViewRef) — o loop simplesmente não agenda o
 *    próximo frame enquanto fora de vista, e retoma quando volta.
 * 2. renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) —
 *    nunca usa o devicePixelRatio puro.
 * 3. O listener de scroll roda via requestAnimationFrame throttle
 *    (rafScheduledRef), nunca executando a lógica pesada (cálculo de
 *    câmera/opacidade) direto no evento de scroll.
 * 4. Lazy loading: a cena Three.js (geometrias, materiais, renderer)
 *    só é inicializada quando a seção está perto da viewport — usamos
 *    um segundo IntersectionObserver com rootMargin para "montar" a
 *    cena só quando o usuário está perto, evitando custo de WebGL
 *    upfront em quem nunca rola até lá.
 * 5. Cleanup completo no retorno do useEffect: cancelAnimationFrame,
 *    removeEventListener (scroll/resize), disconnect dos observers, e
 *    dispose de geometrias/materiais/renderer do Three.js para não
 *    vazar memória de GPU ao desmontar.
 */
export default function Trailer3D({
  vimeoEmbedUrl = 'https://player.vimeo.com/video/1176338391?h=9316747c6c&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0',
}) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  // Controla quando a cena pesada deve ser montada (lazy load por proximidade)
  const [shouldMount, setShouldMount] = useState(false);

  // ── Lazy mount: observa a seção com margem generosa, só ativa a cena 3D
  // quando o usuário está perto de chegar nela. ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mountObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldMount(true);
            mountObserver.disconnect();
          }
        });
      },
      { rootMargin: '50% 0px 50% 0px', threshold: 0 }
    );

    mountObserver.observe(section);
    return () => mountObserver.disconnect();
  }, []);

  // ── Cena Three.js: só roda depois que shouldMount vira true ──
  useEffect(() => {
    if (!shouldMount) return;

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const step1 = step1Ref.current;
    const step2 = step2Ref.current;
    if (!section || !canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.012);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // REGRA DE PERFORMANCE 2: nunca usar devicePixelRatio puro, cap em 2.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const cubesGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = []; // guardamos para dispose no cleanup

    for (let i = 0; i < 500; i++) {
      const isAccent = Math.random() > 0.85;
      let cubeColor;

      if (isAccent) {
        cubeColor = 0xd0ff00;
      } else {
        cubeColor = Math.random() > 0.5 ? 0x222222 : 0x111111;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: cubeColor,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: isAccent ? 0.8 : 0.6,
      });
      materials.push(mat);

      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 150
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const scale = Math.random() * 2.5 + 0.5;
      mesh.scale.set(scale, scale, scale);

      cubesGroup.add(mesh);
    }
    scene.add(cubesGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 20, 10);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0xd0ff00, 3, 150);
    accentLight.position.set(0, 0, 20);
    scene.add(accentLight);

    let scrollPercent = 0;
    const clock = new THREE.Clock();

    // ── Cálculo pesado de scroll (câmera + opacidade dos steps) ──
    function updateFromScroll() {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height - window.innerHeight;

      if (sectionTop <= 0 && sectionTop >= -sectionHeight) {
        scrollPercent = Math.abs(sectionTop) / sectionHeight;
      } else if (sectionTop > 0) {
        scrollPercent = 0;
      } else {
        scrollPercent = 1;
      }

      camera.position.z = 40 - scrollPercent * 100;
      cubesGroup.rotation.y = scrollPercent * Math.PI;
      cubesGroup.rotation.z = scrollPercent * 0.5;

      if (step1 && step2) {
        if (scrollPercent < 0.5) {
          step1.style.opacity = 1 - scrollPercent * 2.5;
          step1.style.transform = `translateY(${scrollPercent * 150}px) scale(${1 + scrollPercent})`;
          step1.style.pointerEvents = scrollPercent < 0.2 ? 'auto' : 'none';

          step2.style.opacity = 0;
          step2.style.pointerEvents = 'none';
        } else {
          step1.style.opacity = 0;
          step1.style.pointerEvents = 'none';

          let p = (scrollPercent - 0.5) * 2.5;
          if (p > 1) p = 1;

          step2.style.opacity = p;
          step2.style.transform = `translateY(${50 - p * 50}px)`;
          step2.style.pointerEvents = p > 0.5 ? 'auto' : 'none';
        }
      }
    }

    // REGRA DE PERFORMANCE 3: throttle do scroll via requestAnimationFrame.
    let rafScheduled = false;
    function onScroll() {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => {
        updateFromScroll();
        rafScheduled = false;
      });
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Cálculo inicial (equivalente a já ter o estado correto ao montar)
    updateFromScroll();

    // ── REGRA DE PERFORMANCE 1: pausa o RAF quando a seção sai da viewport ──
    let isInView = true;
    let rafId = null;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      cubesGroup.children.forEach((cube, i) => {
        cube.rotation.x += 0.001 * ((i % 3) + 1);
        cube.rotation.y += 0.002 * ((i % 2) + 1);
        cube.position.y += Math.sin(time + i) * 0.02;
      });

      accentLight.intensity = 1.5 + Math.sin(time * 2) * 1;
      renderer.render(scene, camera);
    }

    function startAnimation() {
      if (rafId === null) {
        animate();
      }
    }

    function stopAnimation() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          if (isInView) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(section);

    // Inicia o loop (a seção acabou de ser montada via lazy load, então
    // está presumivelmente visível ou prestes a ficar — o observer acima
    // assume o controle a partir do primeiro callback).
    startAnimation();

    // ── CLEANUP: cancela RAF, remove listeners, desconecta observer,
    // e libera geometria/materiais/renderer da GPU. ──
    return () => {
      stopAnimation();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      visibilityObserver.disconnect();

      geometry.dispose();
      materials.forEach((mat) => mat.dispose());
      renderer.dispose();
    };
  }, [shouldMount]);

  return (
    <section
      ref={sectionRef}
      id="nav-3d-trailer-creapes"
      className="creapes-3d-section"
      style={{ position: 'relative', width: '100%', height: '350vh', background: 'var(--bg)', padding: 0 }}
    >
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        {shouldMount && (
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          />
        )}

        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}
        >
          <div
            ref={step1Ref}
            style={{
              position: 'absolute', opacity: 1, transition: 'opacity 0.3s, transform 0.3s',
              pointerEvents: 'auto', textAlign: 'center', width: '90%', maxWidth: '1000px',
              transform: 'translateY(0)',
            }}
          >
            <h2
              style={{
                color: 'var(--text)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: '20px',
                textTransform: 'uppercase', letterSpacing: '2px', fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Nosso Showreel
            </h2>
            <div
              style={{
                padding: '10px', aspectRatio: '16/9', width: '100%', background: 'rgba(5,5,5,0.8)',
                backdropFilter: 'blur(10px)', border: '1px solid var(--accent)',
                boxShadow: '0 0 30px rgba(208, 255, 0, 0.1)', borderRadius: '4px',
              }}
            >
              <iframe
                title="showreel-creapes"
                src={vimeoEmbedUrl}
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '2px' }}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div
            ref={step2Ref}
            style={{
              position: 'absolute', opacity: 0, transition: 'opacity 0.3s, transform 0.3s',
              pointerEvents: 'none', textAlign: 'center', width: '90%', maxWidth: '800px',
              transform: 'translateY(50px)',
            }}
          >
            <h3
              style={{
                color: 'var(--text)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', marginBottom: '40px',
                textShadow: '0 0 20px rgba(0,0,0,0.8)', lineHeight: 1.2,
                fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase',
              }}
            >
              Elevando o padrão audiovisual
            </h3>
            <a
              href="#contact"
              style={{
                display: 'inline-block', padding: '15px 35px', background: 'var(--accent)', color: 'var(--bg)',
                textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: '1.2rem', borderRadius: '50px', textTransform: 'uppercase', transition: 'all 0.3s',
              }}
            >
              Start a Project
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
