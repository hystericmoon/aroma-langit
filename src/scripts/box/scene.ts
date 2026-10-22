// The Aroma Langit nasi box, modelled in code. One WebGL canvas is fixed over the page
// and the box is drawn inside whichever "slot" element is on screen, so the same box
// opens in the hero and wears the live order label further down.
import * as THREE from 'three';
import { drawLabel, drawSleeve, drawSteam, drawWall, type LabelContent } from './textures';

export type SlotMode = 'hero' | 'label';

interface SlotState {
  el: HTMLElement;
  mode: SlotMode;
  visible: boolean;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const PAPER = 0xfffdf8;
const PAPER_IN = 0xf4ece1;

function mat(color: number, roughness = 0.85, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
}

interface FoodItem {
  mesh: THREE.Object3D;
  rest: THREE.Vector3;
  /** Lid progress window in which this item drops in. */
  from: number;
  to: number;
  baseScale: THREE.Vector3;
}

export class BoxStage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private root = new THREE.Group(); // positioned at the slot
  private tilt = new THREE.Group(); // pointer tilt + mode orientation
  private box = new THREE.Group();
  private lidPivot = new THREE.Group();
  private food: FoodItem[] = [];
  private steam: THREE.Sprite[] = [];
  private labelCanvas = document.createElement('canvas');
  private labelTex: THREE.CanvasTexture;
  private slots: SlotState[] = [];
  private raf = 0;
  private running = false;
  private reduced: boolean;
  private lastT = 0;
  private dispose: (() => void)[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private host: HTMLElement | null = null;

  // Animated values
  private lid = 0; // 0 closed, 1 open (drives food too)
  private lidTarget = 0;
  private intro = 0;
  private pointer = new THREE.Vector2();
  private pointerSmooth = new THREE.Vector2();
  private orient = { x: 0.62, y: -0.62 };
  private orientTarget = { x: 0.62, y: -0.62 };
  private spin = 0;
  private spinVel = 0;
  private bump = 0;
  private activeMode: SlotMode | null = null;
  private fade = 0;

  constructor(private canvas: HTMLCanvasElement, opts: { reduced: boolean }) {
    this.reduced = opts.reduced;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 0, 12);

    this.labelTex = new THREE.CanvasTexture(this.labelCanvas);
    this.labelTex.colorSpace = THREE.SRGBColorSpace;
    this.labelTex.anisotropy = 4;
    drawLabel(this.labelCanvas, { title: 'Nasi Box', line1: 'Pilih paket di bawah', line2: 'Kota Bogor', total: '—' });

    this.buildLights();
    this.buildBox();
    this.root.add(this.tilt);
    this.tilt.add(this.box);
    this.scene.add(this.root);

    const onResize = () => this.resize();
    window.addEventListener('resize', onResize);
    this.dispose.push(() => window.removeEventListener('resize', onResize));
    const ro = new ResizeObserver(() => this.resize());
    this.resizeObserver = ro;
    this.dispose.push(() => ro.disconnect());

    const onScroll = () => this.wake();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.dispose.push(() => window.removeEventListener('scroll', onScroll));

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      this.wake();
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    this.dispose.push(() => window.removeEventListener('pointermove', onPointer));

    const onVis = () => (document.hidden ? this.stop() : this.wake());
    document.addEventListener('visibilitychange', onVis);
    this.dispose.push(() => document.removeEventListener('visibilitychange', onVis));
  }

  /* ------------------------------------------------------------------ build */

