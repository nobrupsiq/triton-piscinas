'use client';

import { useEffect, useRef, useState } from 'react';

export default function WaterExperience() {
  const hostRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let cleanup = () => {};
    // Load the decorative engines after the initial HTML and hero photo. Phones get
    // extra time, so the effect never competes with the first paint.
    const delay = matchMedia('(pointer: coarse)').matches ? 2500 : 200;
    const timer = setTimeout(async () => {
      try {
        const [THREE, { gsap }] = await Promise.all([import('three'), import('gsap')]);
        if (disposed) return;
        const host = hostRef.current;
        let renderer;
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'low-power',
          });
        } catch {
          // The original photograph stays visible on devices without WebGL.
          host.dataset.water = 'unavailable';
          return;
        }
        const hero = host.closest('.hero');
        const photo = hero.querySelector('.hero-photo');
        const textures = [];
        cleanup = () => {
          textures.forEach((texture) => texture.dispose());
          renderer.dispose();
          renderer.forceContextLoss();
        };
        const loader = new THREE.TextureLoader();
        const load = async (url) => {
          const texture = await loader.loadAsync(url);
          if (disposed) texture.dispose();
          else textures.push(texture);
          return texture;
        };
        const [photograph, normal] = await Promise.all([
          load(photo.currentSrc || photo.src),
          load('/effects/waternormals.jpg'),
        ]);
        if (disposed) return;
        photograph.colorSpace = THREE.SRGBColorSpace;
        normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(1);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        renderer.domElement.style.opacity = '0';
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geometry = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          time: { value: 0 },
          photograph: { value: photograph },
          normalMap: { value: normal },
          crop: { value: new THREE.Vector4(1, 1, 0, 0) },
          pointer: { value: new THREE.Vector2(0.6, 0.2) },
          pulse: { value: 10 },
        };
        const material = new THREE.ShaderMaterial({
          transparent: true,
          depthTest: false,
          depthWrite: false,
          uniforms,
          vertexShader: `varying vec2 uvPosition;
            void main(){uvPosition=uv;gl_Position=vec4(position.xy,0.,1.);}`,
          // Layered normal-map sampling inspired by the official Water.js addon.
          // Refraction is masked in photo coordinates, so the building/sky stay still.
          fragmentShader: `precision highp float;
            varying vec2 uvPosition;
            uniform float time, pulse;
            uniform vec4 crop;
            uniform vec2 pointer;
            uniform sampler2D photograph, normalMap;
            float poolMask(vec2 uv){
              float y=1.-uv.y;
              float top=max(.941-.43*uv.x,.665+.575*max(uv.x-.64,0.));
              float right=1.23-.50*y;
              return smoothstep(top+.012,top+.045,y)
                *smoothstep(.012,.045,right-uv.x)
                *smoothstep(.17,.205,uv.x);
            }
            void main(){
              vec2 uv=uvPosition*crop.xy+crop.zw;
              float mask=poolMask(uv);
              vec2 flow=texture2D(normalMap,uv*vec2(4.,2.)+vec2(time*.014,time*.009)).rg*2.-1.;
              flow+=texture2D(normalMap,uv*vec2(7.,3.)+vec2(-time*.009,time*.012)).rg*2.-1.;
              vec2 delta=(uv-pointer)*vec2(2.4,1.);
              float d=length(delta);
              float ring=sin(d*100.-pulse*9.)*exp(-pow((d-pulse*.15)*12.,2.))*exp(-pulse*.85);
              vec2 ripple=normalize(delta+vec2(.0001))*ring*.010;
              vec2 shift=(flow*vec2(.0045,.007)+ripple)*mask;
              vec3 color=texture2D(photograph,clamp(uv+shift,vec2(0.),vec2(1.))).rgb;
              gl_FragColor=vec4(color,mask);
              #include <colorspace_fragment>
            }`,
        });
        scene.add(new THREE.Mesh(geometry, material));
        let frame = 0,
          last = 0,
          visible = false,
          lost = false;
        function render(now) {
          frame = requestAnimationFrame(render);
          if (now - last < 1000 / 30) return;
          const delta = Math.min((now - (last || now)) / 1000, 0.1);
          last = now;
          uniforms.time.value += delta;
          uniforms.pulse.value += delta;
          renderer.render(scene, camera);
        }
        function updateLoop() {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
          const running = visible && !document.hidden && !lost;
          host.dataset.running = String(running);
          if (running) frame = requestAnimationFrame(render);
        }
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          updateLoop();
        });
        observer.observe(hero);
        const resize = new ResizeObserver(() => {
          const { width, height } = host.getBoundingClientRect();
          const ratio = Math.min(devicePixelRatio, 1.25, 1600 / Math.max(width, 1));
          renderer.setSize(Math.max(1, width * ratio), Math.max(1, height * ratio), false);
          const image = photograph.image;
          const scale = Math.max(width / image.width, height / image.height);
          const cropX = width / (image.width * scale);
          const cropY = height / (image.height * scale);
          const position = getComputedStyle(photo).objectPosition.split(' ').map(parseFloat);
          uniforms.crop.value.set(
            cropX,
            cropY,
            ((1 - cropX) * position[0]) / 100,
            (1 - cropY) * (1 - position[1] / 100),
          );
        });
        resize.observe(host);
        function move(event) {
          if (event.pointerType !== 'mouse') return;
          const rect = host.getBoundingClientRect();
          if (uniforms.pulse.value < 0.65) return;
          const crop = uniforms.crop.value;
          uniforms.pointer.value.set(
            ((event.clientX - rect.left) / rect.width) * crop.x + crop.z,
            (1 - (event.clientY - rect.top) / rect.height) * crop.y + crop.w,
          );
          uniforms.pulse.value = 0;
        }

        function contextLost(event) {
          event.preventDefault();
          lost = true;
          host.dataset.water = 'unavailable';
          updateLoop();
        }
        hero.addEventListener('pointermove', move, { passive: true });
        renderer.domElement.addEventListener('webglcontextlost', contextLost);
        document.addEventListener('visibilitychange', updateLoop);
        host.dataset.water = 'ready';
        const fade = gsap.to(renderer.domElement, {
          opacity: 1,
          duration: 1.4,
          ease: 'power2.out',
        });
        cleanup = () => {
          fade.kill();
          observer.disconnect();
          resize.disconnect();
          cancelAnimationFrame(frame);
          hero.removeEventListener('pointermove', move);
          document.removeEventListener('visibilitychange', updateLoop);
          renderer.domElement.removeEventListener('webglcontextlost', contextLost);
          textures.forEach((texture) => texture.dispose());
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
          delete host.dataset.water;
          delete host.dataset.running;
        };
      } catch {
        disposed = true;
        cleanup();
        if (hostRef.current) hostRef.current.dataset.water = 'unavailable';
        // Decorative enhancement must never prevent reading or navigation.
      }
    }, delay);
    return () => {
      disposed = true;
      clearTimeout(timer);
      cleanup();
    };
  }, [enabled]);

  return <div ref={hostRef} className="hero-water" aria-hidden="true" />;
}
