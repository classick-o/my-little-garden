"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { seededRandom } from "./random";

/**
 * Lumea din jurul insulei: cer, soare si nori.
 *
 * Totul aici e decor pur - nu se poate atinge, nu arunca umbre, nu participa
 * la nimic. Exista ca insula sa pluteasca undeva, nu intr-un gol.
 */

/** Cerul, de sus in jos. */
const SKY_TOP = "#5fa8dd";
const SKY_HORIZON = "#cfe9f2";

/** Ceata are culoarea orizontului, altfel departarile taie brusc. */
export const HAZE_COLOR = "#cfe9f2";

export function World() {
  return (
    <>
      <SkyDome />
      <Sun />
      <Clouds />
    </>
  );
}

/**
 * Cupola de cer.
 *
 * Un gradient pe o sfera intoarsa pe dos. Mai ieftin decat o imagine de fundal
 * si nu se pixeleaza niciodata, oricat de aproape ar ajunge camera.
 */
function SkyDome() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(SKY_TOP) },
      uHorizon: { value: new THREE.Color(SKY_HORIZON) },
    }),
    [],
  );

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[60, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        depthWrite={false}
        side={THREE.BackSide}
        vertexShader={/* glsl */ `
          varying vec3 vWorld;
          void main() {
            vWorld = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uHorizon;
          varying vec3 vWorld;

          void main() {
            /* Inaltimea normalizata, inmuiata ca trecerea sa nu aiba o dunga. */
            float h = clamp(vWorld.y / 60.0, -1.0, 1.0) * 0.5 + 0.5;
            float t = smoothstep(0.42, 0.95, h);
            gl_FragColor = vec4(mix(uHorizon, uTop, t), 1.0);
          }
        `}
      />
    </mesh>
  );
}

/** Soarele: un disc moale, sus in spate. Nu lumineaza, doar se vede. */
function Sun() {
  return (
    <group position={[-14, 11, -34]}>
      <mesh>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color="#fff6d8" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[6.5, 48]} />
        <meshBasicMaterial color="#ffe9a8" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[13, 48]} />
        <meshBasicMaterial color="#ffeec0" transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Cati nori plutesc in jur. */
const CLOUD_COUNT = 18;

type CloudSeed = {
  position: [number, number, number];
  scale: number;
  speed: number;
  opacity: number;
};

/**
 * Norii.
 *
 * Panouri care se intorc mereu spre camera. Plutesc lent si, cand ies prea
 * departe intr-o parte, reapar in cealalta - asa nu se termina niciodata.
 *
 * Stau toti in spatele insulei. Asezati pe un cerc in jurul ei, unii treceau
 * prin fata, iar apropiat se vedea muchia dreapta a panoului taind gradina -
 * textura nu se stinge la margine, iar de departe asta nu se observa.
 */
function Clouds() {
  const texture = useTexture("/garden3d/textures/cloud.png");
  const group = useRef<THREE.Group>(null);

  const seeds = useMemo<CloudSeed[]>(() => {
    const random = seededRandom(99);

    return Array.from({ length: CLOUD_COUNT }, () => {
      return {
        position: [
          (random() - 0.5) * 46,
          -6 + random() * 10,
          /* Mereu in spate, si destul de departe cat sa nu ajunga langa
             camera nici la apropierea maxima. */
          -(11 + random() * 17),
        ] as [number, number, number],
        scale: 4 + random() * 7,
        speed: 0.12 + random() * 0.2,
        opacity: 0.55 + random() * 0.35,
      };
    });
  }, []);

  useFrame((_, delta) => {
    const clouds = group.current;
    if (!clouds) return;

    for (const cloud of clouds.children) {
      cloud.position.x += delta * 0.25;

      /* Reintra pe partea cealalta cand a trecut de margine. */
      if (cloud.position.x > 28) cloud.position.x = -28;
    }
  });

  return (
    <group ref={group}>
      {seeds.map((seed, index) => (
        <sprite
          key={index}
          position={seed.position}
          scale={[seed.scale, seed.scale * 0.58, 1]}
        >
          <spriteMaterial
            map={texture}
            transparent
            opacity={seed.opacity}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

