"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Unde sta iazul pe insula si cat de mare e. */
export const POND = { x: 2.05, z: 1.95, radius: 0.78 };

/**
 * Iazul.
 *
 * Insula e o cutie, deci nu se poate sapa o gaura in ea. Adancimea se
 * sugereaza in schimb: o fasie de nisip in jur si un inel inchis la culoare
 * chiar sub marginea apei, care citeste ca umbra malului. Prima varianta chiar
 * cobora apa sub nivelul ierbii - si disparea complet sub cutia insulei.
 *
 * Apa e desenata in shader. Primele incercari foloseau doua unde inmultite,
 * ceea ce dadea o retea de buline - aici sunt fasii care curg, nu puncte.
 */
export function Pond() {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color("#cdf0f6") },
      uDeep: { value: new THREE.Color("#6ec3da") },
    }),
    [],
  );

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[POND.x, 0, POND.z]}>
      {/* Malul de nisip. */}
      <mesh receiveShadow position-y={0.006} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[POND.radius * 1.2, 40]} />
        <meshStandardMaterial color="#cbb998" roughness={1} />
      </mesh>

      {/* Inel inchis la culoare chiar sub marginea apei.
          Insula e o cutie, deci nu putem sapa o gaura in ea - adancimea se
          sugereaza cu umbra malului, nu cu geometrie. */}
      <mesh position-y={0.009} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[POND.radius * 0.9, POND.radius * 1.04, 40]} />
        <meshStandardMaterial color="#6a5c42" roughness={1} />
      </mesh>

      {/* Luciul apei. */}
      <mesh position-y={0.013} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[POND.radius, 48]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          /* Fara corectia de ton a randarii: shaderul scrie culoarea finala,
             iar corectia o inchidea pana la bleumarin. */
          toneMapped={false}
          transparent
          depthWrite={false}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            uniform float uTime;
            uniform vec3 uShallow;
            uniform vec3 uDeep;
            varying vec2 vUv;

            void main() {
              vec2 p = vUv - 0.5;
              float distance = length(p) * 2.0;

              /* Trei fasii care curg in directii usor diferite. Suprapuse, nu
                 inmultite - inmultirea face o retea de puncte. */
              float bands =
                  sin((p.x + p.y) * 9.0 + uTime * 0.7)
                + sin((p.x - p.y) * 7.0 - uTime * 0.5) * 0.7
                + sin(p.y * 13.0 + uTime * 0.9) * 0.4;

              float shimmer = smoothstep(1.1, 2.1, bands);

              /* Mai adanca spre mijloc, mai deschisa spre mal. */
              vec3 water = mix(uDeep, uShallow, smoothstep(0.0, 1.15, distance));
              water = mix(water, vec3(1.0), shimmer * 0.5);

              /* Se stinge spre margine, ca sa se topeasca in mal. */
              float alpha = 0.9 * smoothstep(1.02, 0.86, distance);

              gl_FragColor = vec4(water, alpha);
            }
          `}
        />
      </mesh>
    </group>
  );
}
