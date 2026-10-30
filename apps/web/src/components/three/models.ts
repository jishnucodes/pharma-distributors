import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ------------------------------------------------------------------ */
/* Shared stage                                                        */
/* ------------------------------------------------------------------ */

/** Minimal frame timer (THREE.Clock is deprecated in recent three.js). */
export class FrameClock {
  elapsedTime = 0;
  private last = performance.now();
  getDelta() {
    const now = performance.now();
    const dt = (now - this.last) / 1000;
    this.last = now;
    this.elapsedTime += dt;
    return dt;
  }
}

export function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function createRenderer(canvas: HTMLCanvasElement, maxDpr = 2) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}

/** Soft studio reflections without shipping an HDR file, cached globally for high performance. */
let cachedEnvTexture: THREE.Texture | null = null;

export function applyStudioLighting(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  if (!cachedEnvTexture) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    cachedEnvTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }
  scene.environment = cachedEnvTexture;

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff3e0, 0.8);
  rim.position.set(-5, -2, -3);
  scene.add(rim);
  return cachedEnvTexture;
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
      m.dispose();
    }
  });
}

/* ------------------------------------------------------------------ */
/* Fonts                                                               */
/* ------------------------------------------------------------------ */

/** Font family resolved from the page (next/font uses hashed family names). */
export function pageFont(variable: "--font-sans" | "--font-display" = "--font-sans") {
  if (typeof document === "undefined") return "sans-serif";
  const fam = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return fam || "system-ui, sans-serif";
}

/* ------------------------------------------------------------------ */
/* Capsule                                                             */
/* ------------------------------------------------------------------ */

export const CAPSULE = { radius: 0.62, halfLength: 1.85, overlap: 0.25 };

/**
 * One shell of a two-piece capsule. Built along +Y from the open end to the
 * rounded tip; the "cap" piece is a touch wider so it sleeves over the body.
 */
export function buildCapsuleHalf(opts: {
  color: string;
  label?: string;
  isCap: boolean;
  radius?: number;
  halfLength?: number;
}) {
  const r = (opts.radius ?? CAPSULE.radius) * (opts.isCap ? 1.035 : 1);
  const len = opts.halfLength ?? CAPSULE.halfLength;
  const start = -CAPSULE.overlap;
  const pts: THREE.Vector2[] = [];
  // Inner lip so the open end reads as a shell, not a paper-thin surface
  pts.push(new THREE.Vector2(r * 0.94, start + 0.02));
  pts.push(new THREE.Vector2(r, start));
  const cylEnd = start + len - r;
  for (let i = 1; i <= 6; i++) pts.push(new THREE.Vector2(r, start + ((cylEnd - start) * i) / 6));
  for (let i = 1; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * r, cylEnd + Math.sin(a) * r));
  }
  pts[pts.length - 1].x = 0.0001;

  const geo = new THREE.LatheGeometry(pts, 64);
  // Re-derive V from height so a label texture maps cleanly along the shell
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const top = start + len;
  for (let i = 0; i < pos.count; i++) uv.setY(i, (pos.getY(i) - start) / (top - start));
  if (!opts.isCap) geo.rotateZ(Math.PI); // body points the other way

  const map = opts.label
    ? capsulePrint(opts.color, opts.label, (opts.isCap ? 0.36 : 0.47) /* visible band centre */)
    : null;
  if (map && !opts.isCap) {
    // Body geometry is turned 180°, so turn the print too and both halves read the same way
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(-1, -1);
  }

  const mat = new THREE.MeshPhysicalMaterial({
    color: map ? 0xffffff : opts.color,
    map,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geo, mat);
}

/** Print that runs along the capsule's length, like a real imprint, twice around. */
function capsulePrint(color: string, text: string, centreV: number) {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 54px ${pageFont()}`;
  const y = (1 - centreV) * H;
  for (const u of [0.25, 0.75]) {
    ctx.save();
    ctx.translate(u * W, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(text, 0, 0, H * 0.62);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function buildCapsule(capColor: string, bodyColor: string, scale = 1) {
  const g = new THREE.Group();
  g.add(buildCapsuleHalf({ color: capColor, isCap: true }));
  g.add(buildCapsuleHalf({ color: bodyColor, isCap: false }));
  g.scale.setScalar(scale);
  return g;
}

/* ------------------------------------------------------------------ */
/* Tablet                                                              */
/* ------------------------------------------------------------------ */

export function tabletGeometry(radius = 1, thickness = 0.42, edge = 0.16) {
  const dome = thickness * 0.1;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, thickness / 2)];
  // Slightly domed face
  for (let i = 1; i <= 6; i++) {
    const x = ((radius - edge) * i) / 6;
    pts.push(new THREE.Vector2(x, thickness / 2 - dome * (x / radius) ** 2));
  }
  for (let i = 1; i <= 12; i++) {
    const a = Math.PI / 2 - (i / 12) * Math.PI;
    pts.push(
      new THREE.Vector2(radius - edge + Math.cos(a) * edge, Math.sin(a) * (thickness / 2 - dome))
    );
  }
  for (let i = 5; i >= 0; i--) {
    const x = ((radius - edge) * i) / 6;
    pts.push(new THREE.Vector2(x, -thickness / 2 + dome * (x / radius) ** 2));
  }
  pts[pts.length - 1].x = 0.0001;
  pts[0].x = 0.0001;
  const geo = new THREE.LatheGeometry(pts, 48);
  geo.rotateX(Math.PI / 2); // face the camera (+Z)
  return geo;
}

export function buildTablet(tint: string, radius = 1) {
  const g = new THREE.Group();
  const base = new THREE.Color("#F7F5EF").lerp(new THREE.Color(tint), 0.12);
  const mat = new THREE.MeshPhysicalMaterial({ color: base, roughness: 0.55, sheen: 0.4 });
  g.add(new THREE.Mesh(tabletGeometry(radius, radius * 0.42, radius * 0.16), mat));
  // Score line, both faces
  const scoreMat = new THREE.MeshStandardMaterial({ color: base.clone().multiplyScalar(0.78), roughness: 0.8 });
  for (const z of [1, -1]) {
    const score = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.55, radius * 0.06, 0.02), scoreMat);
    score.position.z = z * radius * 0.19;
    g.add(score);
  }
  return g;
}
