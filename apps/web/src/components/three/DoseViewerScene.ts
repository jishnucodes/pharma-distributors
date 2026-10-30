import * as THREE from "three";
import { applyStudioLighting, buildCapsule, buildTablet, createRenderer, disposeObject, FrameClock } from "./models";

export interface DoseViewerOptions {
  accent: string;
  reducedMotion: boolean;
}

/** Company-page hero: capsule and tablets on a turntable; drag to turn, eases back to a slow sway. */
export class DoseViewerScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  private pivot = new THREE.Group();
  private clock = new FrameClock();
  private raf = 0;
  private running = false;
  private drag = { active: false, x: 0, y: 0, id: -1 };
  private rot = new THREE.Vector2(); // user rotation offset
  private vel = new THREE.Vector2();
  private fitRadius = 2;

  constructor(private canvas: HTMLCanvasElement, private opts: DoseViewerOptions) {
    this.renderer = createRenderer(canvas, 2);
    applyStudioLighting(this.renderer, this.scene);
    this.scene.add(this.pivot);
    this.build();
    this.resize();

    // Shader pre-warm on GPU
    this.renderer.compile(this.scene, this.camera);
    this.render(0);

    canvas.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    window.addEventListener("pointercancel", this.onUp);
  }

  private build() {
    const { accent } = this.opts;
    const capsule = buildCapsule(accent, "#F4F1EA", 0.9);
    capsule.rotation.z = -0.9;
    this.pivot.add(capsule);
    const tablet = buildTablet(accent, 0.62);
    tablet.position.set(-1.25, -1.0, 0.6);
    tablet.rotation.set(0.5, 0.7, 0);
    this.pivot.add(tablet);
    const tablet2 = buildTablet(accent, 0.45);
    tablet2.position.set(1.3, 1.15, -0.4);
    tablet2.rotation.set(-0.4, -0.6, 0.3);
    this.pivot.add(tablet2);
    this.fitRadius = 2.1;
  }

  private onDown = (e: PointerEvent) => {
    this.drag = { active: true, x: e.clientX, y: e.clientY, id: e.pointerId };
    this.canvas.setPointerCapture?.(e.pointerId);
  };
  private onMove = (e: PointerEvent) => {
    if (!this.drag.active || e.pointerId !== this.drag.id) return;
    const dx = (e.clientX - this.drag.x) / 120;
    const dy = (e.clientY - this.drag.y) / 160;
    this.drag.x = e.clientX;
    this.drag.y = e.clientY;
    this.rot.x += dx;
    this.rot.y = THREE.MathUtils.clamp(this.rot.y + dy, -0.9, 0.9);
    this.vel.set(dx, dy);
    if (!this.running) this.render(0);
  };
  private onUp = (e: PointerEvent) => {
    if (e.pointerId === this.drag.id) this.drag.active = false;
  };

  resize() {
    const w = this.canvas.clientWidth || 300;
    const h = this.canvas.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const fov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const fitH = this.fitRadius / Math.tan(fov);
    const fitW = this.fitRadius / (Math.tan(fov) * this.camera.aspect);
    this.camera.position.set(0, 0, Math.max(fitH, fitW) * 1.08);
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
    // Release drag friction
    if (!this.drag.active) {
      this.rot.x += this.vel.x;
      this.rot.y += this.vel.y;
      this.vel.multiplyScalar(0.92);
      this.rot.x = THREE.MathUtils.lerp(this.rot.x, 0, 1 - Math.exp(-dt * 0.8));
      this.rot.y = THREE.MathUtils.lerp(this.rot.y, 0, 1 - Math.exp(-dt * 1.5));
    }
    const t = this.clock.elapsedTime;
    const sway = rm ? 0 : Math.sin(t * 0.5) * 0.25;
    this.pivot.rotation.set(this.rot.y, this.rot.x + sway, 0);
    if (!rm) this.pivot.position.y = Math.sin(t * 0.8) * 0.05;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.canvas.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("pointercancel", this.onUp);
    disposeObject(this.scene);
    this.renderer.dispose();
  }
}
