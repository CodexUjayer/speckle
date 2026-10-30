"use client";

/**
 * The SAR pass — the innovation chapter's 3D scene.
 *
 * A satellite crosses a low-poly, faulted terrain under a champagne radar
 * beam, lighting measurement beacons as the swath passes over them. The
 * whole scene derives from a single scroll-scrubbed progress value written
 * by GSAP: if the visitor stops scrolling, the world holds its breath —
 * the same rule as the Earth stage. Rendering is gated to the viewport and
 * pauses with the document.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { storyState } from "../scroll";

const BG = "#0c0b07";
const ACCENT = "#d9c08a";
const FAULT_ANGLE = 0.42;
/** where the sweep begins and ends in world x */
const SWEEP_X0 = -8.2;
const SWEEP_LEN = 16.4;

export interface SweepProgress {
  p: number;
}

/* ------------------------------------------------------------------ */
/* deterministic terrain — value-noise fBm + a fault ridge              */
/* ------------------------------------------------------------------ */

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function vnoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number): number {
  let f = 0;
  let amp = 0.5;
  let fx = x;
  let fy = y;
  for (let i = 0; i < 4; i++) {
    f += amp * vnoise(fx, fy);
    fx *= 2.03;
    fy *= 1.97;
    amp *= 0.5;
  }
  return f;
}

/** terrain height — rolling country cut by a fault scarp */
function heightAt(x: number, z: number): number {
  let h = (fbm(x * 0.22 + 3.1, z * 0.22 + 1.7) - 0.5) * 1.15;
  h += (fbm(x * 0.55 + 9.2, z * 0.55 + 4.4) - 0.5) * 0.3;
  const d = x * Math.sin(FAULT_ANGLE) - z * Math.cos(FAULT_ANGLE);
  const ridge = Math.exp(-(d * d) / (2 * 0.18 * 0.18));
  h += ridge * (0.5 + 0.3 * fbm(x * 0.9 + 1.3, z * 0.9 + 7.7));
  h += Math.sign(d) * ridge * 0.22;
  return h;
}

/* ------------------------------------------------------------------ */
/* the terrain mesh                                                     */
/* ------------------------------------------------------------------ */

const C_LOW = new THREE.Color("#12181d");
const C_MID = new THREE.Color("#232d35");
const C_HIGH = new THREE.Color("#3a454e");
const C_WARM = new THREE.Color("#6e5636");

