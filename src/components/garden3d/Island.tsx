"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { seededRandom } from "./random";

/** Raza insulei. Plantele nu pot fi trase dincolo de ea. */
export const ISLAND_RADIUS = 1.78;

/**
 * Insula pe care sta gradina.
 *
 * Texturile sunt generate si repetate; fara ele, discul arata ca o farfurie de
 * plastic. Smocurile de iarba de pe margine rup silueta prea perfecta a
 * cilindrului - fara ele se vede imediat ca e o forma matematica.
 */
export function Island({
  onPointerMove,
  onPointerUp,
}: {
  onPointerMove?: (point: THREE.Vector3) => void;
  onPointerUp?: () => void;
}) {
  /* Incarcate separat, nu ca lista: cu o lista, ordinea in care se intorc nu e
     garantata si ajunge pamantul pe iarba fara sa dea nicio eroare. */
  const grass = useTexture("/garden3d/textures/grass.webp");
  const soil = useTexture("/garden3d/textures/soil.webp");

  /* Texturile din cache sunt impartite; le clonam ca sa le putem repeta
     diferit fara sa stricam alte folosiri. */
  const grassMap = useMemo(() => tiled(grass, 5), [grass]);
  const soilMap = useMemo(() => tiled(soil, 6, 1), [soil]);

  const tufts = useMemo(() => buildTufts(), []);

  return (
    <group>
      {/* Suprafata invizibila pentru tragere: mai mare decat insula, ca degetul
          sa poata iesi putin in afara fara sa se piarda urmarirea. */}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.001}
        visible={false}
        onPointerMove={(event) => {
          event.stopPropagation();
          onPointerMove?.(event.point);
        }}
        onPointerUp={() => onPointerUp?.()}
      >
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial />
      </mesh>

      {/* Straturile insulei, cu cote explicite care nu se suprapun.
          Suprafata ierbii e exact la y=0, acolo unde stau ghivecele. */}
      <group>
        {/* Iarba: -0.08 .. 0 */}
        <mesh receiveShadow castShadow position-y={-0.04}>
          <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS, 0.08, 80]} />
          <meshStandardMaterial map={grassMap} roughness={0.95} />
        </mesh>

        {/* Banda de pamant: -0.28 .. -0.08 */}
        <mesh receiveShadow castShadow position-y={-0.18}>
          <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS - 0.08, 0.2, 80]} />
          <meshStandardMaterial map={soilMap} roughness={1} />
        </mesh>

        {/* Se ingusteaza: -0.7 .. -0.28. Insula pare rupta din sol, nu taiata. */}
        <mesh castShadow position-y={-0.49}>
          <cylinderGeometry args={[ISLAND_RADIUS - 0.08, ISLAND_RADIUS - 0.62, 0.42, 80]} />
          <meshStandardMaterial map={soilMap} roughness={1} />
        </mesh>

        {/* Varful: -0.94 .. -0.7 */}
        <mesh castShadow position-y={-0.82}>
          <cylinderGeometry args={[ISLAND_RADIUS - 0.62, 0.14, 0.24, 48]} />
          <meshStandardMaterial map={soilMap} roughness={1} />
        </mesh>
      </group>

      {/* Smocuri de iarba, toate intr-un singur mesh. */}
      <mesh geometry={tufts} position-y={0} castShadow receiveShadow>
        <meshStandardMaterial color="#8cc48f" roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Pregateste o textura pentru repetare. */
function tiled(texture: THREE.Texture, repeatX: number, repeatY = repeatX) {
  const copy = texture.clone();

  copy.wrapS = THREE.RepeatWrapping;
  copy.wrapT = THREE.RepeatWrapping;
  copy.repeat.set(repeatX, repeatY);
  copy.colorSpace = THREE.SRGBColorSpace;
  copy.anisotropy = 8;
  copy.needsUpdate = true;

  return copy;
}

/** Cate smocuri de iarba se imprastie pe insula. */
const TUFT_COUNT = 150;

/**
 * Construieste smocurile intr-o singura geometrie.
 *
 * Un singur mesh inseamna un singur apel de desenare, indiferent cate fire
 * sunt. Cu 150 de obiecte separate, telefonul ar incepe sa geama degeaba.
 */
function buildTufts(): THREE.BufferGeometry {
  const blade = new THREE.ConeGeometry(0.026, 0.2, 4, 1, true);
  const pieces: THREE.BufferGeometry[] = [];
  const random = seededRandom(1312);

  for (let i = 0; i < TUFT_COUNT; i++) {
    const angle = random() * Math.PI * 2;

    /* Radacina patrata imprastie uniform pe disc. Spre margine lasam mai
       multe, ca silueta insulei sa fie neregulata. */
    const radius = Math.sqrt(random()) * (ISLAND_RADIUS - 0.04);

    const piece = blade.clone();
    piece.scale(1, 0.7 + random() * 0.9, 1);
    piece.rotateZ((random() - 0.5) * 0.5);
    piece.rotateY(random() * Math.PI);
    piece.translate(Math.cos(angle) * radius, 0.07, Math.sin(angle) * radius);

    pieces.push(piece);
  }

  const merged = mergeGeometries(pieces);
  blade.dispose();
  for (const piece of pieces) piece.dispose();

  return merged ?? new THREE.BufferGeometry();
}
