import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { decks, finishes, leds, pick } from './pool-options';

export async function createPoolScene(host) {
  const normal = await new THREE.TextureLoader().loadAsync('/effects/waternormals.jpg');
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch (error) {
    normal.dispose();
    throw error;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute(
    'aria-label',
    'Maquete conceitual de piscina com deck e espreguiçadeiras. Arraste para girar e use a rolagem para aproximar.',
  );
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(9, 8.5, 10.5);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.7;
  controls.minDistance = 7;
  controls.maxDistance = 26;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI / 2.5;
  controls.rotateSpeed = 0.55;
  controls.update();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ambient = new THREE.HemisphereLight(0xcdefff, 0x746c62, 2.4);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffedcf, 3);
  sun.position.set(-6, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const stone = new THREE.MeshStandardMaterial({ color: 0xe6dfcf, roughness: 0.8 });
  const wood = new THREE.MeshStandardMaterial({ color: 0xa6754d, roughness: 0.75 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf5eee1, roughness: 0.6 });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x7c99a3,
    metalness: 0.8,
    roughness: 0.25,
  });
  const leaves = new THREE.MeshStandardMaterial({ color: 0x427361, roughness: 0.9 });
  const tile = new THREE.MeshStandardMaterial({ color: 0x178ca7, roughness: 0.45 });
  const led = new THREE.MeshStandardMaterial({
    color: 0x9decff,
    emissive: 0x24b9ff,
    emissiveIntensity: 0.2,
  });
  function box(w, h, d, x, y, z, material, parent = scene) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  // Architectural model, deliberately not a replica of a catalog product.
  box(12, 0.6, 9, 0, -0.9, 0, stone);
  box(8, 0.12, 4, -0.8, -0.45, 0, tile);
  box(8.6, 0.6, 0.3, -0.8, -0.25, -2.15, tile);
  box(8.6, 0.6, 0.3, -0.8, -0.25, 2.15, tile);
  box(0.3, 0.6, 4, -4.95, -0.25, 0, tile);
  box(0.3, 0.6, 4, 3.35, -0.25, 0, tile);
  // Deck boards give the diorama real depth and catch the moving shadows.
  for (let i = 0; i < 40; i++) {
    const x = -5.85 + i * 0.3;
    box(0.285, 0.18, 1.75, x, -0.15, -3.35, wood);
    box(0.285, 0.18, 1.75, x, -0.15, 3.35, wood);
  }
  box(0.7, 0.18, 5, -5.55, -0.15, 0, wood);
  box(2.1, 0.18, 5, 4.75, -0.15, 0, wood);
  box(8.9, 0.22, 0.35, -0.8, 0.04, -2.35, stone);
  box(8.9, 0.22, 0.35, -0.8, 0.04, 2.35, stone);
  box(0.35, 0.22, 4.4, -5.08, 0.04, 0, stone);
  box(0.35, 0.22, 4.4, 3.48, 0.04, 0, stone);
  const water = new Water(new THREE.PlaneGeometry(8, 4), {
    textureWidth: 256,
    textureHeight: 256,
    waterNormals: normal,
    sunDirection: sun.position.clone().normalize(),
    sunColor: 0xffedcf,
    waterColor: 0x16a6b9,
    distortionScale: 1.7,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.set(-0.8, -0.06, 0);
  scene.add(water);
  for (const z of [-1.1, 1.3]) {
    box(1.25, 0.12, 1.9, 4.65, 0.35, z, white);
    const back = box(1.25, 0.12, 0.85, 4.65, 0.63, z - 0.9, white);
    back.rotation.x = 0.55;
    for (const x of [4.2, 5.1]) box(0.07, 0.4, 1.65, x, 0.1, z, metal);
  }
  const parasol = new THREE.Group();
  const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.4, 8), white);
  umbrella.position.set(4.6, 2.55, -2.7);
  umbrella.castShadow = true;
  parasol.add(umbrella);
  box(0.055, 2.5, 0.055, 4.6, 1.15, -2.7, metal, parasol);
  scene.add(parasol);
  for (const x of [-4.9, 1.6]) {
    box(0.8, 0.65, 0.8, x, 0.2, -3.5, stone);
    for (let j = 0; j < 7; j++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), leaves);
      leaf.scale.set(0.6, 3.5, 0.4);
      leaf.rotation.z = (j - 3) * 0.21;
      leaf.rotation.y = j;
      leaf.position.set(x, 1.05, -3.5);
      leaf.castShadow = true;
      scene.add(leaf);
    }
  }
  const ledLights = [-3.4, -0.8, 1.8].map((x) => {
    box(0.3, 0.06, 0.1, x, 0.04, 2.17, led);
    const light = new THREE.PointLight(0x3acfff, 0, 4, 2);
    light.position.set(x, 0.3, 1.8);
    scene.add(light);
    return light;
  });
  // Configurator extras, toggled through configure().
  const beach = new THREE.Group();
  const shallow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 4),
    new THREE.MeshStandardMaterial({
      color: 0xf0e4c4,
      roughness: 0.3,
      transparent: true,
      opacity: 0.75,
    }),
  );
  shallow.rotation.x = -Math.PI / 2;
  shallow.position.set(-3.95, -0.035, 0);
  shallow.receiveShadow = true;
  beach.add(shallow);
  box(0.06, 0.04, 4, -3.1, -0.04, 0, white, beach);
  beach.visible = false;
  scene.add(beach);
  const cascade = new THREE.Group();
  box(2.4, 1.1, 0.45, -0.8, 0.4, -2.8, stone, cascade);
  box(1.8, 0.06, 0.4, -0.8, 0.88, -2.45, stone, cascade);
  const streaks = document.createElement('canvas');
  streaks.width = 64;
  streaks.height = 128;
  const pen = streaks.getContext('2d');
  pen.fillStyle = 'rgba(210,244,252,0.55)';
  pen.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 70; i++) {
    pen.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.6})`;
    pen.fillRect(
      Math.random() * 64,
      Math.random() * 128,
      1 + Math.random() * 2,
      10 + Math.random() * 40,
    );
  }
  const fall = new THREE.CanvasTexture(streaks);
  fall.wrapS = fall.wrapT = THREE.RepeatWrapping;
  fall.repeat.set(3, 1);
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.92),
    new THREE.MeshStandardMaterial({
      map: fall,
      transparent: true,
      roughness: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  sheet.position.set(-0.8, 0.4, -2.27);
  sheet.rotation.x = -0.12;
  cascade.add(sheet);
  cascade.visible = false;
  scene.add(cascade);
  const spa = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.55, 40), stone);
  rim.position.set(1.6, 0.1, 3.4);
  rim.castShadow = rim.receiveShadow = true;
  spa.add(rim);
  const spaWater = new THREE.MeshStandardMaterial({
    color: 0x16a6b9,
    emissive: 0x0b5f6e,
    emissiveIntensity: 0.4,
    roughness: 0.1,
  });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.8, 40), spaWater);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(1.6, 0.38, 3.4);
  spa.add(pool);
  const foam = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  const bubbles = Array.from({ length: 14 }, (_, i) => {
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), foam);
    const angle = i * 2.4,
      radius = 0.15 + ((i * 0.37) % 0.6);
    bubble.position.set(1.6 + Math.cos(angle) * radius, 0.39, 3.4 + Math.sin(angle) * radius);
    spa.add(bubble);
    return bubble;
  });
  const spaLight = new THREE.PointLight(0x3acfff, 0, 3, 2);
  spaLight.position.set(1.6, 0.8, 3.4);
  spa.add(spaLight);
  spa.visible = false;
  scene.add(spa);
  // The pergola replaces the parasol over the loungers.
  const pergola = new THREE.Group();
  const timber = new THREE.MeshStandardMaterial({ color: 0x6f4a30, roughness: 0.8 });
  for (const x of [3.85, 5.65]) {
    for (const z of [-2.15, 2.35]) box(0.16, 2.5, 0.16, x, 1.15, z, timber, pergola);
    box(0.14, 0.22, 4.9, x, 2.45, 0.1, timber, pergola);
  }
  for (let i = 0; i < 12; i++) box(2.3, 0.1, 0.09, 4.75, 2.6, -2.25 + i * 0.4, timber, pergola);
  pergola.visible = false;
  scene.add(pergola);
  const fire = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.55, 0.4, 28), stone);
  bowl.position.set(-3.6, 0.13, 3.4);
  bowl.castShadow = bowl.receiveShadow = true;
  fire.add(bowl);
  const embers = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 28),
    new THREE.MeshStandardMaterial({ color: 0x2b2522, emissive: 0xff4a12, emissiveIntensity: 0.6 }),
  );
  embers.rotation.x = -Math.PI / 2;
  embers.position.set(-3.6, 0.335, 3.4);
  fire.add(embers);
  const flameMaterial = new THREE.MeshStandardMaterial({
    color: 0xffb347,
    emissive: 0xff7a1a,
    emissiveIntensity: 2.2,
    transparent: true,
    opacity: 0.9,
  });
  const flames = [
    [0, 0, 0.55],
    [0.18, 0.1, 0.4],
    [-0.16, 0.08, 0.42],
    [0.05, -0.17, 0.36],
  ].map(([dx, dz, height]) => {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.11, 1, 10), flameMaterial);
    flame.position.set(-3.6 + dx, 0.34, 3.4 + dz);
    flame.userData.height = height;
    flame.scale.set(1, height, 1);
    flame.position.y += height / 2;
    fire.add(flame);
    return flame;
  });
  const fireLight = new THREE.PointLight(0xff8a3d, 0, 5, 2);
  fireLight.position.set(-3.6, 1, 3.4);
  fire.add(fireLight);
  fire.visible = false;
  scene.add(fire);
  let dusk = false,
    finish = finishes[0],
    ledColor = leds[0].color;
  function applyLights() {
    led.color.set(ledColor).lerp(new THREE.Color(0xffffff), 0.5);
    led.emissive.set(ledColor);
    led.emissiveIntensity = dusk ? 4 : 0.2;
    for (const light of [...ledLights, spaLight]) {
      light.color.set(ledColor);
      light.intensity = dusk ? 8 : 0;
    }
    const tint = new THREE.Color(finish.water);
    if (dusk) tint.lerp(new THREE.Color(0x03304a), 0.45);
    water.material.uniforms.waterColor.value.copy(tint);
    spaWater.color.copy(tint);
    spaWater.emissive.set(dusk ? ledColor : 0x0b5f6e);
    spaWater.emissiveIntensity = dusk ? 0.6 : 0.4;
    fireLight.intensity = dusk ? 9 : 1;
  }
  let visible = true,
    paused = false,
    frame = 0,
    last = 0;
  function paint() {
    renderer.render(scene, camera);
  }
  function loop(now) {
    frame = requestAnimationFrame(loop);
    if (now - last < 1000 / 30) return;
    const step = Math.min((now - (last || now)) / 1000, 0.06);
    water.material.uniforms.time.value += step * 0.6;
    if (cascade.visible) fall.offset.y += step * 0.9;
    if (spa.visible) {
      const t = water.material.uniforms.time.value * 6;
      bubbles.forEach((bubble, i) => {
        const pulse = (Math.sin(t + i * 1.7) + 1) / 2;
        bubble.scale.setScalar(0.4 + pulse);
        bubble.position.y = 0.39 + pulse * 0.05;
      });
    }
    if (fire.visible) {
      const t = water.material.uniforms.time.value * 14;
      flames.forEach((flame, i) => {
        const height = flame.userData.height * (0.8 + Math.sin(t + i * 2.1) * 0.2);
        flame.scale.set(1, height, 1);
        flame.position.y = 0.34 + height / 2;
      });
      fireLight.intensity = (dusk ? 9 : 1) * (0.85 + Math.sin(t * 1.7) * 0.15);
    }
    last = now;
    paint();
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    const running = visible && !document.hidden && !paused && !reduced.matches;
    host.dataset.running = String(running);
    if (running) frame = requestAnimationFrame(loop);
    if (visible && !document.hidden) paint();
  }
  controls.addEventListener('change', paint);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    camera.aspect = width / Math.max(height, 1);
    // Portrait stages need a wider lens so the whole diorama stays in frame.
    camera.fov = camera.aspect < 1 ? 66 : width < 600 ? 53 : 38;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    paint();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  observer.observe(host);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  const lost = (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    host.dataset.running = 'false';
    host.dispatchEvent(new Event('pool-lost'));
  };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  schedule();
  return {
    lighting(value) {
      dusk = value;
      ambient.intensity = dusk ? 0.65 : 2.4;
      sun.intensity = dusk ? 1.6 : 3;
      sun.color.set(dusk ? 0xffa367 : 0xffedcf);
      sun.position.set(-6, dusk ? 3 : 12, 8);
      water.material.uniforms.sunColor.value.set(dusk ? 0xffab70 : 0xffedcf);
      water.material.uniforms.sunDirection.value.copy(sun.position).normalize();
      applyLights();
      paint();
    },
    configure(config) {
      finish = pick(finishes, config.finish);
      tile.color.set(finish.tile);
      const deck = pick(decks, config.deck);
      wood.color.set(deck.color);
      wood.roughness = deck.roughness;
      ledColor = pick(leds, config.led).color;
      beach.visible = config.beach;
      cascade.visible = config.cascade;
      spa.visible = config.spa;
      pergola.visible = config.pergola;
      parasol.visible = !config.pergola;
      fire.visible = config.fire;
      applyLights();
      paint();
    },
    view(top) {
      camera.position.set(...(top ? [0, 17, 0.1] : [9, 8.5, 10.5]));
      controls.update();
      paint();
    },
    rotate(direction) {
      const angle = (direction * Math.PI) / 6;
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      controls.update();
      paint();
    },
    zoom(direction) {
      const offset = camera.position.clone().sub(controls.target);
      const distance = THREE.MathUtils.clamp(
        offset.length() * (direction > 0 ? 0.8 : 1.25),
        controls.minDistance,
        controls.maxDistance,
      );
      camera.position.copy(controls.target).add(offset.setLength(distance));
      controls.update();
      paint();
    },
    pause(value) {
      paused = value;
      schedule();
    },
    dispose() {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      controls.dispose();
      document.removeEventListener('visibilitychange', schedule);
      reduced.removeEventListener('change', schedule);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      normal.dispose();
      fall.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      delete host.dataset.running;
    },
  };
}
