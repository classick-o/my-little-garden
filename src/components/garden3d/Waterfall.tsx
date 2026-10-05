"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Cascada care cade de pe marginea insulei.
 *
 * Nu are nevoie de textura: dungile verticale sunt desenate in shader si
 * coboara in timp. O textura ar fi insemnat inca un fisier de incarcat si
 * aceeasi imagine repetata pe toate cascadele.
 */

export function Waterfall({
  position,
  rotation = 0,
  width = 0.8,
  height = 3.4,
}: {
  position: [number, number, number];
  rotation?: number;
  width?: number;
  height?: number;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTop: { value: new THREE.Color("#ffffff") },
      uBottom: { value: new THREE.Color("#a9e2ff") },
    }),
    [],
  );

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position} rotation-y={rotation}>
      <planeGeometry args={[width, height, 1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          uniform vec3 uTop;
          uniform vec3 uBottom;
          varying vec2 vUv;

          /* Zgomot ieftin, suficient pentru niste suvite de apa. */
          float hash(float n) { return fract(sin(n) * 43758.5453); }

          void main() {
            /* Suvite verticale, fiecare cu viteza ei. */
            float lane = floor(vUv.x * 7.0);
            float speed = 0.6 + hash(lane) * 0.8;
            float flow = fract(vUv.y * 3.0 + uTime * speed + hash(lane) * 10.0);

            float strand = smoothstep(0.0, 0.45, flow) * smoothstep(1.0, 0.55, flow);

            /* Se ingusteaza spre varf si se destrama spre baza. */
            float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
            float fade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, 1.0 - vUv.y);

            float alpha = (0.55 + strand * 0.45) * edge * fade;

            gl_FragColor = vec4(mix(uBottom, uTop, vUv.y), alpha);
          }
        `}
      />
    </mesh>
  );
}

/** Ceata de la baza cascadei, acolo unde apa se pierde in nori. */
export function Mist({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      /* Pulseaza foarte incet, ca sa nu para un obiect lipit. */
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.07;
      mesh.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.55, 16, 12]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthWrite={false} />
    </mesh>
  );
}
