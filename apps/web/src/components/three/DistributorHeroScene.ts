import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export interface DistributorHeroSceneOptions {
  accent: string;
  accentDeep?: string;
  accentSoft?: string;
  companyName?: string;
  reducedMotion: boolean;
}

interface ParticleSpec {
  baseAngle: number;
  radius: number;
  y: number;
  speed: number;
  phase: number;
  scale: number;
  tilt: number;
}

function resolvePageFont(): string {
  if (typeof document === "undefined") return "system-ui, -apple-system, sans-serif";
  const fam = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim();
  return fam || "system-ui, -apple-system, sans-serif";
}

function formatDistributorHeadline(companyName?: string): string {
  const clean = (companyName ?? "").trim();
  if (!clean) return "AUTHORISED PHARMA";
  if (/pharma/i.test(clean)) return clean.toUpperCase();
  return `${clean.toUpperCase()} PHARMA`;
}

/**
 * Self-contained Three.js hero composition for pharmaceutical distributor storefronts.
 * Creates and disposes its own PMREM environment per WebGL context to prevent cross-context leaks.
 */
export class DistributorHeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  private stageRoot = new THREE.Group();
  private heroPivot = new THREE.Group();
  private ringGroup1 = new THREE.Group();
  private ringGroup2 = new THREE.Group();
  private particlesMesh: THREE.InstancedMesh | null = null;
  private particleSpecs: ParticleSpec[] = [];
  private particleDummy = new THREE.Object3D();

  private pmrem: THREE.PMREMGenerator;
  private envTexture: THREE.Texture;
  private trackedTextures: THREE.Texture[] = [];

  private raf = 0;
  private running = false;
  private disposed = false;
  private lastFrameMs = 0;
  private elapsed = 0;

  private drag = { active: false, x: 0, y: 0, id: -1 };
  private rot = new THREE.Vector2();
  private vel = new THREE.Vector2();
  private hoverTarget = new THREE.Vector2();
  private hoverCurrent = new THREE.Vector2();

  private fitRadius = 2.48;
  private viewWidth = 300;
  private viewHeight = 300;
  private appliedDpr = 0;

  private accentColor: THREE.Color;
  private deepColor: THREE.Color;
  private softColor: THREE.Color;

  constructor(private canvas: HTMLCanvasElement, private opts: DistributorHeroSceneOptions) {
    this.accentColor = new THREE.Color(opts.accent);
    this.deepColor = new THREE.Color(opts.accentDeep ?? opts.accent);
    this.softColor = new THREE.Color(opts.accentSoft ?? "#F6F4EF");

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;

    // Per-instance RoomEnvironment PMREM (disposed in dispose() for cross-context safety)
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envTexture = this.pmrem.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    this.scene.environment = this.envTexture;

    this.setupLighting();
    this.scene.add(this.stageRoot);
    this.stageRoot.add(this.heroPivot);

    this.buildGroundShadow();
    this.buildPharmaceuticalVial();
    this.buildTwoToneCapsule();
    this.buildClinicalTablets();
    this.buildOrbitalArchitecture();
    this.buildMolecularNodes();

    this.resize();
    this.renderer.compile(this.scene, this.camera);
    this.renderFrame(0);

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onCanvasHover);
    canvas.addEventListener("pointerleave", this.onCanvasLeave);
    window.addEventListener("pointermove", this.onWindowPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
  }

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0xeee8dc, 0.72);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.55);
    key.position.set(3.5, 5.5, 6.2);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xeef5ff, 0.95);
    rim.position.set(-5.2, 2.4, -3.8);
    this.scene.add(rim);

    const accentFill = new THREE.PointLight(this.accentColor, 1.75, 11, 1.6);
    accentFill.position.set(2.4, -1.6, 3.2);
    this.scene.add(accentFill);
  }

  private createRxLabelTexture(): THREE.CanvasTexture {
    const W = 1024;
    const H = 512;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const font = resolvePageFont();
    const accentHex = `#${this.accentColor.getHexString()}`;
    const deepHex = `#${this.deepColor.getHexString()}`;

    ctx.clearRect(0, 0, W, H);

    // Main clinical paper label (left 76% of arc), leaving right 24% transparent for serum & calibration marks
    const labelW = Math.round(W * 0.76);
    const pad = 16;

    ctx.fillStyle = "#FCFBF8";
    ctx.beginPath();
    ctx.roundRect(pad, pad, labelW - pad * 2, H - pad * 2, 18);
    ctx.fill();

    ctx.strokeStyle = "#DED9CE";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Accent header bar
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pad, pad, labelW - pad * 2, 108, [18, 18, 0, 0]);
    ctx.clip();
    ctx.fillStyle = accentHex;
    ctx.fillRect(pad, pad, labelW - pad * 2, 108);

    // Subtle deep accent stripe at base of header
    ctx.fillStyle = deepHex;
    ctx.fillRect(pad, pad + 96, labelW - pad * 2, 12);
    ctx.restore();

    // Header badge text
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = `700 24px ${font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText("AUTHORISED DIST.", pad + 32, pad + 52);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = `700 21px ${font}`;
    ctx.fillText("STERILE · USP", labelW - pad - 32, pad + 52);

    // Distributor title
    const headline = formatDistributorHeadline(this.opts.companyName);
    ctx.textAlign = "left";
    ctx.fillStyle = "#13221F";
    ctx.font = `800 44px ${font}`;
    ctx.fillText(headline, pad + 32, 188, labelW - pad * 2 - 64);

    // Sub-spec rule
    ctx.fillStyle = deepHex;
    ctx.font = `700 23px ${font}`;
    ctx.fillText("ETHICAL & COLD-CHAIN SUPPLY", pad + 32, 240, labelW - pad * 2 - 64);

    ctx.strokeStyle = "#E7E2D8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad + 32, 276);
    ctx.lineTo(labelW - pad - 32, 276);
    ctx.stroke();

    // Batch metadata
    ctx.fillStyle = "#53615D";
    ctx.font = `600 20px ${font}`;
    ctx.fillText("BATCH: LK-2026-04", pad + 32, 318);
    ctx.fillText("STORE 2°C – 8°C / CONTROLLED", pad + 32, 352);

    // Clinical micro-barcode at bottom left
    const barStartX = pad + 32;
    const barY = 392;
    const barPattern = [4, 2, 7, 2, 3, 5, 2, 8, 3, 2, 5, 4, 2, 6, 3, 2, 7, 3, 4, 2, 6, 3, 2, 5];
    let bx = barStartX;
    ctx.fillStyle = "#13221F";
    for (let i = 0; i < barPattern.length; i++) {
      const w = barPattern[i] * 2.1;
      if (i % 2 === 0) ctx.fillRect(bx, barY, w, 58);
      bx += w + 3;
    }

    // Rx seal emblem on bottom right of label
    const sealX = labelW - pad - 74;
    const sealY = 418;
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = accentHex;
    ctx.font = `800 28px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText("Rx", sealX, sealY + 2);

    // Calibrated volume tick marks in the transparent glass window (right 24%)
    const scaleX = labelW + 24;
    ctx.textAlign = "left";
    ctx.font = `700 20px ${font}`;
    const ticks = [
      { y: 92, label: "10 mL", major: true },
      { y: 158, label: "", major: false },
      { y: 224, label: "5 mL", major: true },
      { y: 290, label: "", major: false },
      { y: 356, label: "2.5", major: true },
      { y: 422, label: "", major: false },
    ];
    for (const tk of ticks) {
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(scaleX, tk.y - 2, tk.major ? 44 : 24, 4);
      if (tk.label) {
        ctx.fillStyle = "#13221F";
        ctx.fillText(tk.label, scaleX + 54, tk.y + 1);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.trackedTextures.push(tex);
    return tex;
  }

  private createShadowTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const r = Math.round(this.deepColor.r * 110 + 19 * 0.65);
    const g = Math.round(this.deepColor.g * 110 + 34 * 0.65);
    const b = Math.round(this.deepColor.b * 110 + 31 * 0.65);

    const grad = ctx.createRadialGradient(size / 2, size / 2, 12, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.22)`);
    grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.09)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.trackedTextures.push(tex);
    return tex;
  }

  private buildGroundShadow() {
    const tex = this.createShadowTexture();
    const geo = new THREE.PlaneGeometry(4.5, 4.5);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(geo, mat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -1.72, 0);
    this.stageRoot.add(shadow);
  }

  private buildPharmaceuticalVial() {
    const vialGroup = new THREE.Group();

    // 1. Sterile liquid formulation core inside the vial (with concave meniscus)
    const liquidPts: THREE.Vector2[] = [
      new THREE.Vector2(0.0001, -0.99),
      new THREE.Vector2(0.55, -0.99),
      new THREE.Vector2(0.585, -0.92),
      new THREE.Vector2(0.585, 0.22),
      new THREE.Vector2(0.42, 0.18),
      new THREE.Vector2(0.20, 0.16),
      new THREE.Vector2(0.0001, 0.155),
    ];
    const liquidGeo = new THREE.LatheGeometry(liquidPts, 56);
    const liquidColor = this.accentColor.clone().lerp(this.softColor, 0.14);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: liquidColor,
      emissive: this.accentColor,
      emissiveIntensity: 0.12,
      roughness: 0.14,
      metalness: 0.02,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.78,
      envMapIntensity: 1.35,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.renderOrder = 1;
    vialGroup.add(liquidMesh);

    // Bright meniscus rim highlight
    const meniscusGeo = new THREE.TorusGeometry(0.57, 0.015, 12, 48);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: this.softColor.clone().lerp(new THREE.Color(0xffffff), 0.55),
      emissive: this.accentColor,
      emissiveIntensity: 0.25,
      roughness: 0.2,
    });
    const meniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscus.rotation.x = Math.PI / 2;
    meniscus.position.y = 0.215;
    meniscus.renderOrder = 2;
    vialGroup.add(meniscus);

    // 2. Curved high-DPI Rx / Distributor Batch Label wrapped around front arc
    const labelTex = this.createRxLabelTexture();
    const labelGeo = new THREE.CylinderGeometry(0.675, 0.675, 0.96, 64, 1, true, -Math.PI * 0.66, Math.PI * 1.32);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTex,
      roughness: 0.64,
      metalness: 0.02,
      transparent: true,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = -0.32;
    labelMesh.renderOrder = 4;
    vialGroup.add(labelMesh);

    // 3. Outer borosilicate glass shell (crystal-clear specular glass safe with alpha:true)
    const glassPts: THREE.Vector2[] = [
      new THREE.Vector2(0.0001, -1.10),
      new THREE.Vector2(0.54, -1.10),
      new THREE.Vector2(0.64, -1.04),
      new THREE.Vector2(0.668, -0.94),
      new THREE.Vector2(0.668, 0.36),
      new THREE.Vector2(0.64, 0.48),
      new THREE.Vector2(0.46, 0.62),
      new THREE.Vector2(0.35, 0.72),
      new THREE.Vector2(0.34, 0.94),
      new THREE.Vector2(0.395, 0.97),
      new THREE.Vector2(0.395, 1.04),
      new THREE.Vector2(0.31, 1.04),
      new THREE.Vector2(0.29, 0.94),
    ];
    const glassGeo = new THREE.LatheGeometry(glassPts, 64);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fbff,
      roughness: 0.05,
      metalness: 0.04,
      ior: 1.52,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.85,
      transparent: true,
      opacity: 0.27,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.renderOrder = 3;
    vialGroup.add(glassMesh);

    // Thick borosilicate base heel disc
    const baseHeelGeo = new THREE.CylinderGeometry(0.62, 0.56, 0.09, 48);
    const baseHeelMat = new THREE.MeshPhysicalMaterial({
      color: 0xeef5fc,
      roughness: 0.12,
      clearcoat: 0.9,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const baseHeel = new THREE.Mesh(baseHeelGeo, baseHeelMat);
    baseHeel.position.y = -1.045;
    baseHeel.renderOrder = 2;
    vialGroup.add(baseHeel);

    // 4. Matte pharmaceutical elastomer stopper
    const stopperGeo = new THREE.CylinderGeometry(0.32, 0.30, 0.14, 40);
    const stopperMat = new THREE.MeshStandardMaterial({
      color: 0x2d373b,
      roughness: 0.82,
      metalness: 0.05,
    });
    const stopper = new THREE.Mesh(stopperGeo, stopperMat);
    stopper.position.y = 1.01;
    vialGroup.add(stopper);

    // 5. Machined brushed aluminum crimp collar
    const collarPts: THREE.Vector2[] = [
      new THREE.Vector2(0.34, 0.88),
      new THREE.Vector2(0.415, 0.89),
      new THREE.Vector2(0.435, 0.94),
      new THREE.Vector2(0.435, 1.12),
      new THREE.Vector2(0.415, 1.15),
      new THREE.Vector2(0.24, 1.15),
      new THREE.Vector2(0.24, 1.11),
    ];
    const collarGeo = new THREE.LatheGeometry(collarPts, 56);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xe5e9ef,
      metalness: 0.88,
      roughness: 0.24,
      envMapIntensity: 1.45,
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    vialGroup.add(collar);

    // Knurled rib accent on crimp collar
    const ribGeo = new THREE.TorusGeometry(0.436, 0.011, 10, 56);
    const rib = new THREE.Mesh(ribGeo, collarMat);
    rib.rotation.x = Math.PI / 2;
    rib.position.y = 0.97;
    vialGroup.add(rib);

    // 6. Anodized accent flip-off tamper seal cap
    const capGeo = new THREE.CylinderGeometry(0.435, 0.445, 0.085, 56);
    const capMat = new THREE.MeshPhysicalMaterial({
      color: this.deepColor,
      metalness: 0.32,
      roughness: 0.24,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
    });
    const flipCap = new THREE.Mesh(capGeo, capMat);
    flipCap.position.y = 1.188;
    vialGroup.add(flipCap);

    // Subtle embossed ring on top of flip-off seal
    const embossGeo = new THREE.TorusGeometry(0.28, 0.014, 10, 48);
    const embossMat = new THREE.MeshPhysicalMaterial({
      color: this.accentColor,
      roughness: 0.25,
      clearcoat: 0.9,
    });
    const emboss = new THREE.Mesh(embossGeo, embossMat);
    emboss.rotation.x = Math.PI / 2;
    emboss.position.y = 1.232;
    vialGroup.add(emboss);

    vialGroup.position.set(-0.24, -0.05, 0.04);
    vialGroup.rotation.set(0.08, -0.22, -0.08);
    this.heroPivot.add(vialGroup);
  }

  private buildCapsuleHalf(colorHex: string | number, isCap: boolean): THREE.Mesh {
    const r = 0.36 * (isCap ? 1.04 : 1.0);
    const len = 1.04;
    const start = -0.14;
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(r * 0.93, start + 0.015),
      new THREE.Vector2(r, start),
    ];
    const cylEnd = start + len - r;
    for (let i = 1; i <= 6; i++) {
      pts.push(new THREE.Vector2(r, start + ((cylEnd - start) * i) / 6));
    }
    for (let i = 1; i <= 16; i++) {
      const a = (i / 16) * (Math.PI / 2);
      pts.push(new THREE.Vector2(Math.cos(a) * r, cylEnd + Math.sin(a) * r));
    }
    pts[pts.length - 1].x = 0.0001;

    const geo = new THREE.LatheGeometry(pts, 56);
    if (!isCap) geo.rotateZ(Math.PI);

    const mat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      roughness: isCap ? 0.20 : 0.25,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.35,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geo, mat);
  }

  private buildTwoToneCapsule() {
    const capsule = new THREE.Group();
    capsule.add(this.buildCapsuleHalf(this.opts.accent, true));
    capsule.add(this.buildCapsuleHalf("#FAF8F3", false));

    // Precision metallic locking seam band
    const seamGeo = new THREE.TorusGeometry(0.376, 0.016, 12, 48);
    const seamMat = new THREE.MeshStandardMaterial({
      color: this.deepColor,
      metalness: 0.58,
      roughness: 0.24,
    });
    const seam = new THREE.Mesh(seamGeo, seamMat);
    seam.rotation.x = Math.PI / 2;
    seam.position.y = -0.13;
    capsule.add(seam);

    capsule.position.set(1.06, -0.36, 0.50);
    capsule.rotation.set(0.28, -0.42, -0.74);
    this.heroPivot.add(capsule);
  }

  private buildScoredTablet(radius: number, tintFactor: number, useDeepTint = false): THREE.Group {
    const group = new THREE.Group();
    const thickness = radius * 0.42;
    const edge = radius * 0.16;
    const dome = thickness * 0.11;

    const pts: THREE.Vector2[] = [new THREE.Vector2(0.0001, thickness / 2)];
    for (let i = 1; i <= 6; i++) {
      const x = ((radius - edge) * i) / 6;
      pts.push(new THREE.Vector2(x, thickness / 2 - dome * (x / radius) ** 2));
    }
    for (let i = 1; i <= 12; i++) {
      const a = Math.PI / 2 - (i / 12) * Math.PI;
      pts.push(new THREE.Vector2(radius - edge + Math.cos(a) * edge, Math.sin(a) * (thickness / 2 - dome)));
    }
    for (let i = 5; i >= 0; i--) {
      const x = ((radius - edge) * i) / 6;
      pts.push(new THREE.Vector2(x, -thickness / 2 + dome * (x / radius) ** 2));
    }
    pts[pts.length - 1].x = 0.0001;

    const geo = new THREE.LatheGeometry(pts, 48);
    geo.rotateX(Math.PI / 2);

    const targetColor = useDeepTint ? this.accentColor : this.softColor;
    const base = new THREE.Color("#FAF8F3").lerp(targetColor, tintFactor);
    const mat = new THREE.MeshPhysicalMaterial({
      color: base,
      roughness: useDeepTint ? 0.34 : 0.44,
      sheen: 0.45,
      clearcoat: useDeepTint ? 0.5 : 0.2,
    });
    group.add(new THREE.Mesh(geo, mat));

    const scoreMat = new THREE.MeshStandardMaterial({
      color: base.clone().multiplyScalar(0.76),
      roughness: 0.78,
    });
    for (const zSign of [1, -1]) {
      const score = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.52, radius * 0.065, 0.022), scoreMat);
      score.position.z = zSign * radius * 0.19;
      group.add(score);
    }
    return group;
  }

  private buildClinicalTablets() {
    // Foreground left ivory tablet
    const t1 = this.buildScoredTablet(0.46, 0.18);
    t1.position.set(-1.30, -0.74, 0.56);
    t1.rotation.set(0.50, 0.62, -0.22);
    this.heroPivot.add(t1);

    // Upper right soft-accent tablet
    const t2 = this.buildScoredTablet(0.37, 0.38);
    t2.position.set(1.22, 0.86, -0.24);
    t2.rotation.set(-0.40, -0.56, 0.34);
    this.heroPivot.add(t2);

    // Back left accent ceramic tablet
    const t3 = this.buildScoredTablet(0.32, 0.65, true);
    t3.position.set(-1.26, 0.74, -0.44);
    t3.rotation.set(0.28, 0.85, 0.18);
    this.heroPivot.add(t3);
  }

  private buildOrbitalArchitecture() {
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: this.deepColor.clone().lerp(new THREE.Color(0xcfd6df), 0.58),
      metalness: 0.78,
      roughness: 0.28,
      transparent: true,
      opacity: 0.46,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.04, 0.014, 12, 96), ringMat1);
    this.ringGroup1.add(ring1);

    // 4 cardinal orbital nodes + subtle calibration ticks
    const nodeGeo = new THREE.SphereGeometry(0.044, 14, 12);
    const nodeMat = new THREE.MeshPhysicalMaterial({
      color: this.accentColor,
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const tickGeo = new THREE.BoxGeometry(0.018, 0.075, 0.018);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      if (i % 2 === 0) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(Math.cos(angle) * 2.04, Math.sin(angle) * 2.04, 0);
        this.ringGroup1.add(node);
      } else {
        const tick = new THREE.Mesh(tickGeo, ringMat1);
        tick.position.set(Math.cos(angle) * 2.04, Math.sin(angle) * 2.04, 0);
        tick.rotation.z = angle + Math.PI / 2;
        this.ringGroup1.add(tick);
      }
    }
    this.ringGroup1.rotation.set(1.14, 0.24, -0.26);
    this.heroPivot.add(this.ringGroup1);

    // Secondary outer fine ring
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xd9dee6,
      metalness: 0.75,
      roughness: 0.30,
      transparent: true,
      opacity: 0.32,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.30, 0.009, 10, 96), ringMat2);
    this.ringGroup2.add(ring2);

    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.18,
      clearcoat: 1.0,
    });
    for (const angle of [Math.PI * 0.25, Math.PI * 1.25]) {
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), pearlMat);
      pearl.position.set(Math.cos(angle) * 2.30, Math.sin(angle) * 2.30, 0);
      this.ringGroup2.add(pearl);
    }
    this.ringGroup2.rotation.set(1.42, -0.20, 0.20);
    this.heroPivot.add(this.ringGroup2);
  }

  private buildMolecularNodes() {
    const count = 52;
    const geo = new THREE.SphereGeometry(1, 12, 10);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.12,
      clearcoat: 0.85,
      transparent: true,
      opacity: 0.78,
    });

    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const palette = [
      this.accentColor,
      this.softColor.clone().lerp(this.accentColor, 0.35),
      new THREE.Color(0xffffff),
    ];

    // Deterministic Fibonacci-like halo avoiding the front vial label zone
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const baseAngle = i * goldenAngle;
      const y = (t * 2 - 1) * 1.65;
      const radialFactor = Math.sqrt(Math.max(0.18, 1 - (y / 2.1) ** 2));
      const radius = (1.72 + ((i * 37) % 100) / 110) * radialFactor + 0.55;
      const scale = 0.022 + ((i * 19) % 10) * 0.0032;

      this.particleSpecs.push({
        baseAngle,
        radius,
        y,
        speed: 0.14 + (i % 5) * 0.025,
        phase: i * 0.47,
        scale,
        tilt: (i % 7) * 0.06 - 0.18,
      });

      mesh.setColorAt(i, palette[i % palette.length]);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    this.particlesMesh = mesh;
    this.updateParticles(0);
    this.heroPivot.add(mesh);
  }

  private updateParticles(time: number) {
    if (!this.particlesMesh) return;
    for (let i = 0; i < this.particleSpecs.length; i++) {
      const p = this.particleSpecs[i];
      const angle = p.baseAngle + time * p.speed;
      let x = Math.cos(angle) * p.radius;
      let z = Math.sin(angle) * p.radius;
      const y = p.y + Math.sin(time * 0.75 + p.phase) * 0.08 + p.tilt * 0.4;

      // Push particles passing directly in front of the vial label gently behind
      if (z > 0.25 && Math.abs(x) < 1.05 && Math.abs(y) < 1.15) {
        z = -Math.abs(z) - 0.35;
        x *= 1.12;
      }

      this.particleDummy.position.set(x, y, z);
      this.particleDummy.scale.setScalar(p.scale);
      this.particleDummy.updateMatrix();
      this.particlesMesh.setMatrixAt(i, this.particleDummy.matrix);
    }
    this.particlesMesh.instanceMatrix.needsUpdate = true;
  }

  private onPointerDown = (e: PointerEvent) => {
    this.drag = { active: true, x: e.clientX, y: e.clientY, id: e.pointerId };
    // Avoid capturing touch pointers so native touch-pan-y vertical scrolling never locks
    if (e.pointerType !== "touch") {
      this.canvas.setPointerCapture?.(e.pointerId);
    }
  };

  private onCanvasHover = (e: PointerEvent) => {
    if (this.drag.active || this.opts.reducedMotion || e.pointerType !== "mouse") return;
    const w = this.viewWidth || 1;
    const h = this.viewHeight || 1;
    const nx = (e.offsetX / w) * 2 - 1;
    const ny = (e.offsetY / h) * 2 - 1;
    this.hoverTarget.set(
      THREE.MathUtils.clamp(nx, -1, 1) * 0.14,
      THREE.MathUtils.clamp(ny, -1, 1) * 0.08
    );
  };

  private onCanvasLeave = () => {
    this.hoverTarget.set(0, 0);
  };

  private onWindowPointerMove = (e: PointerEvent) => {
    if (!this.drag.active || e.pointerId !== this.drag.id) return;
    const dx = (e.clientX - this.drag.x) / 135;
    const dy = (e.clientY - this.drag.y) / 175;
    this.drag.x = e.clientX;
    this.drag.y = e.clientY;
    this.rot.x += dx;
    this.rot.y = THREE.MathUtils.clamp(this.rot.y + dy, -0.75, 0.75);
    if (!this.opts.reducedMotion) {
      this.vel.set(dx, dy);
    }
    if (!this.running) this.renderFrame(0);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId === this.drag.id) {
      this.drag.active = false;
    }
  };

  resize() {
    if (this.disposed) return;
    const w = this.canvas.clientWidth || 300;
    const h = this.canvas.clientHeight || 220;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const maxDpr = isMobile ? 1.5 : 1.75;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, maxDpr);

    if (dpr !== this.appliedDpr) {
      this.renderer.setPixelRatio(dpr);
      this.appliedDpr = dpr;
    }
    if (w !== this.viewWidth || h !== this.viewHeight) {
      this.viewWidth = w;
      this.viewHeight = h;
      this.renderer.setSize(w, h, false);
    }

    this.camera.aspect = w / h;
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const fitH = this.fitRadius / Math.tan(halfFov);
    const fitW = this.fitRadius / (Math.tan(halfFov) * this.camera.aspect);
    this.camera.position.set(0, 0.04, Math.max(fitH, fitW) * 1.1);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    if (!this.running) this.renderFrame(0);
  }

  setReducedMotion(reduced: boolean) {
    if (this.disposed || this.opts.reducedMotion === reduced) return;
    this.opts.reducedMotion = reduced;
    if (reduced) {
      this.stop();
      this.elapsed = 0;
      this.rot.set(0, 0);
      this.vel.set(0, 0);
      this.hoverTarget.set(0, 0);
      this.hoverCurrent.set(0, 0);
      this.ringGroup1.rotation.set(1.14, 0.24, -0.26);
      this.ringGroup2.rotation.set(1.42, -0.20, 0.20);
      this.updateParticles(0);
      this.renderFrame(0);
    } else {
      this.lastFrameMs = performance.now();
    }
  }

  start() {
    if (this.disposed || this.running || this.opts.reducedMotion) return;
    this.running = true;
    this.lastFrameMs = performance.now();
    const tick = (now: number) => {
      if (!this.running || this.disposed) return;
      const dt = Math.min(Math.max((now - this.lastFrameMs) / 1000, 0), 0.05);
      this.lastFrameMs = now;
      this.elapsed += dt;
      this.renderFrame(dt);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  renderNow() {
    if (!this.disposed) this.renderFrame(0);
  }

  private renderFrame(dt: number) {
    if (this.disposed) return;
    const rm = this.opts.reducedMotion;

    if (!rm && !this.drag.active && dt > 0) {
      this.rot.x += this.vel.x;
      this.rot.y += this.vel.y;
      this.vel.multiplyScalar(0.91);
      this.rot.x = THREE.MathUtils.lerp(this.rot.x, 0, 1 - Math.exp(-dt * 1.1));
      this.rot.y = THREE.MathUtils.lerp(this.rot.y, 0, 1 - Math.exp(-dt * 1.6));
    }

    const hoverSmoothing = dt > 0 ? 1 - Math.exp(-dt * 5.0) : 1;
    if (rm) {
      this.hoverCurrent.set(0, 0);
    } else {
      this.hoverCurrent.lerp(this.hoverTarget, hoverSmoothing);
    }

    const t = rm ? 0 : this.elapsed;
    const swayY = rm ? 0 : Math.sin(t * 0.48) * 0.16;
    const swayX = rm ? 0 : Math.cos(t * 0.36) * 0.035;

    this.heroPivot.rotation.set(
      this.rot.y + this.hoverCurrent.y + swayX,
      this.rot.x + this.hoverCurrent.x + swayY,
      0
    );
    this.heroPivot.position.y = rm ? 0 : Math.sin(t * 0.85) * 0.04;

    if (!rm) {
      this.ringGroup1.rotation.z = -0.26 + t * 0.11;
      this.ringGroup2.rotation.z = 0.20 - t * 0.08;
      this.updateParticles(t);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();

    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onCanvasHover);
    this.canvas.removeEventListener("pointerleave", this.onCanvasLeave);
    window.removeEventListener("pointermove", this.onWindowPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);

    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const m of mats) {
        for (const val of Object.values(m)) {
          if (val instanceof THREE.Texture) val.dispose();
        }
        m.dispose();
      }
    });

    for (const tex of this.trackedTextures) tex.dispose();
    this.trackedTextures = [];

    this.envTexture.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
