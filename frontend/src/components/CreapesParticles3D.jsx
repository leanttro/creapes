import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CreapesParticles3D — "CREAPES" montado em partículas brancas (efeito
 * inspirado no logo cinematográfico do Oscar), pensado pra caixa baixa
 * e compacta dentro do footer.
 *
 * PERFORMANCE (mesmo padrão do Trailer3D):
 * 1. Lazy mount via IntersectionObserver — só monta a cena quando o
 *    footer se aproxima da viewport.
 * 2. RAF pausa quando a seção sai de vista ou a aba fica em background.
 * 3. pixelRatio limitado a 2.
 * 4. Cleanup completo (geometria, materiais, renderer, listeners).
 *
 * Clique reinicia a animação de "montagem" das partículas.
 */
export default function CreapesParticles3D({ texto = 'CREAPES', height = 260 }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  // ── Lazy mount: inicializa cena quando o bloco se aproxima da tela ────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const mountObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldMount(true);
            mountObserver.disconnect();
          }
        });
      },
      { rootMargin: '40% 0px 40% 0px', threshold: 0 }
    );

    mountObserver.observe(wrapper);
    return () => mountObserver.disconnect();
  }, []);

  // ── Cena Three.js ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shouldMount) return;

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const isMobile = window.innerWidth < 768;

    let width = wrapper.clientWidth;
    let heightPx = wrapper.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, isMobile ? 0.0009 : 0.0016);

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 1, 5000);
    camera.position.z = isMobile ? 900 : 480;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, heightPx);

    let particleSystem = null;
    let bgParticleSystem = null;
    const pointer = new THREE.Vector2(9999, 9999);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const clock = new THREE.Clock();
    const dummy = { value: 0 };
    let assemblyTween = null;

    // ── Textura do "ponto" de cada partícula (glow radial branco) ────────────
    function createParticleTexture(glow) {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx2d = c.getContext('2d');
      const gradient = ctx2d.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, glow ? 'rgba(220, 230, 255, 1.0)' : 'rgba(235, 240, 255, 1.0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx2d.fillStyle = gradient;
      ctx2d.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }

    function createBackgroundParticles() {
      const bgGeo = new THREE.BufferGeometry();
      const bgCount = 150;
      const bgPos = new Float32Array(bgCount * 3);
      const bgColors = new Float32Array(bgCount * 3);

      for (let i = 0; i < bgCount * 3; i += 3) {
        bgPos[i] = (Math.random() - 0.5) * 1400;
        bgPos[i + 1] = (Math.random() - 0.5) * 700;
        bgPos[i + 2] = (Math.random() - 0.5) * 1000 - 200;

        const shade = Math.random() * 0.5 + 0.5;
        bgColors[i] = shade;
        bgColors[i + 1] = shade;
        bgColors[i + 2] = shade;
      }

      bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
      bgGeo.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

      const bgMat = new THREE.PointsMaterial({
        size: 5,
        vertexColors: true,
        map: createParticleTexture(true),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      });

      bgParticleSystem = new THREE.Points(bgGeo, bgMat);
      scene.add(bgParticleSystem);
    }

    // ── Monta o texto como nuvem de partículas brancas ────────────────────────
    function initParticles() {
      const textCanvas = document.createElement('canvas');
      const ctx2d = textCanvas.getContext('2d', { willReadFrequently: true });
      const w = 1400;
      const h = 360;
      textCanvas.width = w;
      textCanvas.height = h;

      ctx2d.fillStyle = '#000000';
      ctx2d.fillRect(0, 0, w, h);

      ctx2d.textAlign = 'center';
      ctx2d.textBaseline = 'middle';
      ctx2d.fillStyle = '#ffffff';
      ctx2d.font = `700 ${isMobile ? 130 : 170}px "Space Grotesk", sans-serif`;
      ctx2d.fillText(texto, w / 2, h / 2);

      const imgData = ctx2d.getImageData(0, 0, w, h).data;
      const positions = [];
      const colors = [];
      const basePositions = [];
      const randomOffsets = [];

      const colorWhite = new THREE.Color('#ffffff');
      const colorSilver = new THREE.Color('#dbe4ee');

      const scaleMultiplier = 0.46;
      const step = isMobile ? 5 : 3;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const index = (x + y * w) * 4;
          const r = imgData[index];

          if (r > 50) {
            const pX = (x - w / 2) * scaleMultiplier;
            const pY = -(y - h / 2) * scaleMultiplier;
            const pZ = 0;

            positions.push(
              pX + (Math.random() - 0.5) * 1400,
              pY + (Math.random() - 0.5) * 1400,
              pZ + Math.random() * 1000 + 700
            );

            basePositions.push(pX, pY, pZ);
            randomOffsets.push(Math.random() * Math.PI * 2);

            if (Math.random() > 0.8) {
              colors.push(colorSilver.r, colorSilver.g, colorSilver.b);
            } else {
              colors.push(colorWhite.r, colorWhite.g, colorWhite.b);
            }
          }
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('basePosition', new THREE.Float32BufferAttribute(basePositions, 3));
      geometry.setAttribute('randomOffset', new THREE.Float32BufferAttribute(randomOffsets, 1));

      const material = new THREE.PointsMaterial({
        size: isMobile ? 5.5 : 4.2,
        vertexColors: true,
        map: createParticleTexture(false),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 1.0,
      });

      particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      createBackgroundParticles();
      playAssembly();
    }

    function playAssembly() {
      dummy.value = 0;
      if (assemblyTween) assemblyTween.kill?.();
      const duration = 2200;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        // ease power4.out aproximado
        dummy.value = 1 - Math.pow(1 - t, 4);
        if (t < 1) assemblyTween = requestAnimationFrame(step);
      }
      assemblyTween = requestAnimationFrame(step);
    }

    let fontReady = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!cancelled) initParticles(); });
      fontReady = false;
    }
    let cancelled = false;
    if (fontReady) initParticles();

    function onPointerMove(clientX, clientY) {
      const rect = wrapper.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }
    function onMouseMove(e) { onPointerMove(e.clientX, e.clientY); }
    function onTouchMove(e) {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onClick() { if (particleSystem) playAssembly(); }

    wrapper.addEventListener('mousemove', onMouseMove);
    wrapper.addEventListener('touchmove', onTouchMove, { passive: true });
    wrapper.addEventListener('click', onClick);

    function onResize() {
      width = wrapper.clientWidth;
      heightPx = wrapper.clientHeight;
      camera.aspect = width / heightPx;
      camera.updateProjectionMatrix();
      renderer.setSize(width, heightPx);
    }
    window.addEventListener('resize', onResize);

    // ── Controle de animação (pausa fora de vista / aba oculta) ───────────────
    let isInView = true;
    let isTabVisible = !document.hidden;
    let rafId = null;

    function shouldAnimate() { return isInView && isTabVisible; }

    function animate() {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const mobile = window.innerWidth < 768;

      if (bgParticleSystem) {
        const bgPos = bgParticleSystem.geometry.attributes.position;
        for (let i = 0; i < bgPos.count; i++) {
          const y = bgPos.getY(i);
          bgPos.setY(i, y + Math.sin(time + i) * 0.25);
        }
        bgPos.needsUpdate = true;
        bgParticleSystem.rotation.y = time * 0.04;
      }

      if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position;
        const basePositions = particleSystem.geometry.attributes.basePosition;
        const offsets = particleSystem.geometry.attributes.randomOffset;

        let mouse3D = null;
        if (!mobile) {
          raycaster.setFromCamera(pointer, camera);
          mouse3D = new THREE.Vector3();
          raycaster.ray.intersectPlane(plane, mouse3D);
        }

        for (let i = 0; i < positions.count; i++) {
          const bx = basePositions.getX(i);
          const by = basePositions.getY(i);
          const bz = basePositions.getZ(i);
          const offset = offsets.getX(i);

          let px = positions.getX(i);
          let py = positions.getY(i);
          let pz = positions.getZ(i);

          if (!mobile && dummy.value > 0.8 && mouse3D) {
            const dx = mouse3D.x - px;
            const dy = mouse3D.y - py;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const interactRadius = 55;

            if (distance < interactRadius) {
              const force = Math.pow((interactRadius - distance) / interactRadius, 2);
              const pushX = (dx / distance) * force * 22;
              const pushY = (dy / distance) * force * 22;
              px -= pushX;
              py -= pushY;
              pz += force * 40;
            }
          }

          px += (bx - px) * (0.15 * dummy.value);
          py += (by - py) * (0.15 * dummy.value);
          pz += (bz - pz) * (0.15 * dummy.value);

          py += Math.sin(time * 2.0 + offset) * 0.12;
          px += Math.cos(time * 2.0 + offset) * 0.08;

          positions.setXYZ(i, px, py, pz);
        }

        positions.needsUpdate = true;
        particleSystem.rotation.y = Math.sin(time * 0.5) * 0.04;
        particleSystem.rotation.x = Math.cos(time * 0.3) * 0.015;
      }

      renderer.render(scene, camera);
    }

    function startAnimation() { if (rafId === null && shouldAnimate()) animate(); }
    function stopAnimation() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    function onVisibilityChange() {
      isTabVisible = !document.hidden;
      isTabVisible ? startAnimation() : stopAnimation();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          isInView ? startAnimation() : stopAnimation();
        });
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(wrapper);
    startAnimation();

    return () => {
      cancelled = true;
      stopAnimation();
      if (assemblyTween) cancelAnimationFrame(assemblyTween);
      wrapper.removeEventListener('mousemove', onMouseMove);
      wrapper.removeEventListener('touchmove', onTouchMove);
      wrapper.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      visibilityObserver.disconnect();

      if (particleSystem) {
        particleSystem.geometry.dispose();
        particleSystem.material.map?.dispose();
        particleSystem.material.dispose();
      }
      if (bgParticleSystem) {
        bgParticleSystem.geometry.dispose();
        bgParticleSystem.material.map?.dispose();
        bgParticleSystem.material.dispose();
      }
      renderer.dispose();
    };
  }, [shouldMount, texto]);

  return (
    <div
      ref={wrapperRef}
      className="creapes-particles-3d"
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        cursor: 'pointer',
      }}
    >
      {shouldMount && (
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      )}
    </div>
  );
}
