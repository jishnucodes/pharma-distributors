"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface AntigravityFlowCanvasProps {
  variant?: "lakshmi" | "kothittil" | "home";
  companySlug?: string;
  density?: "compact" | "normal" | "cinematic";
  interactive?: boolean;
  className?: string;
  opacity?: number;
}

/**
 * Creates a soft glowing radial particle texture programmatically
 * to eliminate external asset dependencies and ensure instant 60fps rendering.
 */
function createParticleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.85)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.35)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function AntigravityFlowCanvas({
  variant = "home",
  companySlug,
  density = "normal",
  interactive = true,
  className = "",
  opacity = 0.85,
}: AntigravityFlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Normalize active theme variant
  const isLakshmi = variant === "lakshmi" || companySlug === "lakshmi-pharma";
  const isKothittil = variant === "kothittil" || companySlug === "kothittil-pharma";

  useEffect(() => {
    // 1. Guard against SSR and environments without WebGL
    if (typeof window === "undefined" || !canvasRef.current) return;

    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setIsSupported(false);
        return;
      }
    } catch {
      setIsSupported(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 2. Setup Three.js Scene, Camera, and WebGL Renderer
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 60);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Color Palettes for Antigravity Molecular Flow
    const primaryColor = isLakshmi
      ? new THREE.Color(0x0d9488) // Deep Medical Teal
      : isKothittil
      ? new THREE.Color(0x0284c7) // Cryo Azure
      : new THREE.Color(0x0f766e); // Balanced Pharma Teal

    const secondaryColor = isLakshmi
      ? new THREE.Color(0x10b981) // Emerald Biological
      : isKothittil
      ? new THREE.Color(0x06b6d4) // Cyan Cold-Chain
      : new THREE.Color(0x2563eb); // Indigo Clinical

    const accentColor = isLakshmi
      ? new THREE.Color(0x34d399) // Mint Green
      : isKothittil
      ? new THREE.Color(0x38bdf8) // Ice Blue
      : new THREE.Color(0x06b6d4); // Cyan

    // 4. Create Antigravity Particle Stream
    const particleCount =
      density === "compact"
        ? 100
        : density === "cinematic"
        ? 220
        : window.innerWidth < 768
        ? 75
        : 140;

    const particleTexture = createParticleTexture();
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    const originalPositions: { x: number; y: number; z: number; speed: number; phase: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in a flowing 3D ribbon volume
      const spreadX = (Math.random() - 0.5) * 110;
      const spreadY = (Math.random() - 0.5) * 65;
      const spreadZ = (Math.random() - 0.5) * 45;

      particlePositions[i * 3] = spreadX;
      particlePositions[i * 3 + 1] = spreadY;
      particlePositions[i * 3 + 2] = spreadZ;

      originalPositions.push({
        x: spreadX,
        y: spreadY,
        z: spreadZ,
        speed: 0.25 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      });

      // Subtle biological color variation
      const mixRatio = Math.random();
      const color = new THREE.Color();
      if (mixRatio < 0.6) {
        color.lerpColors(primaryColor, secondaryColor, Math.random());
      } else {
        color.lerpColors(secondaryColor, accentColor, Math.random());
      }

      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;

      particleScales[i] = 1.2 + Math.random() * 2.2;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 4.2,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Dynamic 3D Molecular Constellation Line Segments (Dynamic Synapses)
    const maxBonds = particleCount * 3;
    const linePositions = new Float32Array(maxBonds * 6);
    const lineColors = new Float32Array(maxBonds * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // 6. Floating 3D Bio-Icosahedron (Antigravity Centerpieces)
    const icosaGroup = new THREE.Group();

    // Primary Floating Molecular Core (Wireframe + Translucent Glass)
    const icoGeo = new THREE.IcosahedronGeometry(8.5, 1);
    const icoWireMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const icoWireMesh = new THREE.Mesh(icoGeo, icoWireMat);
    icosaGroup.add(icoWireMesh);

    // Inner Luminous Nucleus
    const nucleusGeo = new THREE.IcosahedronGeometry(4.2, 0);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    icosaGroup.add(nucleusMesh);

    // Secondary Outer Ring Orbiting the Icosahedron
    const ringGeo = new THREE.TorusGeometry(13.5, 0.15, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    icosaGroup.add(ringMesh);

    // Positioned in top-right ambient field
    icosaGroup.position.set(34, 10, -12);
    scene.add(icosaGroup);

    // Secondary Floating Mini Molecular Node (Left Depth Layer)
    const miniNodeGroup = new THREE.Group();
    const miniGeo = new THREE.OctahedronGeometry(5, 0);
    const miniMat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const miniMesh = new THREE.Mesh(miniGeo, miniMat);
    miniNodeGroup.add(miniMesh);

    const miniRingGeo = new THREE.TorusGeometry(8, 0.12, 16, 48);
    const miniRingMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.3,
    });
    const miniRing = new THREE.Mesh(miniRingGeo, miniRingMat);
    miniRing.rotation.y = Math.PI / 4;
    miniNodeGroup.add(miniRing);

    miniNodeGroup.position.set(-34, -6, -14);
    scene.add(miniNodeGroup);

    // 7. Interactive Mouse & Scroll State (with Smooth Damping)
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollY = 0;
    let targetScrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      // Normalized between -1 and 1
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || document.documentElement.scrollTop;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 8. Performance Guard: Intersection Observer to pause rendering when out of viewport
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 9. Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // 10. Main WebGL Animation Loop (60+ FPS Organic Antigravity Flow)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    const bondDistanceThreshold = 15; // Max distance for molecular synapses

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip render if offscreen or tab hidden to conserve GPU/battery
      if (!isVisible || document.hidden) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation (spring lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.06;

      // Dynamic Camera Parallax based on Mouse and Scroll
      camera.position.x = mouse.x * 6;
      camera.position.y = mouse.y * 4 - scrollY * 0.012;
      camera.lookAt(0, -scrollY * 0.01, 0);

      // Animate 3D Icosahedron Core (Antigravity Floating & Gyroscopic Rotation)
      icosaGroup.rotation.x = elapsedTime * 0.22 + mouse.y * 0.3;
      icosaGroup.rotation.y = elapsedTime * 0.35 + mouse.x * 0.4;
      icosaGroup.position.y = -4 + Math.sin(elapsedTime * 0.8) * 2.5 - scrollY * 0.01;
      ringMesh.rotation.z = elapsedTime * 0.4;

      // Animate Mini Node
      miniNodeGroup.rotation.x = -elapsedTime * 0.3;
      miniNodeGroup.rotation.y = elapsedTime * 0.25;
      miniNodeGroup.position.y = 14 + Math.cos(elapsedTime * 0.9) * 2 - scrollY * 0.015;

      // Animate Particles with Antigravity Wave Physics
      const positionsAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = positionsAttr.array as Float32Array;

      let lineIndex = 0;
      const linePosArray = lineGeometry.attributes.position.array as Float32Array;
      const lineColArray = lineGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const orig = originalPositions[i];

        // 3D Sine-Cosine harmonic wave (fluid levitation flow)
        const waveX = Math.sin(elapsedTime * orig.speed + orig.phase) * 1.8;
        const waveY = Math.cos(elapsedTime * orig.speed * 0.8 + orig.phase) * 2.4;
        const waveZ = Math.sin(elapsedTime * 0.5 + orig.x * 0.05) * 2.2;

        const currentX = orig.x + waveX + mouse.x * 3.5;
        const currentY = orig.y + waveY + mouse.y * 2.5 - scrollY * 0.01;
        const currentZ = orig.z + waveZ;

        posArray[i * 3] = currentX;
        posArray[i * 3 + 1] = currentY;
        posArray[i * 3 + 2] = currentZ;

        // Dynamic Molecular Constellation Lines to nearby nodes
        if (lineIndex < maxBonds * 6) {
          for (let j = i + 1; j < Math.min(i + 8, particleCount); j++) {
            const dx = posArray[i * 3] - posArray[j * 3];
            const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
            const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < bondDistanceThreshold && lineIndex < maxBonds * 6) {
              // Line Start (Node i)
              linePosArray[lineIndex] = currentX;
              linePosArray[lineIndex + 1] = currentY;
              linePosArray[lineIndex + 2] = currentZ;

              // Line End (Node j)
              linePosArray[lineIndex + 3] = posArray[j * 3];
              linePosArray[lineIndex + 4] = posArray[j * 3 + 1];
              linePosArray[lineIndex + 5] = posArray[j * 3 + 2];

              // Opacity & Alpha fade by distance
              const alpha = Math.max(0, 1 - dist / bondDistanceThreshold) * 0.32;
              lineColArray[lineIndex] = primaryColor.r * alpha;
              lineColArray[lineIndex + 1] = primaryColor.g * alpha;
              lineColArray[lineIndex + 2] = primaryColor.b * alpha;

              lineColArray[lineIndex + 3] = secondaryColor.r * alpha;
              lineColArray[lineIndex + 4] = secondaryColor.g * alpha;
              lineColArray[lineIndex + 5] = secondaryColor.b * alpha;

              lineIndex += 6;
            }
          }
        }
      }

      // Reset remaining line buffer vertices
      for (let k = lineIndex; k < maxBonds * 6; k++) {
        linePosArray[k] = 0;
        lineColArray[k] = 0;
      }

      positionsAttr.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Render Final Scene
      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup on Unmount (Zero Memory Leaks)
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();

      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      // Dispose Geometries and Materials
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      icoGeo.dispose();
      icoWireMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      miniGeo.dispose();
      miniMat.dispose();

      renderer.dispose();
    };
  }, [variant, isLakshmi, isKothittil, density, interactive]);

  if (!isSupported) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ opacity }}
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden transition-opacity duration-1000 ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
