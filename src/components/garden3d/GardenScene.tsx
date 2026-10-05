"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";

import { Plant } from "./Plant";
import { tickWind } from "./wind";

/**
 * Gradina 3D - test vizual.
 *
 * Patru plante generate cu acelasi prompt de stil, asezate pe o insula, cu
 * vant in frunze. Canvas-ul e transparent, deci fundalul verde si lumina
 * aplicatiei se vad in spate - gradina pare asezata in aplicatie, nu lipita
 * peste ea.
 */

type GardenPlant = {
  id: string;
  name: string;
  species: string;
  url: string;
  position: [number, number, number];
  height: number;
  rotation: number;
  /* Cat de mult o misca vantul. O sansevieria e rigida, un pothos cade moale -
     daca toate s-ar misca la fel, scena ar parea facuta din acelasi material. */
  wind: number;
  wateredDaysAgo: number;
};

const PLANTS: GardenPlant[] = [
  {
    id: "luna",
    name: "Luna",
    species: "Monstera deliciosa",
    url: "/garden3d/monstera.glb",
    position: [-0.8, 0, 0.5],
    height: 1.3,
    rotation: 0.3,
    wind: 1,
    wateredDaysAgo: 3,
  },
  {
    id: "stela",
    name: "Stela",
    species: "Sansevieria trifasciata",
    url: "/garden3d/sansevieria.glb",
    position: [0.85, 0, -0.45],
    height: 1.15,
    rotation: -0.45,
    wind: 0.3,
    wateredDaysAgo: 11,
  },
  {
    id: "pufi",
    name: "Pufi",
    species: "Echeveria elegans",
    url: "/garden3d/echeveria.glb",
    position: [-0.62, 0, -0.8],
    height: 0.55,
    rotation: 0.9,
    wind: 0.12,
    wateredDaysAgo: 6,
  },
  {
    id: "iedera",
    name: "Iedera",
    species: "Epipremnum aureum",
    url: "/garden3d/pothos.glb",
    position: [0.68, 0, 0.8],
    height: 0.9,
    rotation: -1,
    wind: 0.85,
    wateredDaysAgo: 1,
  },
];

for (const plant of PLANTS) {
  useGLTF.preload(plant.url);
}

/** Raza zonei care trebuie sa incapa mereu in cadru. */
const CONTENT_RADIUS = 1.95;
const CAMERA_FOV = 42;

/* Directia din care privim gradina. Ramane aceeasi pe orice ecran - se schimba
   doar cat de departe sta camera. */
const CAMERA_DIRECTION = { x: 1, y: 0.82, z: 1 };

/**
 * Distanta de la care gradina incape intreaga in cadru.
 *
 * Pe un telefon in picioare raportul e in jur de 0.46, iar campul vizual
 * orizontal devine mult mai ingust decat cel vertical. Cu o pozitie fixa,
 * gradina ar iesi din cadru exact pe ecranul pe care o foloseste ea.
 */
function framingPosition(width: number, height: number): [number, number, number] {
  const aspect = width / Math.max(height, 1);
  const verticalFov = (CAMERA_FOV * Math.PI) / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

  /* Ne incadram dupa axa mai stramta: pe telefon e cea orizontala. */
  const narrowest = Math.min(verticalFov, horizontalFov);
  const distance = (CONTENT_RADIUS / Math.tan(narrowest / 2)) * 1.1;

  const { x, y, z } = CAMERA_DIRECTION;
  const length = Math.sqrt(x * x + y * y + z * z);

  return [
    (x / length) * distance,
    (y / length) * distance + 0.4,
    (z / length) * distance,
  ];
}

