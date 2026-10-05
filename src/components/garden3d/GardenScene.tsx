"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

import { AIR_COLOR, Atmosphere } from "./Atmosphere";
import { Decor } from "./Decor";
import { Island, ISLAND_RADIUS } from "./Island";
import { Plant } from "./Plant";
import { STAGE_DISTANCE, updateStageTarget } from "./stage";
import { tickWind } from "./wind";

/**
 * Gradina 3D - test vizual.
 *
 * Plantele se pot muta cu degetul. O atingere scurta le aduce in prim-plan,
 * unde restul gradinii se stinge in spate.
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
  daysOwned: number;
};

const INITIAL_PLANTS: GardenPlant[] = [
  {
    id: "luna",
    name: "Luna",
    species: "Monstera deliciosa",
    url: "/garden3d/monstera.glb",
    position: [-0.78, 0, 0.42],
    height: 1.3,
    rotation: 0.3,
    wind: 1,
    wateredDaysAgo: 3,
    daysOwned: 184,
  },
  {
    id: "stela",
    name: "Stela",
    species: "Sansevieria trifasciata",
    url: "/garden3d/sansevieria.glb",
    position: [0.86, 0, -0.44],
    height: 1.15,
    rotation: -0.45,
    wind: 0.3,
    wateredDaysAgo: 11,
    daysOwned: 92,
  },
  {
    id: "pufi",
    name: "Pufi",
    species: "Echeveria elegans",
    url: "/garden3d/echeveria.glb",
    position: [-0.5, 0, -0.86],
    height: 0.55,
    rotation: 0.9,
    wind: 0.12,
    wateredDaysAgo: 6,
    daysOwned: 41,
  },
  {
    id: "iedera",
    name: "Iedera",
    species: "Epipremnum aureum",
    url: "/garden3d/pothos.glb",
    position: [0.62, 0, 0.82],
    height: 0.9,
    rotation: -1,
    wind: 0.85,
    wateredDaysAgo: 1,
    daysOwned: 230,
  },
];

const DECOR = [
  { url: "/garden3d/watering-can.glb", position: [1.18, 0, 0.62], height: 0.36, rotation: -0.6, wind: 0 },
  { url: "/garden3d/stones.glb", position: [-1.22, 0, -0.32], height: 0.17, rotation: 0.4, wind: 0 },
  { url: "/garden3d/mushrooms.glb", position: [0.08, 0, 1.24], height: 0.2, rotation: 2.2, wind: 0.25 },
  { url: "/garden3d/stones.glb", position: [0.44, 0, -1.18], height: 0.11, rotation: 2.9, wind: 0 },
] as const;

for (const plant of INITIAL_PLANTS) useGLTF.preload(plant.url);
for (const item of DECOR) useGLTF.preload(item.url);

/** Raza zonei care trebuie sa incapa mereu in cadru. */
const CONTENT_RADIUS = 1.88;
const CAMERA_FOV = 42;

/* Directia din care privim gradina. Ramane aceeasi pe orice ecran - se schimba
   doar cat de departe sta camera. */
const CAMERA_DIRECTION = { x: 1, y: 0.8, z: 1 };

/** Cat de aproape de margine poate fi trasa o planta. */
const DRAG_LIMIT = ISLAND_RADIUS - 0.42;

/** Cat trebuie sa se miste degetul ca sa fie tragere, nu atingere. */
const DRAG_THRESHOLD = 0.07;

function framingPosition(width: number, height: number): [number, number, number] {
  const aspect = width / Math.max(height, 1);
  const verticalFov = (CAMERA_FOV * Math.PI) / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

  /* Ne incadram dupa axa mai stramta: pe telefon e cea orizontala. */
  const narrowest = Math.min(verticalFov, horizontalFov);
  const distance = (CONTENT_RADIUS / Math.tan(narrowest / 2)) * 1.0;

  const { x, y, z } = CAMERA_DIRECTION;
  const length = Math.sqrt(x * x + y * y + z * z);

  return [(x / length) * distance, (y / length) * distance + 0.35, (z / length) * distance];
}

