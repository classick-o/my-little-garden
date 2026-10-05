"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { seededRandom } from "./random";

/**
 * Pasarile.
 *
 * Doua feluri, din doua motive diferite: cele cocotate aduc viata aproape de
 * utilizator, cele din departare umplu cerul fara sa coste nimic.
 */

/**
 * Pasare cocotata.
 *
 * Nu sta nemiscata: se leagana usor si, din cand in cand, sare pe loc. Fara
 * asta pare o statueta, nu o vietate.
 */
export function PerchedBird({
  position,
  rotation = 0,
  height = 0.3,
  /** Decalaj ca pasarile sa nu sara toate odata. */
  offset = 0,
}: {
  position: [number, number, number];
  rotation?: number;
  height?: number;
  offset?: number;
}) {
  const { scene } = useGLTF("/garden3d/bird.glb");
  const group = useRef<THREE.Group>(null);

  const { model, scale, offsetY } = useMemo(() => {
    const model = scene.clone(true);

    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bounds.getSize(size);

    const scale = height / Math.max(size.y, 0.0001);

    return { model, scale, offsetY: -bounds.min.y * scale };
  }, [scene, height]);

  useFrame((state) => {
    const bird = group.current;
    if (!bird) return;

    const time = state.clock.elapsedTime + offset;

    /* Respiratia: o miscare mica, continua. */
    const breathe = Math.sin(time * 2.2) * 0.008;

    /* Saritura: o singura data la fiecare ciclu, scurta si inalta. */
    const cycle = time % 7;
    const hop = cycle < 0.45 ? Math.sin((cycle / 0.45) * Math.PI) * 0.09 : 0;

    bird.position.y = breathe + hop;

    /* Cand sare, se si intoarce putin - ca si cum s-ar uita in alta parte. */
    bird.rotation.y = hop > 0 ? hop * 3 : bird.rotation.y * 0.94;
  });

  return (
    <group position={position} rotation-y={rotation}>
      <group ref={group}>
        <group scale={scale} position-y={offsetY}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}

/** Cate pasari zboara in departare. */
const FLOCK_SIZE = 7;

/**
 * Pasari din departare.
 *
 * Doua linii in forma de V, atat. De la distanta nimeni nu vede mai mult, iar
 * un model adevarat ar fi fost risipa pentru cateva zeci de pixeli.
 */
export function DistantBirds() {
  const group = useRef<THREE.Group>(null);

  const { geometry, seeds } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    /* V-ul: doua segmente care pornesc din acelasi varf. */
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-0.5, 0.22, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.22, 0],
        3,
      ),
    );

    const random = seededRandom(2024);
    const seeds = Array.from({ length: FLOCK_SIZE }, () => ({
      radius: 13 + random() * 9,
      heightY: 4 + random() * 5,
      speed: 0.045 + random() * 0.05,
      phase: random() * Math.PI * 2,
      scale: 0.5 + random() * 0.6,
      flap: 2 + random() * 2,
    }));

    return { geometry, seeds };
  }, []);

  useFrame((state) => {
    const flock = group.current;
    if (!flock) return;

    const time = state.clock.elapsedTime;

    flock.children.forEach((bird, index) => {
      const seed = seeds[index];
      const angle = seed.phase + time * seed.speed;

      bird.position.set(
        Math.cos(angle) * seed.radius,
        seed.heightY + Math.sin(time * 0.4 + seed.phase) * 0.5,
        Math.sin(angle) * seed.radius,
      );

      /* Se intoarce in directia de zbor. */
      bird.rotation.y = -angle + Math.PI / 2;

      /* Bataia din aripi: inchidem si deschidem V-ul pe verticala. */
      bird.scale.y = seed.scale * (0.6 + Math.abs(Math.sin(time * seed.flap)) * 0.8);
    });
  });

  return (
    <group ref={group}>
      {seeds.map((seed, index) => (
        <lineSegments key={index} geometry={geometry} scale={seed.scale}>
          <lineBasicMaterial color="#5a6b78" transparent opacity={0.65} />
        </lineSegments>
      ))}
    </group>
  );
}