export function GardenScene() {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([
    5.5, 4.9, 5.5,
  ]);

  useEffect(() => {
    const fit = () =>
      setCameraPosition(framingPosition(window.innerWidth, window.innerHeight));

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wind, setWind] = useState(1);
  const [growth, setGrowth] = useState(1);

  const selected = PLANTS.find((plant) => plant.id === selectedId) ?? null;

  return (
    <div className="relative h-dvh w-full">
      <Canvas
        /* alpha: fundalul verde al aplicatiei se vede prin scena. */
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        shadows
        onPointerMissed={() => setSelectedId(null)}
      >
        {/* Lumina calda din dreapta sus, ca in restul aplicatiei. */}
        <hemisphereLight args={["#eaf7ea", "#2b4a33", 1.1] as const} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={2.2}
          color="#fff6e2"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-bias={-0.0008}
        />
        {/* Lumina slaba din spate, ca sa nu fie marginile complet negre. */}
        <directionalLight position={[-3, 2, -4]} intensity={0.5} color="#8ef2a8" />

        <PerspectiveCamera makeDefault fov={CAMERA_FOV} position={cameraPosition} />
        <WindClock />
        <Island />

        <Suspense fallback={null}>
          {PLANTS.map((plant) => (
            <Plant
              key={plant.id}
              url={plant.url}
              position={plant.position}
              height={plant.height}
              rotation={plant.rotation}
              windStrength={plant.wind * wind}
              growth={growth}
              selected={selectedId === plant.id}
              onSelect={() => setSelectedId(plant.id)}
            />
          ))}
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={3.5}
          maxDistance={16}
          /* Camera nu coboara sub orizont si nu urca in varful capului:
             gradina trebuie sa ramana vazuta din aceeasi parte. */
          minPolarAngle={0.5}
          maxPolarAngle={1.35}
          target={[0, 0.45, 0]}
        />
      </Canvas>

      <Overlay
        selected={selected}
        wind={wind}
        onWindChange={setWind}
        growth={growth}
        onGrowthChange={setGrowth}
      />
    </div>
  );
}

/**
 * Avanseaza timpul vantului o singura data pe cadru, pentru toata gradina.
 * Toate materialele citesc acelasi ceas.
 */
function WindClock() {
  useFrame((state) => tickWind(state.clock.elapsedTime));
  return null;
}

/** Insula pe care sta gradina. */
function Island() {
  return (
    <group position={[0, -0.15, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.8, 1.68, 0.26, 72]} />
        {/* Ordinea grupurilor la cilindru: lateral, capac sus, capac jos. */}
        <meshStandardMaterial attach="material-0" color="#7a5c3f" roughness={1} />
        <meshStandardMaterial attach="material-1" color="#6fa174" roughness={1} />
        <meshStandardMaterial attach="material-2" color="#4a3827" roughness={1} />
      </mesh>

      {/* Pamantul de dedesubt, ca insula sa aiba grosime vazuta din lateral. */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[1.68, 1.25, 0.42, 72]} />
        <meshStandardMaterial color="#59412c" roughness={1} />
      </mesh>
    </group>
  );
}

type OverlayProps = {
  selected: GardenPlant | null;
  wind: number;
  onWindChange: (value: number) => void;
  growth: number;
  onGrowthChange: (value: number) => void;
};

/** Panoul de control. Exista doar in testul asta, nu in aplicatia reala. */
function Overlay({
  selected,
  wind,
  onWindChange,
  growth,
  onGrowthChange,
}: OverlayProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <p className="text-sm text-ink-subtle">Test vizual</p>
        <h1 className="mt-1 text-[1.9rem]">Gradina ta</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Atinge o planta. Trage ca sa rotesti.
        </p>
      </div>

      {/* Fisa plantei selectate. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] transition-all duration-300 ${
          selected ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="glass mx-auto max-w-sm rounded-xl p-4 shadow-raised">
          <h2 className="text-xl">{selected?.name ?? ""}</h2>
          <p className="text-[13px] text-ink-muted">{selected?.species ?? ""}</p>
          <p className="mt-2 text-[13px] text-water">
            Udata acum {selected?.wateredDaysAgo ?? 0} zile
          </p>
        </div>
      </div>

      {/* Reglaje de test, sus-dreapta ca sa nu acopere fisa. */}
      <div className="glass absolute right-4 top-28 w-40 rounded-lg p-3 text-[12px]">
        <label className="block">
          <span className="text-ink-muted">Vant</span>
          <input
            type="range"
            min={0}
            max={2.5}
            step={0.1}
            value={wind}
            onChange={(event) => onWindChange(Number(event.target.value))}
            className="mt-1 w-full accent-[#4ade80]"
          />
        </label>

        <label className="mt-3 block">
          <span className="text-ink-muted">Crestere</span>
          <input
            type="range"
            min={0.25}
            max={1}
            step={0.01}
            value={growth}
            onChange={(event) => onGrowthChange(Number(event.target.value))}
            className="mt-1 w-full accent-[#4ade80]"
          />
        </label>
      </div>
    </>
  );
}