export function GardenScene() {
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([
    5.3, 4.6, 5.3,
  ]);

  /* Informatia de tragere nu intra in stare: se schimba la fiecare miscare de
     deget si ar redesena scena degeaba. */
  const drag = useRef<{
    id: string;
    startX: number;
    startZ: number;
    moved: boolean;
  } | null>(null);

  const selected = plants.find((plant) => plant.id === selectedId) ?? null;

  useEffect(() => {
    const fit = () =>
      setCameraPosition(framingPosition(window.innerWidth, window.innerHeight));

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  /* Ridicarea degetului se poate intampla si in afara panzei, deci ascultam pe
     fereastra, nu pe obiectul 3D. */
  useEffect(() => {
    if (!draggingId) return;

    const finish = () => {
      const info = drag.current;

      /* Degetul nu s-a miscat: a fost o atingere, deci deschidem cardul. */
      if (info && !info.moved) setSelectedId(info.id);

      drag.current = null;
      setDraggingId(null);
    };

    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);

    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [draggingId]);

  const startDrag = useCallback(
    (plant: GardenPlant) => (event: ThreeEvent<PointerEvent>) => {
      if (selectedId) return;

      event.stopPropagation();
      drag.current = {
        id: plant.id,
        startX: plant.position[0],
        startZ: plant.position[2],
        moved: false,
      };
      setDraggingId(plant.id);
    },
    [selectedId],
  );

  const moveDragged = useCallback((point: THREE.Vector3) => {
    const info = drag.current;
    if (!info) return;

    /* Nu lasam planta sa iasa de pe insula. */
    const distance = Math.hypot(point.x, point.z);
    const factor = distance > DRAG_LIMIT ? DRAG_LIMIT / distance : 1;
    const x = point.x * factor;
    const z = point.z * factor;

    if (Math.hypot(x - info.startX, z - info.startZ) > DRAG_THRESHOLD) {
      info.moved = true;
    }

    setPlants((previous) =>
      previous.map((plant) =>
        plant.id === info.id ? { ...plant, position: [x, 0, z] } : plant,
      ),
    );
  }, []);

  return (
    <div className="relative h-dvh w-full touch-none select-none">
      <Canvas
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <color attach="background" args={[AIR_COLOR]} />
        <PerspectiveCamera makeDefault fov={CAMERA_FOV} position={cameraPosition} />

        <SceneClock />
        <Atmosphere />

        <Suspense fallback={null}>
          <Island onPointerMove={moveDragged} />

          {plants.map((plant) => (
            <Plant
              key={plant.id}
              url={plant.url}
              position={plant.position}
              height={plant.height}
              rotation={plant.rotation}
              windStrength={plant.wind}
              showcase={selectedId === plant.id}
              dragging={draggingId === plant.id}
              onPointerDown={startDrag(plant)}
            />
          ))}

          {DECOR.map((item, index) => (
            <Decor
              key={`${item.url}-${index}`}
              url={item.url}
              position={item.position as [number, number, number]}
              height={item.height}
              rotation={item.rotation}
              windStrength={item.wind}
            />
          ))}
        </Suspense>

        <Dimmer active={Boolean(selectedId)} />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          /* Blocata cat timp tragi o planta sau e un card deschis. */
          enabled={!draggingId && !selectedId}
          minDistance={3.5}
          maxDistance={16}
          /* Camera nu coboara sub orizont si nu urca in varful capului:
             gradina ramane vazuta din aceeasi parte. */
          minPolarAngle={0.55}
          maxPolarAngle={1.32}
          target={[0, 0.4, 0]}
        />

        <EffectComposer>
          {/* Doar varfurile luminoase stralucesc: polenul si marginile atinse
              de soare. Prea mult si scena se spala. */}
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.72}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
          <Vignette offset={0.32} darkness={0.45} />
        </EffectComposer>
      </Canvas>

      <Overlay
        selected={selected}
        dragging={Boolean(draggingId)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

/** Avanseaza vantul si recalculeaza locul din prim-plan, o data pe cadru. */
function SceneClock() {
  const camera = useThree((state) => state.camera);

  useFrame((state) => {
    tickWind(state.clock.elapsedTime);
    updateStageTarget(camera);
  });

  return null;
}

/**
 * Valul care stinge gradina cand o planta urca in prim-plan.
 *
 * Sta intre gradina si planta aleasa, nu peste tot ecranul: planta ramane
 * limpede, restul se retrage in ceata. Un strat HTML cu blur ar fi incetosat
 * si planta.
 */
function Dimmer({ active }: { active: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const camera = useThree((state) => state.camera);

  /* Reutilizat la fiecare cadru, ca sa nu alocam un vector de 60 de ori pe secunda. */
  const forward = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const plane = mesh.current;
    const paint = material.current;
    if (!plane || !paint) return;

    const ease = 1 - Math.pow(0.004, delta);
    paint.opacity += ((active ? 0.9 : 0) - paint.opacity) * ease;
    plane.visible = paint.opacity > 0.01;

    if (!plane.visible) return;

    /* Important: putin mai DEPARTE de camera decat planta din prim-plan.
       Daca ajunge in fata ei, o acopera si nu se mai vede nimic. */
    camera.getWorldDirection(forward);
    plane.position
      .copy(camera.position)
      .addScaledVector(forward, STAGE_DISTANCE + 0.75);
    plane.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh ref={mesh} visible={false} renderOrder={1}>
      <planeGeometry args={[24, 24]} />
      <meshBasicMaterial
        ref={material}
        color={AIR_COLOR}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

type OverlayProps = {
  selected: GardenPlant | null;
  dragging: boolean;
  onClose: () => void;
};

function Overlay({ selected, dragging, onClose }: OverlayProps) {
  const open = Boolean(selected);

  return (
    <>
      {/* Antetul se retrage cand se deschide cardul. */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 p-5 pt-[max(env(safe-area-inset-top),1.25rem)] transition-all duration-500 ${
          open ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <p className="text-sm text-ink-subtle">Test vizual</p>
        <h1 className="mt-1 text-[1.9rem]">Gradina ta</h1>
        <p
          className={`mt-1 text-[13px] transition-colors duration-300 ${
            dragging ? "text-leaf" : "text-ink-muted"
          }`}
        >
          {dragging ? "Aseaz-o unde vrei" : "Trage o planta. Atinge-o ca sa o vezi."}
        </p>
      </div>

      {/* Cardul plantei. */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 pb-[max(env(safe-area-inset-bottom),1rem)] transition-all duration-500 ease-(--ease-out-soft) ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
      >
        <article className="glass mx-auto max-w-sm rounded-2xl p-5 shadow-float">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[1.6rem] leading-tight">{selected?.name ?? ""}</h2>
              <p className="text-[13px] text-ink-muted">{selected?.species ?? ""}</p>
            </div>

            <button
              onClick={onClose}
              aria-label="Inchide"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink-muted ring-1 ring-line transition-colors hover:text-ink"
            >
              &#10005;
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <Stat
              label="Udata"
              value={`acum ${selected?.wateredDaysAgo ?? 0} zile`}
              tone="water"
            />
            <Stat label="Impreuna" value={`${selected?.daysOwned ?? 0} zile`} tone="leaf" />
          </div>

          <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-leaf text-[14px] font-semibold text-ink-inverse transition-transform duration-200 active:scale-[0.98]">
            Uda planta
          </button>
        </article>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "water" | "leaf";
}) {
  return (
    <div className="flex-1 rounded-xl bg-surface-sunken p-3">
      <p className="text-[11px] text-ink-subtle">{label}</p>
      <p className={`mt-0.5 text-[13px] ${tone === "water" ? "text-water" : "text-leaf"}`}>
        {value}
      </p>
    </div>
  );
}
