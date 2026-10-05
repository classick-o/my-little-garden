"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { seededRandom } from "./random";
import { HAZE_COLOR } from "./World";

/**
 * Luminile si aerul gradinii.
 *
 * Trei lumini, fiecare cu rolul ei: una calda care face umbrele, una rece din
 * partea opusa ca sa nu fie umbrele moarte, si una verzuie din spate care
 * desprinde plantele de fundal. Cu o singura lumina, scena arata plat si ieftin.
 */

/** Culoarea cetii: aceeasi cu orizontul, altfel departarile taie brusc. */
export const AIR_COLOR = HAZE_COLOR;

export function Atmosphere() {
  return (
    <>
      {/* Ceata departeaza muntii si topeste norii in zare. Densitate mica:
          lumea e acum mult mai mare decat insula. */}
      <fogExp2 attach="fog" args={[AIR_COLOR, 0.016]} />

      {/* Lumina ambientala a cerului: cald sus, verde reflectat de jos. */}
      <hemisphereLight args={["#eaf6ff", "#6f9a63", 1.5]} />

      {/* Soarele. Singura lumina care face umbre. */}
      <directionalLight
        position={[5, 7.5, 4]}
        intensity={2.9}
        color="#fff4de"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.0007}
        shadow-normalBias={0.02}
      />

      {/* Umplutura rece din partea opusa: umbrele capata culoare, nu raman gri. */}
      <directionalLight position={[-5, 3, -3]} intensity={0.7} color="#bfe4ff" />

      {/* Lumina reflectata de nori, de jos in sus: fara ea stanca de sub
          insula ramane complet neagra. */}
      <directionalLight position={[1, -7, 4]} intensity={1.5} color="#e8f4ff" />

      {/* Contur cald dinspre soare, care desprinde siluetele de cer. */}
      <directionalLight position={[-6, 4, -9]} intensity={1.1} color="#ffe6b0" />

      <Pollen />
    </>
  );
}

/** Cate fire de polen plutesc in aer. */
const POLLEN_COUNT = 55;

/**
 * Praf de polen care pluteste in lumina.
 *
 * Detaliul care face diferenta dintre o scena statica si una care pare vie,
 * chiar si cand utilizatorul nu atinge nimic.
 */
function Pollen() {
  const points = useRef<THREE.Points>(null);

  const { geometry, speeds } = useMemo(() => {
    const positions = new Float32Array(POLLEN_COUNT * 3);
    const speeds = new Float32Array(POLLEN_COUNT);
    const random = seededRandom(7);

    for (let i = 0; i < POLLEN_COUNT; i++) {
      /* Distribuite intr-un disc in jurul gradinii, nu intr-un cub: altfel
         jumatate ar pluti in afara cadrului. */
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * 2.6;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = random() * 2.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      speeds[i] = 0.04 + random() * 0.08;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    return { geometry, speeds };
  }, []);

  useFrame((state, delta) => {
    const mesh = points.current;
    if (!mesh) return;

    const attribute = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < POLLEN_COUNT; i++) {
      /* Urca incet si se leagana usor pe orizontala. */
      array[i * 3 + 1] += speeds[i] * delta;
      array[i * 3] += Math.sin(time * 0.4 + i) * 0.0012;

      /* Cand ajunge sus, reintra pe jos. */
      if (array[i * 3 + 1] > 2.4) array[i * 3 + 1] = 0;
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.028}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