  private buildLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0xf2c38f, 1.7);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4e6, 2.9);
    key.position.set(-4, 7, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.bias = -0.0008;
    key.shadow.radius = 6;
    this.root.add(key);
    this.root.add(key.target);
    const rim = new THREE.DirectionalLight(0xffd7a8, 0.9);
    rim.position.set(5, 2, -4);
    this.root.add(rim);
  }

  private buildBox() {
    const W = 2;
    const D = 2;
    const H = 0.62;
    const T = 0.035;

    const wallCanvas = document.createElement('canvas');
    drawWall(wallCanvas);
    const wallTex = new THREE.CanvasTexture(wallCanvas);
    wallTex.colorSpace = THREE.SRGBColorSpace;
    wallTex.anisotropy = 4;

    const paper = mat(PAPER, 0.9);
    const paperIn = mat(PAPER_IN, 0.95);
    const printed = mat(0xffffff, 0.88, { map: wallTex });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(W, T, D), paperIn);
    floor.position.y = T / 2;
    floor.receiveShadow = true;
    floor.castShadow = true;
    this.box.add(floor);

    // Walls: outside face printed (index 4 is +z face of a BoxGeometry)
    const wallGeo = new THREE.BoxGeometry(W, H, T);
    const sideGeo = new THREE.BoxGeometry(T, H, D - T * 2);
    const front = new THREE.Mesh(wallGeo, [paper, paper, paper, paper, printed, paperIn]);
    front.position.set(0, H / 2, D / 2 - T / 2);
    const back = new THREE.Mesh(wallGeo, [paper, paper, paper, paper, paperIn, printed]);
    back.position.set(0, H / 2, -D / 2 + T / 2);
    const left = new THREE.Mesh(sideGeo, [paperIn, paper, paper, paper, paper, paper]);
    left.position.set(-W / 2 + T / 2, H / 2, 0);
    const right = new THREE.Mesh(sideGeo, [paper, paperIn, paper, paper, paper, paper]);
    right.position.set(W / 2 - T / 2, H / 2, 0);
    for (const m of [front, back, left, right]) {
      m.castShadow = true;
      m.receiveShadow = true;
      this.box.add(m);
    }

    // Orange sleeve around the base, as on the real packaging
    const sleeveCanvas = document.createElement('canvas');
    drawSleeve(sleeveCanvas);
    const sleeveTex = new THREE.CanvasTexture(sleeveCanvas);
    sleeveTex.colorSpace = THREE.SRGBColorSpace;
    const orange = mat(0xec7f18, 0.7);
    const sleeveFace = mat(0xffffff, 0.7, { map: sleeveTex });
    const sleeveH = 0.34;
    const sleeveT = 0.014;
    const sleeveY = H * 0.42;
    const sleeve = new THREE.Mesh(
      new THREE.BoxGeometry(W + sleeveT * 2, sleeveH, sleeveT),
      [orange, orange, orange, orange, sleeveFace, orange],
    );
    sleeve.position.set(0, sleeveY, D / 2 + sleeveT / 2);
    const flapLen = 0.55;
    const sideGeoS = new THREE.BoxGeometry(sleeveT, sleeveH, flapLen);
    const sleeveSide = new THREE.Mesh(sideGeoS, orange);
    sleeveSide.position.set(W / 2 + sleeveT / 2, sleeveY, D / 2 - flapLen / 2 + sleeveT);
    const sleeveSide2 = sleeveSide.clone();
    sleeveSide2.position.x = -W / 2 - sleeveT / 2;
    for (const m of [sleeve, sleeveSide, sleeveSide2]) {
      m.castShadow = true;
      this.box.add(m);
    }

    // Dividers
    const divH = H * 0.62;
    const divider = (w: number, d: number, x: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, divH, d), paper);
      m.position.set(x, divH / 2 + T, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.box.add(m);
    };
    divider(0.025, D - T * 2, 0.08, 0);
    divider(W / 2 - T - 0.08, 0.025, -(W / 4) + 0.04, 0.38);
    divider(W / 2 - T - 0.08, 0.025, W / 4 + 0.04, 0.02);

    // Lid, hinged on the back edge
    this.lidPivot.position.set(0, H, -D / 2);
    this.box.add(this.lidPivot);
    const lidT = 0.03;
    const lidTop = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, lidT, D + 0.04), [paper, paper, paper, paperIn, paper, paper]);
    lidTop.position.set(0, lidT / 2, D / 2);
    lidTop.castShadow = true;
    lidTop.receiveShadow = true;
    this.lidPivot.add(lidTop);
    const flapGeo = new THREE.BoxGeometry(W + 0.04, 0.16, lidT);
    const flap = new THREE.Mesh(flapGeo, [paper, paper, paper, paper, printed, paperIn]);
    flap.position.set(0, -0.08 + lidT, D + 0.02);
    flap.castShadow = true;
    this.lidPivot.add(flap);
    const sideFlapGeo = new THREE.BoxGeometry(lidT, 0.16, D + 0.04);
    for (const sx of [-1, 1]) {
      const sf = new THREE.Mesh(sideFlapGeo, paper);
      sf.position.set(sx * (W / 2 + 0.02), -0.08 + lidT, D / 2);
      sf.castShadow = true;
      this.lidPivot.add(sf);
    }

    // The order label sticker on the lid
    const labelMat = new THREE.MeshStandardMaterial({ map: this.labelTex, roughness: 0.55, metalness: 0 });
    const label = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.0625), labelMat);
    label.rotation.x = -Math.PI / 2;
    label.rotation.z = 0.05;
    label.position.set(0.02, lidT + 0.004, D / 2 + 0.04);
    label.receiveShadow = true;
    this.lidPivot.add(label);

    this.buildFood(T);

    // Ground that only receives the shadow
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    this.box.add(ground);

    // Steam
    const steamCanvas = document.createElement('canvas');
    drawSteam(steamCanvas);
    const steamTex = new THREE.CanvasTexture(steamCanvas);
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 }));
      s.userData.seed = i * 1.37;
      s.userData.x = -0.75 + (i % 4) * 0.45;
      s.userData.z = -0.6 + ((i * 3) % 5) * 0.28;
      this.box.add(s);
      this.steam.push(s);
    }

    this.box.position.y = -0.32;
  }

  private addFood(mesh: THREE.Object3D, x: number, y: number, z: number, i: number) {
    mesh.position.set(x, y + 1.2, z);
    mesh.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.box.add(mesh);
    const from = 0.32 + i * 0.075;
    this.food.push({ mesh, rest: new THREE.Vector3(x, y, z), from, to: from + 0.24, baseScale: mesh.scale.clone() });
  }

  private buildFood(T: number) {
    let i = 0;
    // Nasi kuning dome, wrapped in paper like the real box
    const rice = new THREE.Group();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xf2b33d, 0.95));
    dome.scale.set(1, 0.92, 1);
    const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.43, 0.16, 40, 1, true), mat(0xfffbf3, 0.9, { side: THREE.DoubleSide }));
    wrap.position.y = 0.07;
    const herb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), mat(0x5e8a3a, 0.8));
    herb.scale.set(1.6, 0.35, 0.8);
    herb.position.set(0.05, 0.38, 0.05);
    rice.add(dome, wrap, herb);
    this.addFood(rice, -0.46, T, -0.3, i++);

    // Ayam bakar
    const chicken = new THREE.Group();
    const thigh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 2), mat(0x8a3f12, 0.6));
    thigh.scale.set(1.25, 0.55, 0.85);
    const glaze = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 2), mat(0x5a2408, 0.45));
    glaze.scale.set(1.2, 0.45, 0.7);
    glaze.position.set(0.08, 0.06, 0.02);
    const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.3, 10), mat(0xf1e2c8, 0.7));
    bone.rotation.z = Math.PI / 2.4;
    bone.position.set(-0.38, 0.06, 0);
    chicken.add(thigh, glaze, bone);
    chicken.rotation.y = 0.5;
    this.addFood(chicken, 0.52, T + 0.14, -0.5, i++);

    // Perkedel
    const perkedel = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 12), mat(0xb9772f, 0.8));
    perkedel.scale.set(1.15, 0.6, 1.15);
    this.addFood(perkedel, 0.66, T + 0.09, 0.34, i++);

    // Sambal cup
    const sambal = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.16, 28, 1, true), mat(0xffffff, 0.4, { side: THREE.DoubleSide, transparent: true, opacity: 0.95 }));
    const chili = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.02, 28), mat(0xc8401e, 0.5));
    chili.position.y = 0.05;
    sambal.add(cup, chili);
    this.addFood(sambal, 0.3, T + 0.08, 0.32, i++);

    // Lalapan: cucumber slices and leaves
    const lalap = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const slice = new THREE.Group();
      const skin = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 24), mat(0x4f7a2d, 0.7));
      const flesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 24), mat(0xd8e6a8, 0.7));
      slice.add(skin, flesh);
      slice.position.set(-0.24 + k * 0.17, 0.03 + k * 0.012, (k % 2) * 0.06);
      slice.rotation.z = 0.18 * (k % 2 ? 1 : -1);
      lalap.add(slice);
    }
    for (let k = 0; k < 3; k++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), mat(0x5e8a3a, 0.8));
      leaf.scale.set(1.4, 0.15, 0.6);
      leaf.position.set(-0.3 + k * 0.28, 0.01, -0.12);
      leaf.rotation.y = k * 0.8;
      lalap.add(leaf);
    }
    this.addFood(lalap, -0.48, T + 0.02, 0.68, i++);

    // Jeruk
    const jeruk = new THREE.Mesh(new THREE.SphereGeometry(0.19, 28, 18), mat(0xf28c1a, 0.55));
    this.addFood(jeruk, 0.55, T + 0.19, 0.72, i++);

    // Kerupuk, resting on the rice
    const kGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 22, 1);
    const pos = kGeo.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v);
      const z = pos.getZ(v);
      const a = Math.atan2(z, x);
      const rr = Math.hypot(x, z);
      const wob = 1 + Math.sin(a * 7) * 0.08;
      pos.setX(v, Math.cos(a) * rr * wob);
      pos.setZ(v, Math.sin(a) * rr * wob);
      pos.setY(v, pos.getY(v) + Math.sin(a * 3) * 0.03 * (rr / 0.22));
    }
    kGeo.computeVertexNormals();
    const kerupuk = new THREE.Mesh(kGeo, mat(0xf6e7c6, 0.95));
    kerupuk.rotation.set(0.35, 0.4, -0.2);
    this.addFood(kerupuk, -0.2, T + 0.42, -0.05, i++);
  }

  /* ------------------------------------------------------------------ slots */

  addSlot(el: HTMLElement, mode: SlotMode) {
    const s: SlotState = { el, mode, visible: false };
    this.slots.push(s);
    this.resizeObserver?.observe(el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) s.visible = e.isIntersecting;
        this.wake();
      },
      { rootMargin: '10% 0px 10% 0px' },
    );
    io.observe(el);
    this.dispose.push(() => io.disconnect());

    if (mode === 'label') {
      // Drag to spin the box
      let dragging = false;
      let lastX = 0;
      el.addEventListener('pointerdown', (e) => {
        dragging = true;
        lastX = e.clientX;
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        this.spinVel = (e.clientX - lastX) * 0.012;
        lastX = e.clientX;
        this.wake();
      });
      const end = () => (dragging = false);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }
  }

  setLabel(c: LabelContent) {
    drawLabel(this.labelCanvas, c);
    this.labelTex.needsUpdate = true;
    this.bump = 1;
    this.wake();
  }

  /* ------------------------------------------------------------------ loop */

  /** Fits the canvas to the slot it lives in and frames the box inside it. */
  private resize() {
    const host = this.host;
    if (!host) return;
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // The box should fill about 58% of the slot's shorter side.
    const fill = 0.58;
    const extent = 2.7;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const worldH = this.camera.aspect >= 1 ? extent / fill : extent / fill / this.camera.aspect;
    this.camera.position.z = worldH / (2 * tanHalf);
    this.camera.updateProjectionMatrix();
    this.wake();
  }

  /** Moves the canvas into the slot that is on screen. */
  private attach(slot: SlotState) {
    if (this.host === slot.el) return;
    this.host?.classList.remove('has-canvas');
    this.host = slot.el;
    slot.el.appendChild(this.canvas);
    slot.el.classList.add('has-canvas');
    this.resize();
  }

  wake() {
    if (!this.running && !document.hidden) {
      this.running = true;
      this.lastT = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private activeSlot(): SlotState | null {
    let best: SlotState | null = null;
    let bestScore = -Infinity;
    const vh = window.innerHeight;
    for (const s of this.slots) {
      if (!s.visible) continue;
      const r = s.el.getBoundingClientRect();
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (visible > bestScore) {
        bestScore = visible;
        best = s;
      }
    }
    return best;
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;
    const slot = this.activeSlot();
    let moving = false;

    if (!slot) {
      this.running = false;
      return;
    }
    this.attach(slot);

    const vh = window.innerHeight;
    const r = slot.el.getBoundingClientRect();
    this.root.position.set(0, slot.mode === 'hero' ? -0.28 : -0.12, 0);

    if (slot.mode !== this.activeMode) {
      this.activeMode = slot.mode;
      this.fade = 0;
    }
    this.fade = Math.min(1, this.fade + dt * 1.6);

    // Targets per mode
    if (slot.mode === 'hero') {
      // Progress through the hero: a pinned scroll section when there is one.
      const track = slot.el.closest<HTMLElement>('[data-box-scroll]');
      let scrolled: number;
      if (track && getComputedStyle(slot.el.closest<HTMLElement>('[data-box-pin]') ?? slot.el).position === 'sticky') {
        const tr = track.getBoundingClientRect();
        scrolled = clamp01(-tr.top / Math.max(1, tr.height - vh));
      } else {
        scrolled = clamp01(-r.top / (Math.max(1, r.height) * 0.7));
      }
      this.intro = this.reduced ? 1 : Math.min(1, this.intro + dt / 2.4);
      const introEased = easeInOutCubic(this.intro);
      this.lidTarget = this.reduced ? 1 : clamp01(introEased * 0.62 + scrolled * 0.6);
      this.orientTarget.x = 0.62 + scrolled * 0.18;
      this.orientTarget.y = -0.62 + scrolled * 0.5;
    } else {
      this.lidTarget = 0;
      this.orientTarget.x = 1.02;
      this.orientTarget.y = -0.18;
    }

    const ease = 1 - Math.pow(0.0015, dt);
    this.lid = lerp(this.lid, this.lidTarget, this.reduced ? 1 : ease * 0.9);
    this.orient.x = lerp(this.orient.x, this.orientTarget.x, ease);
    this.orient.y = lerp(this.orient.y, this.orientTarget.y, ease);
    this.pointerSmooth.lerp(this.pointer, this.reduced ? 1 : ease * 0.6);
    this.spinVel *= Math.pow(0.04, dt);
    this.spin += this.spinVel * (this.reduced ? 0 : 1);
    if (slot.mode === 'label') this.spin = lerp(this.spin, Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2, ease * 0.25);
    this.bump = Math.max(0, this.bump - dt * 2.2);

    const tiltStrength = this.reduced ? 0 : 0.14;
    this.tilt.rotation.set(
      this.orient.x + this.pointerSmooth.y * tiltStrength,
      this.orient.y + this.pointerSmooth.x * tiltStrength + this.spin,
      0,
    );
    const pulse = this.reduced ? 0 : Math.sin(this.bump * Math.PI) * 0.06;
    this.box.scale.setScalar(1 + pulse);
    if (!this.reduced && slot.mode === 'hero') this.box.position.y = -0.32 + Math.sin(now / 1400) * 0.035;

    // Lid swings back on its hinge
    this.lidPivot.rotation.x = -easeOutCubic(this.lid) * 1.95;

    // Food drops in with a squash and settle. Under the label the box is closed,
    // so the food simply rests inside.
    const foodDrive = slot.mode === 'hero' ? this.lid : 1;
    for (const f of this.food) {
      const t = clamp01((foodDrive - f.from) / (f.to - f.from));
      const fall = t < 0.7 ? Math.pow(t / 0.7, 2) : 1;
      const settle = t < 0.7 ? 0 : (t - 0.7) / 0.3;
      const y = lerp(f.rest.y + 1.2, f.rest.y, fall) + (settle > 0 ? Math.sin(settle * Math.PI) * 0.06 * (1 - settle) : 0);
      f.mesh.position.y = y;
      const squash = settle > 0 ? Math.sin(Math.min(1, settle * 2.2) * Math.PI) * 0.22 * (1 - settle) : 0;
      f.mesh.scale.set(f.baseScale.x * (1 + squash * 0.5), f.baseScale.y * (1 - squash), f.baseScale.z * (1 + squash * 0.5));
      f.mesh.visible = t > 0;
    }

    // Steam rises once the food is in
    const steamOn = clamp01((this.lid - 0.7) / 0.3) * (slot.mode === 'hero' ? 1 : 0);
    for (const s of this.steam) {
      const seed = s.userData.seed as number;
      const p = ((now / 1000) * 0.22 + seed * 0.31) % 1;
      s.position.set(s.userData.x + Math.sin(p * 6 + seed) * 0.08, 0.5 + p * 1.6, s.userData.z);
      s.scale.setScalar(0.25 + p * 0.5);
      (s.material as THREE.SpriteMaterial).opacity = this.reduced ? 0 : steamOn * Math.sin(p * Math.PI) * 0.32;
    }

    this.canvas.style.opacity = String(easeOutCubic(this.fade));

    const unsettled =
      Math.abs(this.lid - this.lidTarget) > 0.001 ||
      Math.abs(this.orient.x - this.orientTarget.x) > 0.001 ||
      Math.abs(this.orient.y - this.orientTarget.y) > 0.001 ||
      this.pointerSmooth.distanceTo(this.pointer) > 0.001 ||
      Math.abs(this.spinVel) > 0.0005 ||
      this.bump > 0 ||
      this.fade < 1 ||
      (slot.mode === 'hero' && this.intro < 1);
    moving = unsettled || steamOn > 0 || (!this.reduced && slot.mode === 'hero');

    this.renderer.render(this.scene, this.camera);

    if (moving) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
    }
  };

  destroy() {
    this.stop();
    for (const d of this.dispose) d();
    this.renderer.dispose();
  }
}