function Terrain({ low }: { low: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(18, 11, low ? 76 : 128, low ? 48 : 82);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      // height grade, warmed along the fault
      const t = THREE.MathUtils.clamp((h + 0.55) / 1.35, 0, 1);
      if (t < 0.5) c.copy(C_LOW).lerp(C_MID, t * 2);
      else c.copy(C_MID).lerp(C_HIGH, (t - 0.5) * 2);
      const d = x * Math.sin(FAULT_ANGLE) - z * Math.cos(FAULT_ANGLE);
      const warm = Math.exp(-(d * d) / (2 * 0.4 * 0.4)) * 0.5;
      c.lerp(C_WARM, warm * (0.35 + t * 0.5));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [low]);

  useEffect(() => {
    return () => geo.dispose();
  }, [geo]);

  return (
    <mesh geometry={geo} position={[0, 0, 0]}>
      <meshStandardMaterial
        vertexColors
        flatShading
        roughness={0.94}
        metalness={0.06}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* the swath — the ground the pass has already covered                  */
/* ------------------------------------------------------------------ */

function useSwathTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 1;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(217,192,138,0)");
    g.addColorStop(0.82, "rgba(217,192,138,0.22)");
    g.addColorStop(0.96, "rgba(240,220,170,0.42)");
    g.addColorStop(1, "rgba(255,236,200,0.66)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 1);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* ------------------------------------------------------------------ */
/* the director — every frame derives the scene from progress           */
/* ------------------------------------------------------------------ */

/** beacon sites along the fault (x positions; z follows the fault line) */
const BEACON_XS = [-3.6, 0.5, 3.7];
const BEACONS = BEACON_XS.map((x) => ({
  x,
  z: x * Math.tan(FAULT_ANGLE),
  y: heightAt(x, x * Math.tan(FAULT_ANGLE)) + 0.05,
  /** the sweep progress at which the beam first reaches this site */
  t: (x - SWEEP_X0) / SWEEP_LEN,
}));

function Director({
  progress,
  low,
}: {
  progress: { current: SweepProgress };
  low: boolean;
}) {
  const sat = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Group>(null);
  const beamOuter = useRef<THREE.Mesh>(null);
  const beamCore = useRef<THREE.Mesh>(null);
  const swath = useRef<THREE.Mesh>(null);
  const beaconRefs = useRef<Array<THREE.Group | null>>([]);
  const light = useRef<THREE.PointLight>(null);

  const swathGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SWEEP_LEN, 2.7);
    /* anchor the strip at its left edge so it grows behind the sweep */
    g.translate(SWEEP_LEN / 2, 0, 0);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useEffect(() => {
    return () => swathGeo.dispose();
  }, [swathGeo]);

  const swathTex = useSwathTexture();

  /* beam cones — unit height, apex at the group origin, reaching down */
  const beamGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(1, 1, 24, 1, true);
    g.translate(0, -0.5, 0);
    return g;
  }, []);
  const beamCoreGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.34, 1, 18, 1, true);
    g.translate(0, -0.5, 0);
    return g;
  }, []);
  useEffect(() => {
    return () => {
      beamGeo.dispose();
      beamCoreGeo.dispose();
    };
  }, [beamGeo, beamCoreGeo]);

  const ringGeo = useMemo(() => new THREE.RingGeometry(0.24, 0.28, 40), []);
  useEffect(() => {
    return () => ringGeo.dispose();
  }, [ringGeo]);

  const eased = useRef(0);

  useFrame((state, dt) => {
    const target = progress.current.p;
    eased.current += (target - eased.current) * Math.min(1, dt * 6);
    const p = eased.current;

    /* the satellite crosses the frame with a whisper of an arc */
    if (sat.current) {
      const x = SWEEP_X0 + p * SWEEP_LEN;
      const y = 3.6 + Math.sin(p * Math.PI) * 0.22;
      sat.current.position.set(x, y, 0.45);
      sat.current.rotation.z = -0.09;
      if (beam.current) beam.current.scale.y = y + 0.35;
    }
    /* the beam breathes, ever so slightly, as it sweeps */
    if (beamOuter.current)
      (beamOuter.current.material as THREE.MeshBasicMaterial).opacity =
        0.085 + 0.02 * Math.sin(p * 74);
    if (beamCore.current)
      (beamCore.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + 0.035 * Math.sin(p * 74 + 1.2);

    /* the swath grows behind the pass */
    if (swath.current) {
      swath.current.scale.x = Math.max(p, 0.001);
      swath.current.position.x = SWEEP_X0;
    }

    /* the measurement beacons light as the beam crosses them */
    BEACONS.forEach((b, i) => {
      const g = beaconRefs.current[i];
      if (!g) return;
      const k = (p - b.t) / 0.1;
      const lit = k > 0;
      const dot = g.children[0] as THREE.Mesh;
      if (dot) {
        const m = dot.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = lit ? 2.1 : 0.22;
      }
      const ring = g.children[1] as THREE.Mesh;
      if (ring) {
        const kk = Math.min(Math.max(k, 0), 1);
        const s = 0.25 + kk * 2.6;
        ring.scale.set(s, s, s);
        (ring.material as THREE.MeshBasicMaterial).opacity =
          k <= 0 || k >= 1 ? 0 : (1 - kk) * 0.6;
      }
    });

    /* light pools under the beam */
    if (light.current && sat.current) {
      light.current.position.set(sat.current.position.x, 1.4, 0.45);
      light.current.intensity = 3.2 + 0.7 * Math.sin(p * 74);
    }

    /* the camera — a quiet low angle with pointer parallax. Narrow
       screens step back just enough to keep the composition, staying
       close enough for the terrain to keep its depth */
    const s = storyState;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const aspectFix = aspect < 1 ? 1.15 + aspect * 0.25 : 1;
    const mx = s.reduced ? 0 : s.mx;
    const my = s.reduced ? 0 : s.my;
    state.camera.position.set(
      0.5 + mx * 0.14,
      2.8 - my * 0.07,
      9.0 * aspectFix,
    );
    state.camera.lookAt(0, 0.32, 0);
  });

  return (
    <>
      <hemisphereLight args={["#39424c", "#0c0b07", 0.85]} />
      <directionalLight
        position={[-5, 7, 3.5]}
        intensity={2.1}
        color="#ffe6c0"
      />
      <pointLight
        ref={light}
        color={ACCENT}
        intensity={3.4}
        distance={7}
        decay={2}
      />

      <Terrain low={low} />

      {/* the swath — ground already scanned */}
      <mesh
        ref={swath}
        geometry={swathGeo}
        position={[SWEEP_X0, 0.04, 0.45]}
        renderOrder={2}
      >
        <meshBasicMaterial
          map={swathTex}
          transparent
          opacity={0.6}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* the beacons along the fault */}
      {BEACONS.map((b, i) => (
        <group
          key={i}
          ref={(el) => {
            beaconRefs.current[i] = el;
          }}
          position={[b.x, b.y, b.z]}
        >
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial
              color="#2a2620"
              emissive={ACCENT}
              emissiveIntensity={0.22}
              roughness={0.5}
            />
          </mesh>
          <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <meshBasicMaterial
              color={ACCENT}
              transparent
              opacity={0}
              side={THREE.DoubleSide}
              depthWrite={false}
              fog={false}
            />
          </mesh>
        </group>
      ))}

      {/* the satellite with its beam */}
      <group ref={sat} position={[SWEEP_X0, 3.6, 0.45]}>
        <mesh>
          <boxGeometry args={[0.46, 0.28, 0.3]} />
          <meshStandardMaterial color="#cfd3d8" metalness={0.85} roughness={0.32} />
        </mesh>
        <mesh position={[0.95, 0, 0]}>
          <boxGeometry args={[1.35, 0.02, 0.44]} />
          <meshStandardMaterial color="#141a24" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[-0.95, 0, 0]}>
          <boxGeometry args={[1.35, 0.02, 0.44]} />
          <meshStandardMaterial color="#141a24" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.24, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.17, 0.05, 0.1, 20]} />
          <meshStandardMaterial color="#a8adb4" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshBasicMaterial color={ACCENT} fog={false} />
        </mesh>

        <group ref={beam}>
          <mesh ref={beamOuter} geometry={beamGeo}>
            <meshBasicMaterial
              color={ACCENT}
              transparent
              opacity={0.09}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog={false}
            />
          </mesh>
          <mesh ref={beamCore} geometry={beamCoreGeo}>
            <meshBasicMaterial
              color={ACCENT}
              transparent
              opacity={0.16}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog={false}
            />
          </mesh>
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* the exported canvas                                                  */
/* ------------------------------------------------------------------ */

export default function SarSweep({
  progress,
  active,
}: {
  progress: { current: SweepProgress };
  active: boolean;
}) {
  const low = useMemo(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4),
    [],
  );
  const maxDpr = useMemo(
    () =>
      Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        low ? 1.25 : 1.5,
      ),
    [low],
  );

  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const camera = useMemo(
    () =>
      ({
        fov: 40,
        near: 0.1,
        far: 80,
        position: [0.5, 2.8, 9.0] as [number, number, number],
      }) as const,
    [],
  );

  return (
    <Canvas
      flat
      dpr={[1, maxDpr]}
      camera={camera}
      gl={{
        antialias: true,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
      frameloop={active && !hidden ? "always" : "never"}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 10.5, 26]} />
      <Director progress={progress} low={low} />
    </Canvas>
  );
}
