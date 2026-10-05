"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { PLOTS, PLOT_SIZE } from "./plots";
import { seededRandom } from "./random";
import { Mist, Waterfall } from "./Waterfall";

/** Raza insulei. */
export const ISLAND_RADIUS = 2.62;

/**
 * Insula plutitoare.
 *
 * Trei straturi vizibile: iarba sus, o banda de pamant, si stanca neregulata
 * dedesubt. Stanca e cheia - un con neted arata a desen tehnic, nu a bucata
 * rupta din munte.
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

  const grassMap = useMemo(() => tiled(grass, 6), [grass]);
  const soilMap = useMemo(() => tiled(soil, 7, 1), [soil]);
  const plotMap = useMemo(() => tiled(soil, 2), [soil]);
  /* Pe con, o textura intinsa pe orizontala se mazgaleste; o repetam pe ambele axe. */
  const rockMap = useMemo(() => tiled(soil, 3), [soil]);

  const tufts = useMemo(() => buildTufts(), []);
  const rock = useMemo(() => buildRock(), []);

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
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial />
      </mesh>

      {/* Iarba: -0.1 .. 0 */}
      <mesh receiveShadow castShadow position-y={-0.05}>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS, 0.1, 96]} />
        <meshStandardMaterial map={grassMap} roughness={0.95} />
      </mesh>

      {/* Banda de pamant: -0.34 .. -0.1 */}
      <mesh receiveShadow castShadow position-y={-0.22}>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS - 0.1, 0.24, 96]} />
        <meshStandardMaterial map={soilMap} roughness={1} />
      </mesh>

      {/* Stanca de dedesubt. */}
      {/* Stanca primeste putina lumina directa, deci o deschidem la culoare -
          altfel atarna ca o pata neagra sub o insula insorita. */}
      <mesh geometry={rock} castShadow position-y={-0.34}>
        <meshStandardMaterial
          map={rockMap}
          color="#c9b291"
          /* Sub insula nu ajunge aproape nicio lumina. In loc sa adaugam inca
             o sursa doar pentru stanca, ii dam o emisie proprie - obisnuit in
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
      <Waterfall position={[-1.75, -1.6, 1.55]} rotation={-0.72} width={0.75} height={3.2} />
      <Waterfall position={[2.05, -1.9, -0.9]} rotation={1.15} width={0.95} height={3.8} />
      <Waterfall position={[0.3, -1.5, -2.2]} rotation={0.1} width={0.6} height={2.8} />

      <Mist position={[-1.75, -3.1, 1.55]} />
      <Mist position={[2.05, -3.7, -0.9]} />
      <Mist position={[0.3, -2.8, -2.2]} />
    </group>
  );
}

/**
 * O parcela: pamant lucrat, incadrat de o margine joasa.
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

    const pulse = 0.45 + Math.sin(state.clock.elapsedTime * 4) * 0.18;
    const target = highlighted ? pulse : 0;

    paint.opacity += (target - paint.opacity) * (1 - Math.pow(0.002, delta));
  });

  return (
    <group position={[x, 0, z]}>
      {/* Pamantul lucrat, usor adancit in iarba. */}
      <mesh receiveShadow position-y={0.012} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[PLOT_SIZE, PLOT_SIZE]} />
        <meshStandardMaterial map={map} roughness={1} />
      </mesh>

      {/* Inelul care se aprinde la tragere. */}
      <mesh position-y={0.018} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[PLOT_SIZE * 0.44, PLOT_SIZE * 0.58, 32]} />
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
 * Stanca de sub insula.
 *
 * Un con caruia ii deplasam varfurile ca sa nu mai fie un con. Deplasarea
 * creste spre varful de jos: sus, unde se lipeste de pamant, trebuie sa ramana
 * rotund, altfel se vede imbinarea.
 */
function buildRock(): THREE.BufferGeometry {
  const geometry = new THREE.ConeGeometry(ISLAND_RADIUS - 0.1, 3.2, 18, 5);

  /* Conul are varful in sus; il intoarcem ca sa atarne sub insula. */
  geometry.rotateX(Math.PI);
  geometry.translate(0, -1.6, 0);

  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const random = seededRandom(777);

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);

    /* 0 la imbinarea cu pamantul, 1 la varful de jos. */
    const depth = Math.min(Math.max(-y / 3.2, 0), 1);
    const amount = depth * 0.45;

    position.setX(i, position.getX(i) + (random() - 0.5) * amount);
    position.setY(i, y + (random() - 0.5) * amount * 0.6);
    position.setZ(i, position.getZ(i) + (random() - 0.5) * amount);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

/** Cate smocuri de iarba se imprastie pe insula. */
const TUFT_COUNT = 260;

/**
 * Construieste smocurile intr-o singura geometrie.
 *
 * Un singur mesh inseamna un singur apel de desenare, indiferent cate fire
 * sunt. Cu 260 de obiecte separate, telefonul ar incepe sa geama degeaba.
 */
function buildTufts(): THREE.BufferGeometry {
  const blade = new THREE.ConeGeometry(0.026, 0.19, 4, 1, true);
  const pieces: THREE.BufferGeometry[] = [];
  const random = seededRandom(1312);

  for (let i = 0; i < TUFT_COUNT; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * (ISLAND_RADIUS - 0.05);

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    /* Nu crestem iarba peste parcele: acolo e pamant lucrat. */
    const onPlot = PLOTS.some(
      (plot) =>
        Math.abs(plot.x - x) < PLOT_SIZE * 0.6 && Math.abs(plot.z - z) < PLOT_SIZE * 0.6,
    );
    if (onPlot) continue;

    const piece = blade.clone();
    piece.scale(1, 0.7 + random() * 0.9, 1);
    piece.rotateZ((random() - 0.5) * 0.5);
    piece.rotateY(random() * Math.PI);
    piece.translate(x, 0.07, z);

    pieces.push(piece);
  }

  const merged = mergeGeometries(pieces) ?? new THREE.BufferGeometry();
  blade.dispose();
  for (const piece of pieces) piece.dispose();

  return merged;
}

