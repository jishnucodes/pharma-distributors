import * as THREE from "three";
import {
  applyStudioLighting,
  buildCapsuleHalf,
  createRenderer,
  disposeObject,
  FrameClock,
} from "./models";

/**
 * Scroll story, as stages:
 *   0 closed capsule  →  1 opens, granules spill  →  2 Lakshmi half in focus
 *   →  3 Kothittil half in focus  →  4 halves rejoin ("one network")
 * Scroll progress (0–1) maps to a continuous stage value with short holds on
 * each stage so the text beside it has time to be read.
 */
const STAGE_KEYS: Array<[number, number]> = [
  [0.0, 0], [0.08, 0], [0.2, 1], [0.3, 1], [0.42, 2], [0.54, 2],
  [0.66, 3], [0.78, 3], [0.9, 4], [1.0, 4],
];

export function stageFromProgress(p: number) {
  for (let i = 1; i < STAGE_KEYS.length; i++) {
    const [p1, s1] = STAGE_KEYS[i];
    const [p0, s0] = STAGE_KEYS[i - 1];
    if (p <= p1) {
      const t = (p - p0) / Math.max(p1 - p0, 1e-6);
      return s0 + (s1 - s0) * t;
    }
  }
  return 4;
}

const STAGE_COUNT = 5;

interface Pose {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
}
interface StageState {
  cap: Pose;
  body: Pose;
  spread: number; // granule burst 0..1
  cloud: [number, number, number];
}

const HALF_PI = Math.PI / 2;

function stages(narrow: boolean): StageState[] {
  if (narrow) {
    // Portrait: text sits in the top or bottom third, model in the remaining space
    return [
      { cap: P([0, -1.75, 0], [0.25, 0, -0.5], 0.8), body: P([0, -1.75, 0], [0.25, 0, -0.5], 0.8), spread: 0, cloud: [0, -1.75, 0] },
      { cap: P([0, 1.32, 0], [0.2, 0, 0], 0.8), body: P([0, 0.42, 0], [0.2, 0, 0], 0.8), spread: 0.8, cloud: [0, 0.9, -0.5] },
      { cap: P([-0.95, 1.55, 0.6], [0.35, 0, -HALF_PI + 0.3], 1.05), body: P([6, -9, -8], [0, 0, 0.6]), spread: 0.55, cloud: [0, 1.2, -1] },
      { cap: P([-6, 9, -8], [0, 0, -0.6]), body: P([0.95, 1.55, 0.6], [0.35, 0, -HALF_PI - 0.3], 1.05), spread: 0.55, cloud: [0, 1.2, -1] },
      { cap: P([0, 1.2, 0], [0.3, 0, -1.2], 0.85), body: P([0, 1.2, 0], [0.3, 0, -1.2], 0.85), spread: 0, cloud: [0, 1.2, 0] },
    ];
  }
  return [
    { cap: P([1.9, 0, 0], [0.3, 0, -0.85]), body: P([1.9, 0, 0], [0.3, 0, -0.85]), spread: 0, cloud: [1.9, 0, 0] },
    { cap: P([1.35, 0.35, 0], [0.2, 0, -HALF_PI]), body: P([-1.35, 0.35, 0], [0.2, 0, -HALF_PI]), spread: 1, cloud: [0, 0.35, 0] },
    { cap: P([1.0, 0, 0.8], [0.35, 0, -HALF_PI + 0.35], 1.2), body: P([-14, -7, -9], [0, 0, -1]), spread: 0.5, cloud: [2.0, 0, -1] },
    { cap: P([-14, 7, -9], [0, 0, 1]), body: P([3.0, 0, 0.8], [0.35, 0, -HALF_PI - 0.35], 1.2), spread: 0.5, cloud: [2.0, 0, -1] },
    { cap: P([0, 0.55, 0], [0.25, 0, -HALF_PI + 0.15], 1.05), body: P([0, 0.55, 0], [0.25, 0, -HALF_PI + 0.15], 1.05), spread: 0, cloud: [0, 0.55, 0] },
  ];
}

