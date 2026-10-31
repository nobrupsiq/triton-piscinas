'use client';

import { useEffect, useRef } from 'react';

export default function ProjectDepth({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    const card = host.parentElement;
    const preference = matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let dispose = () => {};
    let generation = 0;
    let loading = false;
    let hovered = false;
    let moveScene = () => {};
    let targetX = 0,
      targetY = 0;

    async function enter(event) {
      if (!preference.matches || event.pointerType !== 'mouse') return;
      hovered = true;
      move(event);
      if (host.dataset.ready) {
        host.dataset.active = 'true';
        moveScene();
        return;
      }
      if (loading) return;
      loading = true;
      const version = generation;
      let texture, renderer;
      try {
        const THREE = await import('three');
        if (version !== generation) return;
        texture = await new THREE.TextureLoader().loadAsync(src);
        if (version !== generation) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.domElement.setAttribute('aria-hidden', 'true');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
        camera.position.z = 4;
        scene.add(new THREE.AmbientLight(0xffffff, 2));
        const light = new THREE.DirectionalLight(0xd7f3ff, 2.5);
        light.position.set(-2, 3, 4);
        scene.add(light);
        const edge = new THREE.MeshStandardMaterial({
          color: 0x237ab0,
          metalness: 0.45,
          roughness: 0.3,
        });
        const front = new THREE.MeshPhysicalMaterial({
          map: texture,
          roughness: 0.65,
          clearcoat: 0.4,
          clearcoatRoughness: 0.35,
        });
        const geometry = new THREE.BoxGeometry(1, 1, 0.055);
        const mesh = new THREE.Mesh(geometry, [edge, edge, edge, edge, front, edge]);
        scene.add(mesh);
        let frame = 0,
          previous = 0;
        function draw(now) {
          frame = 0;
          const blend = 1 - Math.exp(-Math.min((now - (previous || now - 16)) / 1000, 0.05) * 10);
          previous = now;
          mesh.rotation.x += ((hovered ? -targetY * 0.16 : 0) - mesh.rotation.x) * blend;
          mesh.rotation.y += ((hovered ? targetX * 0.2 : 0) - mesh.rotation.y) * blend;
          light.position.x = -2 + targetX;
          renderer.render(scene, camera);
          const unsettled =
            Math.abs(mesh.rotation.x - (hovered ? -targetY * 0.16 : 0)) +
              Math.abs(mesh.rotation.y - (hovered ? targetX * 0.2 : 0)) >
            0.0002;
          if (unsettled && !document.hidden) frame = requestAnimationFrame(draw);
        }
        moveScene = () => {
          if (!frame && !document.hidden) {
            previous = 0;
            frame = requestAnimationFrame(draw);
          }
        };
        const resize = new ResizeObserver(() => {
          const { width, height } = card.getBoundingClientRect();
          const aspect = width / Math.max(height, 1);
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          const photoAspect = texture.image.width / texture.image.height;
          texture.repeat.set(Math.min(1, aspect / photoAspect), Math.min(1, photoAspect / aspect));
          texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
          const visibleHeight = 2 * Math.tan((35 * Math.PI) / 360) * 4;
          mesh.scale.set(visibleHeight * aspect * 0.91, visibleHeight * 0.91, 1);
          moveScene();
        });
        resize.observe(card);
        function lost(event) {
          event.preventDefault();
          reset();
        }
        renderer.domElement.addEventListener('webglcontextlost', lost);
        host.appendChild(renderer.domElement);
        host.dataset.ready = 'true';
        host.dataset.active = String(hovered);
        dispose = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          renderer.domElement.removeEventListener('webglcontextlost', lost);
          geometry.dispose();
          front.dispose();
          edge.dispose();
          texture.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
        moveScene();
      } catch {
        texture?.dispose();
        renderer?.dispose();
        // Keep the original linked image if texture loading or WebGL fails.
      } finally {
        if (version === generation) loading = false;
      }
    }
    function move(event) {
      if (!hovered) return;
      const rect = card.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      moveScene();
    }
    function leave() {
      hovered = false;
      host.dataset.active = 'false';
      moveScene();
    }
    function reset() {
      generation++;
      hovered = false;
      loading = false;
      dispose();
      dispose = () => {};
      moveScene = () => {};
      delete host.dataset.ready;
      delete host.dataset.active;
    }
    function visibility() {
      if (document.hidden) reset();
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) reset();
    });
    observer.observe(card);
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', leave);
    preference.addEventListener('change', reset);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      reset();
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      preference.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [src]);
  return <div ref={ref} className="project-depth" aria-hidden="true" />;
}
