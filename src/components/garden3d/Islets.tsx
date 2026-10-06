"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { seededRandom } from "./random";

/**
 * Insulitele care plutesc in jurul gradinii.
 *
 * Sunt facute din geometrie, nu din modele generate: forma e simpla, iar asa
 * putem avea oricate fara sa incarcam niciun fisier in plus. Fiecare pluteste
 * cu ritmul ei, altfel s-ar misca toate ca un singur obiect.
 */

type IsletSeed = {
  position: [number, number, number];
  scale: number;
  rotation: number;
  bob: number;
  phase: number;
};

export function Islets() {
  const soil = useTexture("/garden3d/textures/soil.webp");
  const grass = useTexture("/garden3d/textures/grass.webp");

  const soilMap = useMemo(() => tiled(soil), [soil]);
  const grassMap = useMemo(() => tiled(grass), [grass]);

  const rock = useMemo(() => buildIsletRock(), []);
  const group = useRef<THREE.Group>(null);

  const seeds = useMemo<IsletSeed[]>(() => {
    const random = seededRandom(31337);

    /* Pozitiile sunt alese de mana, nu la intamplare. Camera fiind fixa, stim
       exact ce intra in cadru - imprastiate aleator, jumatate ajungeau in
       afara ecranului si restul acopereau gradina. */
    const layout: Array<[number, number, number, number]> = [
      // x, y, z, marime
      [-5.1, -2.4, 1.6, 0.5],
      [5.3, -3.2, -0.5, 0.44],
      [-4.0, -4.4, -2.2, 0.36],
      [4.4, -1.2, 3.1, 0.3],
      [-3.3, 1.8, -4.7, 0.26],
      [3.8, 2.2, -4.3, 0.3],
      [0.6, -5.0, 4.2, 0.46],
      [-5.9, -0.7, -0.9, 0.38],
      [6.1, -0.3, 2.3, 0.26],
      [-1.6, 2.9, -5.6, 0.22],
      [2.2, -6.2, 1.2, 0.34],
      [-2.6, -6.6, 2.8, 0.28],
    ];

    return layout.map(([x, y, z, scale]) => ({
      position: [x, y, z] as [number, number, number],
      scale,
      rotation: random() * Math.PI * 2,
      bob: 0.1 + random() * 0.2,
      phase: random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    const islets = group.current;
    if (!islets) return;

    const time = state.clock.elapsedTime;

    islets.children.forEach((islet, index) => {
      const seed = seeds[index];

      /* Plutirea: lenta si cu amplitudine mica. Mai mult si par aruncate. */
      islet.position.y = seed.position[1] + Math.sin(time * 0.3 + seed.phase) * seed.bob;
      islet.rotation.y = seed.rotation + Math.sin(time * 0.12 + seed.phase) * 0.06;
    });
  });

  return (
    <group ref={group}>
      {seeds.map((seed, index) => (
        <group key={index} position={seed.position} scale={seed.scale}>
          {/* Capacul de iarba. */}
          <mesh position-y={-0.1}>
            <cylinderGeometry args={[1, 0.96, 0.2, 9]} />
            <meshStandardMaterial map={grassMap} roughness={1} />
          </mesh>

          {/* Stanca de dedesubt. */}
          <mesh geometry={rock} position-y={-0.2}>
            <meshStandardMaterial
              map={soilMap}
              color="#c9b291"
              /* Aceeasi emisie ca la insula mare: fara ea, insulitele sunt
                 doar niste pete negre pe cer. */
              emissive="#6b5742"
              emissiveIntensity={0.7}
              roughness={1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function tiled(texture: THREE.Texture) {
  const copy = texture.clone();

  copy.wrapS = THREE.RepeatWrapping;
  copy.wrapT = THREE.RepeatWrapping;
  copy.repeat.set(2, 2);
  copy.colorSpace = THREE.SRGBColorSpace;
  copy.needsUpdate = true;

  return copy;
}

/**
 * Stanca unei insulite: un con cu putine laturi, cu varfurile deplasate.
 *
 * Noua laturi, nu patru: la insula mare forma patrata era ceruta, aici vrem
 * bolovani neregulati.
 */
function buildIsletRock(): THREE.BufferGeometry {
  const geometry = new THREE.ConeGeometry(0.98, 2.4, 9, 4);

  geometry.rotateX(Math.PI);
  geometry.translate(0, -1.2, 0);

  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const random = seededRandom(606);

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const below = Math.min(Math.max(-y / 2.4, 0), 1);
    const amount = below * 0.55;

    position.setX(i, position.getX(i) + (random() - 0.5) * amount);
    position.setY(i, y + (random() - 0.5) * amount * 0.5);
    position.setZ(i, position.getZ(i) + (random() - 0.5) * amount);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}
