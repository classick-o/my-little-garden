"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { seededRandom } from "./random";

/**
 * Fluturi.
 *
 * Cel mai ieftin fel de a face o scena sa para vie: ceva mic care se misca
 * neregulat, la inaltimea privirii. Fiecare are doua aripi care bat si o
 * traiectorie proprie, deci nu se vad niciodata doi la fel.
 */

const BUTTERFLY_COUNT = 8;

type Flight = {
  centre: THREE.Vector3;
  radius: number;
  speed: number;
  phase: number;
  height: number;
  wing: number;
  color: string;
};

export function Butterflies() {
  const group = useRef<THREE.Group>(null);

  const { wing, flights } = useMemo(() => {
    /* O aripa: un triunghi mic. Doua, oglindite, fac fluturele. */
    const wing = new THREE.BufferGeometry();
    wing.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0, 0.17, 0.03, -0.09, 0.14, 0, 0.11], 3),
    );
    wing.computeVertexNormals();

    const random = seededRandom(818);
    const palette = ["#ffd8e8", "#fff0b8", "#d8ecff", "#ffe0c2"];

    const flights: Flight[] = Array.from({ length: BUTTERFLY_COUNT }, () => ({
      centre: new THREE.Vector3(
        (random() - 0.5) * 5.2,
        0.5 + random() * 0.9,
        (random() - 0.5) * 5.2,
      ),
      radius: 0.5 + random() * 1.1,
      speed: 0.35 + random() * 0.5,
      phase: random() * Math.PI * 2,
      height: 0.12 + random() * 0.22,
      wing: 9 + random() * 6,
      color: palette[Math.floor(random() * palette.length)],
    }));

    return { wing, flights };
  }, []);

  useFrame((state) => {
    const swarm = group.current;
    if (!swarm) return;

    const time = state.clock.elapsedTime;

    swarm.children.forEach((butterfly, index) => {
      const flight = flights[index];
      const angle = flight.phase + time * flight.speed;

      /* Doua cercuri de raze diferite dau o traiectorie care nu se repeta
         vizibil - un singur cerc ar arata ca un obiect pe sina. */
      butterfly.position.set(
        flight.centre.x + Math.cos(angle) * flight.radius,
        flight.centre.y + Math.sin(time * 1.7 + flight.phase) * flight.height,
        flight.centre.z + Math.sin(angle * 0.7) * flight.radius,
      );

      /* Se intoarce in directia de zbor. */
      butterfly.rotation.y = -angle + Math.PI / 2;

      /* Bataia aripilor: le inchidem si deschidem pe orizontala. */
      const flap = Math.abs(Math.sin(time * flight.wing));
      const left = butterfly.children[0];
      const right = butterfly.children[1];

      if (left && right) {
        left.rotation.z = flap * 1.1;
        right.rotation.z = -flap * 1.1;
      }
    });
  });

  return (
    <group ref={group}>
      {flights.map((flight, index) => (
        <group key={index}>
          <mesh geometry={wing}>
            <meshStandardMaterial
              color={flight.color}
              roughness={1}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh geometry={wing} scale={[-1, 1, 1]}>
            <meshStandardMaterial
              color={flight.color}
              roughness={1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
