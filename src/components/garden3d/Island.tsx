"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { PLOTS, PLOT_SIZE } from "./plots";
import { seededRandom } from "./random";
import { POND, Pond } from "./Pond";
import { Mist, Waterfall } from "./Waterfall";

/** Latura insulei. */
export const ISLAND_SIZE = 6.6;

/** Jumatatea laturii - folosita peste tot la asezarea obiectelor pe margini. */
export const ISLAND_HALF = ISLAND_SIZE / 2;

/**
 * Insula plutitoare, patrata.
 *
 * Sub iarba si pamantul lucrat atarna o piramida de pamant cu varfurile
 * deplasate. Fara deplasare arata a piramida de manual; cu ea, a bucata rupta
 * din sol.
 */
export function Island({
  highlightedPlot,
  onPointerMove,
}: {
  /** Parcela spre care se indreapta planta trasa acum. */
  highlightedPlot: number | null;
  onPointerMove?: (point: THREE.Vector3) => void;
}) {
  /* Incarcate separat, nu ca lista: cu o lista, ordinea in care se intorc nu e
     garantata si ajunge pamantul pe iarba fara sa dea nicio eroare. */
  const grass = useTexture("/garden3d/textures/grass.webp");
  const soil = useTexture("/garden3d/textures/soil.webp");

  const grassMap = useMemo(() => tiled(grass, 7), [grass]);
  const soilMap = useMemo(() => tiled(soil, 8, 1), [soil]);
  const plotMap = useMemo(() => tiled(soil, 2), [soil]);
  const earthMap = useMemo(() => tiled(soil, 4), [soil]);

  const tufts = useMemo(() => buildTufts(), []);
  const earth = useMemo(() => buildEarth(), []);

  return (
    <group>
      {/* Suprafata invizibila pentru tragere: mai mare decat insula, ca degetul
          sa poata iesi putin in afara fara sa se piarda urmarirea. */}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.002}
        visible={false}
        onPointerMove={(event) => {
          event.stopPropagation();
          onPointerMove?.(event.point);
        }}
      >
        <planeGeometry args={[24, 24]} />
        <meshBasicMaterial />
      </mesh>

      {/* Iarba: -0.12 .. 0 */}
      <mesh receiveShadow castShadow position-y={-0.06}>
        <boxGeometry args={[ISLAND_SIZE, 0.12, ISLAND_SIZE]} />
        <meshStandardMaterial map={grassMap} roughness={0.95} />
      </mesh>

      {/* Banda de pamant: -0.42 .. -0.12 */}
      <mesh receiveShadow castShadow position-y={-0.27}>
        <boxGeometry args={[ISLAND_SIZE, 0.3, ISLAND_SIZE]} />
        <meshStandardMaterial map={soilMap} roughness={1} />
      </mesh>

      {/* Masa de pamant de dedesubt. */}
      <mesh geometry={earth} castShadow position-y={-0.42}>
        <meshStandardMaterial
          map={earthMap}
          color="#c9b291"
          /* Sub insula nu ajunge aproape nicio lumina. In loc sa adaugam inca
             o sursa doar pentru pamant, ii dam o emisie proprie - obisnuit in
             stilul asta si mult mai ieftin. */
          emissive="#6b5742"
          emissiveIntensity={0.75}
          roughness={1}
        />
      </mesh>

      {/* Smocuri de iarba, toate intr-un singur mesh. */}
      <mesh geometry={tufts} castShadow receiveShadow>
        <meshStandardMaterial color="#8cc48f" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      <Pond />

      {/* Parcelele. */}
      {PLOTS.map((plot, index) => (
        <PlotBed
          key={index}
          x={plot.x}
          z={plot.z}
          map={plotMap}
          highlighted={highlightedPlot === index}
        />
      ))}

      {/* Cascadele si ceata de la baza lor. */}
      <Waterfall position={[-2.1, -1.9, ISLAND_HALF - 0.05]} width={0.9} height={3.6} />
      <Waterfall
        position={[ISLAND_HALF - 0.05, -2.2, 0.9]}
        rotation={Math.PI / 2}
        width={1.1}
        height={4.2}
      />
      <Waterfall position={[1.4, -1.7, -ISLAND_HALF + 0.05]} width={0.7} height={3.2} />

      <Mist position={[-2.1, -3.5, ISLAND_HALF - 0.05]} />
      <Mist position={[ISLAND_HALF - 0.05, -4.1, 0.9]} />
      <Mist position={[1.4, -3.1, -ISLAND_HALF + 0.05]} />
    </group>
  );
}

