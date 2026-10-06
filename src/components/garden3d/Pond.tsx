"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Iazul.
 *
 * Apa e desenata in shader, nu dintr-o textura: unde si sclipiri care se misca
 * incet. O textura ar fi insemnat inca un fisier si aceeasi imagine inghetata.
 */
export function Pond({
  position,
  radius = 0.8,
}: {
  position: [number, number, number];
  radius?: number;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color("#8fd8e8") },
      uDeep: { value: new THREE.Color("#3f8fb0") },
    }),
    [],
  );

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      {/* Albia: o scobitura intunecata sub apa, ca iazul sa aiba adancime. */}
      <mesh position-y={-0.06} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[radius * 1.02, 32]} />
        <meshStandardMaterial color="#4a3b2c" roughness={1} />
      </mesh>

      {/* Luciul apei. */}
      <mesh position-y={0.015} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[radius, 48]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
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
              vec2 centred = vUv - 0.5;
              float distance = length(centred);

              /* Unde concentrice care pleaca din centru. */
              float ripple = sin(distance * 34.0 - uTime * 1.6) * 0.5 + 0.5;

              /* Sclipiri: doua unde incrucisate, mult mai fine. */
              float glint = sin(vUv.x * 42.0 + uTime * 0.9)
                          * sin(vUv.y * 38.0 - uTime * 1.1);
              glint = smoothstep(0.75, 1.0, glint);

              /* Marginea e mai deschisa: acolo apa e mai putin adanca. */
              vec3 water = mix(uShallow, uDeep, smoothstep(0.5, 0.05, distance));
              water += ripple * 0.06 + glint * 0.35;

              gl_FragColor = vec4(water, 0.88);
            }
          `}
        />
      </mesh>
    </group>
  );
}
