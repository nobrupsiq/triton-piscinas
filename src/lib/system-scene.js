import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Didactic cutaway of a pool's circulation, not a replica of a catalog product.
const OVERVIEW = { target: [0.4, -0.5, 0], distance: 14 };
const FOCUS = {
  succao: { target: [-0.2, -0.9, 0.2], distance: 12.5 },
  bomba: { target: [2.6, 0.4, 0.3], distance: 8 },
  filtro: { target: [3.4, 0.7, -0.2], distance: 8 },
  aquecimento: { target: [4.2, 0.7, 0.2], distance: 8.5 },
  retorno: { target: [1.6, -0.5, -0.4], distance: 11.5 },
};

class Polyline extends THREE.CurvePath {
  constructor(points) {
    super();
    const vectors = points.map((point) => new THREE.Vector3(...point));
    for (let i = 1; i < vectors.length; i++) {
      this.add(new THREE.LineCurve3(vectors[i - 1], vectors[i]));
    }
    this.corners = vectors.slice(1, -1);
  }
}

export async function createSystemScene(host) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.setAttribute(
    'aria-label',
    'Corte de uma piscina mostrando a água passando pela motobomba, pelo filtro e pelo aquecedor antes de voltar à piscina.',
  );
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(4.5, 5.5, 10.5);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.zoomSpeed = 0.7;
  controls.minDistance = 4;
  controls.maxDistance = 20;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minAzimuthAngle = -Math.PI / 3;
  controls.maxAzimuthAngle = Math.PI / 2.4;
  controls.rotateSpeed = 0.55;
  controls.target.set(...OVERVIEW.target);
  camera.position.sub(controls.target).setLength(OVERVIEW.distance).add(controls.target);
  controls.update();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  scene.add(new THREE.HemisphereLight(0xe6f6ff, 0x6b5a48, 2.3));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
  sun.position.set(-5, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const material = (options) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...options });
  // The soil is see-through so the buried pipes read like an x-ray.
  const soil = material({
    color: 0xa47c58,
    roughness: 0.95,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const paving = material({ color: 0xe4ddcf, roughness: 0.85 });
  const tile = material({ color: 0x86d3e3, roughness: 0.35 });
  const concrete = material({ color: 0xc9c6bf, roughness: 0.9 });
  function box(w, h, d, x, y, z, mat, parent = scene) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = mat !== soil;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(radius, height, x, y, z, mat, parent = scene, segments = 28) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  // Ground block, cut open at z = 1.5.
  box(11, 0.6, 4, 0, -1.9, -0.5, soil);
  box(1.5, 1.6, 4, -4.75, -0.8, -0.5, soil);
  box(4.5, 1.6, 4, 3.25, -0.8, -0.5, soil);
  box(5, 1.6, 1, -1.5, -0.8, -2, soil);
  box(1.5, 0.08, 4, -4.75, 0.04, -0.5, paving);
  box(4.5, 0.08, 4, 3.25, 0.04, -0.5, paving);
  box(5, 0.08, 1, -1.5, 0.04, -2, paving);
  // Pool shell and water.
  box(5, 0.1, 3, -1.5, -1.55, 0, tile);
  box(5, 1.6, 0.1, -1.5, -0.8, -1.45, tile);
  box(0.1, 1.6, 3, -3.95, -0.8, 0, tile);
  box(0.1, 1.6, 3, 0.95, -0.8, 0, tile);
  const water = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 1.36, 2.9),
    new THREE.MeshPhysicalMaterial({
      color: 0x2fb6d2,
      roughness: 0.08,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  water.position.set(-1.5, -0.82, 0.05);
  scene.add(water);
  // Equipment pad.
  box(3.6, 0.1, 2.6, 3.5, 0.13, -0.05, concrete);
  const parts = {};
  const group = (id) => {
    const g = new THREE.Group();
    g.userData.id = id;
    scene.add(g);
    parts[id] = g;
    return g;
  };
  const succao = group('succao');
  cylinder(0.32, 0.06, -1.5, -1.48, 0, material({ color: 0xf2f4f6 }), succao);
  box(0.08, 0.3, 0.5, 0.88, -0.32, 0.6, material({ color: 0xf2f4f6 }), succao);
  const bomba = group('bomba');
  box(0.9, 0.12, 0.5, 2.45, 0.24, 0.6, material({ color: 0x3d4650 }), bomba);
  cylinder(0.26, 0.42, 2.2, 0.51, 0.6, material({ color: 0x1f6fb5 }), bomba);
  const motor = cylinder(
    0.22,
    0.6,
    2.65,
    0.52,
    0.6,
    material({ color: 0x55606b, metalness: 0.5 }),
    bomba,
  );
  motor.rotation.z = Math.PI / 2;
  const filtro = group('filtro');
  cylinder(0.42, 1, 3.4, 0.68, -0.4, material({ color: 0x2a7fd4, roughness: 0.4 }), filtro);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    material({ color: 0x2a7fd4, roughness: 0.4 }),
  );
  dome.position.set(3.4, 1.18, -0.4);
  dome.castShadow = true;
  filtro.add(dome);
  cylinder(0.12, 0.2, 3.4, 1.65, -0.4, material({ color: 0x3d4650 }), filtro);
  const aquecimento = group('aquecimento');
  box(0.9, 1, 0.6, 4.6, 0.68, 0.4, material({ color: 0xf2f4f6, roughness: 0.4 }), aquecimento);
  const fan = cylinder(0.3, 0.04, 4.6, 0.72, 0.71, material({ color: 0x3d4650 }), aquecimento);
  fan.rotation.x = Math.PI / 2;
  const blades = new THREE.Group();
  blades.position.set(4.6, 0.72, 0.74);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.01),
      material({ color: 0xd8dde2 }),
    );
    blade.rotation.z = (i * Math.PI) / 3;
    blades.add(blade);
  }
  aquecimento.add(blades);
  const retorno = group('retorno');
  const nozzle = cylinder(0.08, 0.12, 0.88, -0.45, -1, material({ color: 0xf2f4f6 }), retorno);
  nozzle.rotation.z = Math.PI / 2;
  // Each run of pipe carries water at one stage of treatment.
  const stages = {
    dirty: 0x9fae73,
    clean: 0x63d6ff,
    warm: 0xffa25e,
  };
  const pipes = [
    {
      part: succao,
      color: stages.dirty,
      points: [
        [-1.5, -1.5, 0],
        [-1.5, -1.85, 0],
        [1.9, -1.85, 0],
        [1.9, -1.85, 0.6],
        [1.9, 0.51, 0.6],
        [2.0, 0.51, 0.6],
      ],
    },
    {
      part: succao,
      color: stages.dirty,
      points: [
        [0.93, -0.32, 0.6],
        [1.9, -0.32, 0.6],
      ],
    },
    {
      part: bomba,
      color: stages.dirty,
      points: [
        [2.2, 0.75, 0.6],
        [2.2, 0.95, 0.6],
        [2.95, 0.95, 0.6],
        [2.95, 0.95, -0.4],
        [3.0, 0.95, -0.4],
      ],
    },
    {
      part: filtro,
      color: stages.clean,
      points: [
        [3.4, 1.75, -0.4],
        [3.4, 1.9, -0.4],
        [4.6, 1.9, -0.4],
        [4.6, 1.9, 0.4],
        [4.6, 1.18, 0.4],
      ],
    },
    {
      part: retorno,
      color: stages.warm,
      points: [
        [4.15, 0.4, 0.4],
        [3.95, 0.4, 0.4],
        [3.95, -0.45, 0.4],
        [3.95, -0.45, -1],
        [0.95, -0.45, -1],
      ],
    },
  ];
  // Clear pipes let the water be seen travelling inside them.
  const pipeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdfeef5,
    roughness: 0.15,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });
  const particles = [];
  const droplet = new THREE.SphereGeometry(0.052, 10, 8);
  for (const pipe of pipes) {
    const path = new Polyline(pipe.points);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(path, Math.max(24, pipe.points.length * 24), 0.07, 12),
      pipeMaterial.clone(),
    );
    pipe.part.add(tube);
    for (const corner of path.corners) {
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), tube.material);
      elbow.position.copy(corner);
      pipe.part.add(elbow);
    }
    const dropletMaterial = new THREE.MeshBasicMaterial({ color: pipe.color, toneMapped: false });
    const count = Math.max(4, Math.round(path.getLength() * 4));
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(droplet, dropletMaterial);
      scene.add(mesh);
      particles.push({ mesh, path, offset: i / count });
    }
  }
  // Each part gets its own materials so it can glow on its own.
  const highlights = {};
  for (const [id, part] of Object.entries(parts)) {
    highlights[id] = [];
    part.traverse((object) => {
      if (!object.isMesh) return;
      object.material = object.material.clone();
      highlights[id].push(object.material);
    });
  }
  let active = null,
    goal = OVERVIEW,
    flow = 0,
    visible = true,
    frame = 0,
    last = 0;
  const goalTarget = new THREE.Vector3(...OVERVIEW.target);
  function placeParticles() {
    for (const particle of particles) {
      const t = (particle.offset + flow) % 1;
      particle.mesh.position.copy(particle.path.getPointAt(t));
    }
  }
  function paint() {
    renderer.render(scene, camera);
  }
  function settleCamera(amount) {
    controls.target.lerp(goalTarget, amount);
    const offset = camera.position.clone().sub(controls.target);
    // Portrait stages need extra room to keep the equipment in frame.
    const distance = goal.distance * (camera.aspect < 1 ? 1.15 : 1);
    const length = THREE.MathUtils.lerp(offset.length(), distance, amount);
    camera.position.copy(controls.target).add(offset.setLength(length));
    controls.update();
  }
  function loop(now) {
    frame = requestAnimationFrame(loop);
    if (now - last < 1000 / 30) return;
    const step = Math.min((now - (last || now)) / 1000, 0.06);
    last = now;
    flow = (flow + step * 0.12) % 1;
    blades.rotation.z -= step * 9;
    placeParticles();
    const pulse = (Math.sin(now / 260) + 1) / 2;
    for (const [id, list] of Object.entries(highlights)) {
      for (const mat of list) mat.emissiveIntensity = id === active ? 0.3 + pulse * 0.6 : 0;
    }
    if (controls.target.distanceTo(goalTarget) > 0.01) settleCamera(0.08);
    paint();
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    const running = visible && !document.hidden && !reduced.matches;
    host.dataset.running = String(running);
    if (running) frame = requestAnimationFrame(loop);
    if (visible && !document.hidden) paint();
  }
  for (const list of Object.values(highlights)) for (const mat of list) mat.emissive.set(0x3aa0ff);
  placeParticles();
  controls.addEventListener('change', paint);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    camera.aspect = width / Math.max(height, 1);
    camera.fov = camera.aspect < 1 ? 62 : width < 600 ? 50 : 36;
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
    host.dispatchEvent(new Event('system-lost'));
  };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  schedule();
  return {
    focus(id) {
      active = id;
      goal = FOCUS[id] || OVERVIEW;
      goalTarget.set(...goal.target);
      if (reduced.matches) {
        for (const [key, list] of Object.entries(highlights)) {
          for (const mat of list) mat.emissiveIntensity = key === id ? 0.6 : 0;
        }
        settleCamera(1);
        paint();
      }
    },
    zoom(direction) {
      const offset = camera.position.clone().sub(controls.target);
      const distance = THREE.MathUtils.clamp(
        offset.length() * (direction > 0 ? 0.8 : 1.25),
        controls.minDistance,
        controls.maxDistance,
      );
      goal = { ...goal, distance: distance / (camera.aspect < 1 ? 1.15 : 1) };
      camera.position.copy(controls.target).add(offset.setLength(distance));
      controls.update();
      paint();
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
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      delete host.dataset.running;
    },
  };
}