/**
 * O parcela: pamant lucrat, incadrat de iarba.
 *
 * Cand planta trasa se indreapta spre ea, se aprinde - singurul fel in care
 * utilizatorul stie unde va ateriza inainte sa ridice degetul.
 */
function PlotBed({
  x,
  z,
  map,
  highlighted,
}: {
  x: number;
  z: number;
  map: THREE.Texture;
  highlighted: boolean;
}) {
  const glow = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    const paint = glow.current;
    if (!paint) return;

    const pulse = 0.75 + Math.sin(state.clock.elapsedTime * 4) * 0.22;
    const target = highlighted ? pulse : 0;

    paint.opacity += (target - paint.opacity) * (1 - Math.pow(0.002, delta));
  });

  return (
    <group position={[x, 0, z]}>
      <mesh receiveShadow position-y={0.012} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[PLOT_SIZE, PLOT_SIZE]} />
        <meshStandardMaterial map={map} roughness={1} />
      </mesh>

      <mesh position-y={0.018} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[PLOT_SIZE * 0.42, PLOT_SIZE * 0.62, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial
          ref={glow}
          color="#9bffb4"
          transparent
          opacity={0}
          depthWrite={false}
        />
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

/**
 * Masa de pamant de sub insula.
 *
 * Un con cu patru laturi e o piramida, iar o piramida rotita cu 45 de grade se
 * aliniaza exact cu insula patrata. Varfurile se deplaseaza cu atat mai mult cu
 * cat sunt mai jos: sus, unde se lipeste de pamantul lucrat, trebuie sa ramana
 * dreapta, altfel se vede imbinarea.
 */
function buildEarth(): THREE.BufferGeometry {
  const depth = 4.2;

  /* Raza care face ca baza piramidei sa coincida cu latura insulei. */
  const geometry = new THREE.ConeGeometry(ISLAND_HALF * Math.SQRT2, depth, 4, 6);

  geometry.rotateY(Math.PI / 4);
  geometry.rotateX(Math.PI);
  geometry.translate(0, -depth / 2, 0);

  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const random = seededRandom(777);

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const below = Math.min(Math.max(-y / depth, 0), 1);
    const amount = below * 0.75;

    position.setX(i, position.getX(i) + (random() - 0.5) * amount);
    position.setY(i, y + (random() - 0.5) * amount * 0.6);
    position.setZ(i, position.getZ(i) + (random() - 0.5) * amount);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

/** Cate smocuri de iarba se imprastie pe insula. */
const TUFT_COUNT = 300;

/**
 * Construieste smocurile intr-o singura geometrie.
 *
 * Un singur mesh inseamna un singur apel de desenare, indiferent cate fire
 * sunt. Cu 300 de obiecte separate, telefonul ar incepe sa geama degeaba.
 */
function buildTufts(): THREE.BufferGeometry {
  const blade = new THREE.ConeGeometry(0.028, 0.2, 4, 1, true);
  const pieces: THREE.BufferGeometry[] = [];
  const random = seededRandom(1312);

  for (let i = 0; i < TUFT_COUNT; i++) {
    const x = (random() - 0.5) * (ISLAND_SIZE - 0.2);
    const z = (random() - 0.5) * (ISLAND_SIZE - 0.2);

    /* Nu crestem iarba peste parcele: acolo e pamant lucrat. */
    const onPlot = PLOTS.some(
      (plot) =>
        Math.abs(plot.x - x) < PLOT_SIZE * 0.6 && Math.abs(plot.z - z) < PLOT_SIZE * 0.6,
    );
    if (onPlot) continue;

    /* Nici prin iaz: fire de iarba iesind din apa arata a greseala. */
    if (Math.hypot(POND.x - x, POND.z - z) < POND.radius * 1.3) continue;

    const piece = blade.clone();
    piece.scale(1, 0.7 + random() * 0.9, 1);
    piece.rotateZ((random() - 0.5) * 0.5);
    piece.rotateY(random() * Math.PI);
    piece.translate(x, 0.08, z);

    pieces.push(piece);
  }

  const merged = mergeGeometries(pieces) ?? new THREE.BufferGeometry();
  blade.dispose();
  for (const piece of pieces) piece.dispose();

  return merged;
}