function P(pos: Pose["pos"], rot: Pose["rot"], scale = 1): Pose {
  return { pos, rot, scale };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = THREE.MathUtils.lerp;

function blendPose(a: Pose, b: Pose, t: number, out: THREE.Object3D, spin: number) {
  out.position.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
  // Z sets the axis direction in screen space; spin turns the shell about its own axis
  out.rotation.set(lerp(a.rot[0], b.rot[0], t), 0, lerp(a.rot[2], b.rot[2], t), "XZY");
  out.rotateY(spin);
  out.scale.setScalar(lerp(a.scale, b.scale, t));
}

export interface CapsuleHeroOptions {
  capColor: string;
  bodyColor: string;
  capLabel: string;
  bodyLabel: string;
  reducedMotion: boolean;
}

export class CapsuleHeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  private cap: THREE.Mesh;
  private body: THREE.Mesh;
  private granules: THREE.InstancedMesh;
  private granuleData: Array<{ dir: THREE.Vector3; dist: number; phase: number; size: number }> = [];
  private dummy = new THREE.Object3D();
  private narrow = false;
  private states: StageState[];
  private target = 0;
  private stage = 0;
  private spin = 0;
  private pointer = new THREE.Vector2();
  private pointerSmoothed = new THREE.Vector2();
  private clock = new FrameClock();
  private raf = 0;
  private running = false;

  constructor(private canvas: HTMLCanvasElement, private opts: CapsuleHeroOptions) {
    this.renderer = createRenderer(canvas, 1.75);
    applyStudioLighting(this.renderer, this.scene);

    this.cap = buildCapsuleHalf({ color: opts.capColor, label: opts.capLabel, isCap: true });
    this.body = buildCapsuleHalf({ color: opts.bodyColor, label: opts.bodyLabel, isCap: false });
    this.scene.add(this.cap, this.body);

    const count = window.innerWidth < 768 ? 140 : 260;
    this.granules = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.055, 1),
      new THREE.MeshStandardMaterial({ color: "#FFFDF6", roughness: 0.55 }),
      count
    );
    const tintA = new THREE.Color(opts.capColor).lerp(new THREE.Color("#ffffff"), 0.55);
    const tintB = new THREE.Color(opts.bodyColor).lerp(new THREE.Color("#ffffff"), 0.55);
    const white = new THREE.Color("#FFFDF6");
    for (let i = 0; i < count; i++) {
      this.granuleData.push({
        dir: new THREE.Vector3().randomDirection(),
        dist: 1.2 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2,
        size: 0.6 + Math.random() * 0.9,
      });
      this.granules.setColorAt(i, i % 5 === 0 ? tintA : i % 5 === 1 ? tintB : white);
    }
    this.scene.add(this.granules);

    this.states = stages(false);
    this.resize();
    window.addEventListener("pointermove", this.onPointer, { passive: true });
  }

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };

  setProgress(p: number) {
    this.target = stageFromProgress(THREE.MathUtils.clamp(p, 0, 1));
    if (this.opts.reducedMotion) this.stage = this.target;
    if (!this.running) this.render(0);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.narrow = w / h < 0.9;
    this.states = stages(this.narrow);
    // Keep the model a similar on-screen size across aspect ratios
    this.camera.position.set(0, 0, this.narrow ? 11.5 : Math.max(9, 12 - (w / h) * 1.6));
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render(0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    const loop = () => {
      if (!this.running) return;
      this.render(Math.min(this.clock.getDelta(), 0.05));
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private render(dt: number) {
    const rm = this.opts.reducedMotion;
    // Critically-damped follow so fast flicks of the scroll wheel still read smoothly
    this.stage = rm ? this.target : lerp(this.stage, this.target, 1 - Math.exp(-dt * 5));
    if (!rm) this.spin += dt * 0.35;

    const i0 = Math.floor(this.stage);
    const i1 = Math.min(i0 + 1, STAGE_COUNT - 1);
    const t = ease(this.stage - i0);
    const a = this.states[i0];
    const b = this.states[i1];

    blendPose(a.cap, b.cap, t, this.cap, this.spin);
    blendPose(a.body, b.body, t, this.body, -this.spin);
    const bob = rm ? 0 : Math.sin(this.clock.elapsedTime * 0.9) * 0.06;
    this.cap.position.y += bob;
    this.body.position.y += bob;

    const spread = lerp(a.spread, b.spread, t);
    const cx = lerp(a.cloud[0], b.cloud[0], t);
    const cy = lerp(a.cloud[1], b.cloud[1], t);
    const cz = lerp(a.cloud[2], b.cloud[2], t);
    const time = this.clock.elapsedTime;
    const visible = THREE.MathUtils.smoothstep(spread, 0.02, 0.35);
    this.granules.visible = visible > 0.001;
    if (this.granules.visible) {
      for (let i = 0; i < this.granuleData.length; i++) {
        const g = this.granuleData[i];
        const drift = rm ? 0 : Math.sin(time * 0.6 + g.phase) * 0.12;
        const d = g.dist * spread + drift;
        this.dummy.position.set(cx + g.dir.x * d * 1.4, cy + g.dir.y * d, cz + g.dir.z * d * 0.8);
        this.dummy.rotation.set(g.phase + time * 0.3, g.phase, 0);
        this.dummy.scale.setScalar(g.size * visible);
        this.dummy.updateMatrix();
        this.granules.setMatrixAt(i, this.dummy.matrix);
      }
      this.granules.instanceMatrix.needsUpdate = true;
    }

    // Gentle parallax on desktop pointers only
    this.pointerSmoothed.lerp(this.pointer, 1 - Math.exp(-dt * 3));
    this.camera.position.x = this.pointerSmoothed.x * 0.35;
    this.camera.position.y = -this.pointerSmoothed.y * 0.25;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    window.removeEventListener("pointermove", this.onPointer);
    disposeObject(this.scene);
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }
}
