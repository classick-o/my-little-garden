"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { ISLAND_HALF } from "./Island";
import { seededRandom } from "./random";

/**
 * Petale purtate de vant.
 *
 * Cad incet, se rotesc in cadere si, cand ajung sub insula, reapar sus. Spre
 * deosebire de polen, care doar pluteste, petalele au directie - aduc aceeasi
 * adiere care misca si frunzele.
 */

const PETAL_COUNT = 34;

type Petal = {
  spin: number;
  drift: number;
  fall: number;
  phase: number;
};

export function Petals() {
  const group = useRef<THREE.Group>(null);

  const { geometry, petals, positions } = useMemo(() => {
    /* Un plan mic, indoit printr-o scalare neuniforma: de departe citeste a
       petala, nu a patrat. */
    const geometry = new THREE.PlaneGeometry(0.1, 0.062);

    const random = seededRandom(5150);

    const petals: Petal[] = [];
    const positions: THREE.Vector3[] = [];

    for (let i = 0; i < PETAL_COUNT; i++) {
      positions.push(
        new THREE.Vector3(
          (random() - 0.5) * (ISLAND_HALF * 2.4),
          random() * 5,
          (random() - 0.5) * (ISLAND_HALF * 2.4),
        ),
      );

      petals.push({
        spin: 0.6 + random() * 1.6,
        drift: 0.1 + random() * 0.22,
        fall: 0.22 + random() * 0.3,
        phase: random() * Math.PI * 2,
      });
    }

    return { geometry, petals, positions };
  }, []);

  useFrame((state, delta) => {
    const flock = group.current;
    if (!flock) return;

    const time = state.clock.elapsedTime;

    flock.children.forEach((petal, index) => {
      const seed = petals[index];

      petal.position.y -= seed.fall * delta;

      /* Legananarea laterala: petala nu cade drept, ci in zigzag. */
      petal.position.x += Math.sin(time * 1.3 + seed.phase) * seed.drift * delta;
      petal.position.z += Math.cos(time * 0.9 + seed.phase) * seed.drift * delta;

      petal.rotation.x += seed.spin * delta;
      petal.rotation.z += seed.spin * 0.7 * delta;

      /* Cand a trecut de insula, reapare sus. */
      if (petal.position.y < -2.5) {
        petal.position.y = 5.5;
        petal.position.x = (Math.random() - 0.5) * (ISLAND_HALF * 2.4);
        petal.position.z = (Math.random() - 0.5) * (ISLAND_HALF * 2.4);
      }
    });
  });

  return (
    <group ref={group}>
      {positions.map((position, index) => (
        <mesh key={index} geometry={geometry} position={position}>
          <meshStandardMaterial
            color={index % 3 === 0 ? "#ffd9e4" : "#fff1f5"}
            roughness={1}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
