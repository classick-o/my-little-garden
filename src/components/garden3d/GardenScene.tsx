"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { AIR_COLOR, Atmosphere } from "./Atmosphere";
import { SceneMessage } from "./CanvasGuard";
import { DistantBirds, PerchedBird } from "./Birds";
import { Butterflies } from "./Butterflies";
import { Decor } from "./Decor";
import { Island, ISLAND_HALF } from "./Island";
import { Islets } from "./Islets";
import { PanLimits } from "./PanLimits";
import { Petals } from "./Petals";
import { Plant } from "./Plant";
import { nearestPlot, place, PLOTS } from "./plots";
import { STAGE_DISTANCE, updateStageTarget } from "./stage";
import { tickWind } from "./wind";
import { World } from "./World";

/**
 * Gradina 3D - test vizual.
 *
 * O insula patrata care pluteste pe cer. Plantele stau in parcele si se pot
 * muta dintr-una in alta. O atingere scurta aduce planta in prim-plan.
 *
 * Camera e fixa: se poate doar apropia si departa. Rotirea libera scotea
 * gradina din cadru.
 *
 * Scena nu foloseste postprocesare. Lantul de randare in texturi al
 * EffectComposer dadea ecran negru - reprodus local, nu presupus - si era
 * oricum partea cea mai scumpa pe telefon. Vinieta e acum un strat CSS.
 */

type GardenPlant = {
  id: string;
  name: string;
  species: string;
  url: string;
  /** Parcela in care sta. Pozitia reala vine din PLOTS. */
  plot: number;
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
    plot: 0,
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
    plot: 2,
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
    plot: 4,
    height: 0.52,
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
    plot: 7,
    height: 0.88,
    rotation: -1,
    wind: 0.85,
    wateredDaysAgo: 1,
    daysOwned: 230,
  },
];

/** Decorul fix. Nu se poate muta si nu se poate selecta. */
const DECOR = [
  { url: "/garden3d/house.glb", position: [-1.95, 0, -2.25], height: 1.55, rotation: 0.35, wind: 0 },
  { url: "/garden3d/arch.glb", position: [0.55, 0, -2.5], height: 1.55, rotation: 0.02, wind: 0.1 },
  { url: "/garden3d/tree.glb", position: [2.25, 0, -2.15], height: 2.1, rotation: 0.4, wind: 0.45 },
  { url: "/garden3d/pine.glb", position: [-2.95, 0, -0.4], height: 1.8, rotation: -0.3, wind: 0.2 },
  { url: "/garden3d/pine.glb", position: [2.9, 0, 1.5], height: 1.4, rotation: 1.1, wind: 0.2 },
  { url: "/garden3d/watering-can.glb", position: [-2.5, 0, 1.35], height: 0.36, rotation: -0.6, wind: 0 },
  { url: "/garden3d/stones.glb", position: [2.35, 0, -0.5], height: 0.17, rotation: 0.4, wind: 0 },
  { url: "/garden3d/mushrooms.glb", position: [-2.4, 0, 2.5], height: 0.2, rotation: 2.2, wind: 0.25 },
  { url: "/garden3d/stones.glb", position: [1.44, 0, 2.08], height: 0.13, rotation: 2.9, wind: 0 },
  { url: "/garden3d/stones.glb", position: [2.86, 0, 1.08], height: 0.15, rotation: 1.2, wind: 0 },

  /* Florile sunt aici pentru culoare. Scena era aproape numai verde, iar
     verdele singur arata trist oricat de bine ar fi luminat. */
  { url: "/garden3d/roses.glb", position: [-3.0, 0, -1.35], height: 0.42, rotation: 0.6, wind: 0.3 },
  { url: "/garden3d/roses.glb", position: [-2.85, 0, 0.55], height: 0.36, rotation: 2.1, wind: 0.3 },
  { url: "/garden3d/roses.glb", position: [1.05, 0, -3.0], height: 0.4, rotation: 1.4, wind: 0.3 },
  { url: "/garden3d/tulips.glb", position: [2.75, 0, 0.35], height: 0.46, rotation: -0.4, wind: 0.5 },
  { url: "/garden3d/tulips.glb", position: [1.35, 0, 2.86], height: 0.4, rotation: 1.9, wind: 0.5 },
  { url: "/garden3d/tulips.glb", position: [-1.9, 0, 2.95], height: 0.38, rotation: 0.2, wind: 0.5 },
  { url: "/garden3d/sunflowers.glb", position: [-3.05, 0, 1.95], height: 0.8, rotation: 0.3, wind: 0.6 },
  { url: "/garden3d/sunflowers.glb", position: [3.0, 0, -1.55], height: 0.72, rotation: -0.9, wind: 0.6 },
] as const;

/** Gardul de pe marginea din fata, pus din segmente egale. */
const FENCE_HEIGHT = 0.46;
const FENCE_STEP = 0.92;
const FENCE_POSTS = Array.from({ length: 7 }, (_, index) => ({
  x: (index - 3) * FENCE_STEP,
  z: ISLAND_HALF - 0.28,
}));

for (const plant of INITIAL_PLANTS) useGLTF.preload(plant.url);
for (const item of DECOR) useGLTF.preload(item.url);
useGLTF.preload("/garden3d/fence.glb");
useGLTF.preload("/garden3d/bird.glb");

/** Raza zonei care trebuie sa incapa in cadru la pornire. */
const CONTENT_RADIUS = 4.55;
const CAMERA_FOV = 42;

/* Unghiul din care se vede gradina. Nu se schimba niciodata. */
const CAMERA_DIRECTION = { x: 0.62, y: 0.72, z: 1 };

/**
 * Cat trebuie sa se miste degetul ca sa fie tragere, nu atingere.
 *
 * Masurat in pixeli de ecran, nu in unitati din lume. Varianta in unitati din
 * lume compara centrul parcelei cu punctul in care raza atinge solul - iar
 * degetul pus pe frunze trimite raza dincolo de ghiveci, deci orice atingere
 * trecea drept tragere si cardul nu se mai deschidea pe telefon.
 */
const DRAG_THRESHOLD = 10;

/** Distanta de la care gradina incape intreaga in cadru. */
function framingDistance(width: number, height: number): number {
  const aspect = width / Math.max(height, 1);
  const verticalFov = (CAMERA_FOV * Math.PI) / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

  /* Ne incadram dupa axa mai stramta: pe telefon e cea orizontala. */
  const narrowest = Math.min(verticalFov, horizontalFov);
  return (CONTENT_RADIUS / Math.tan(narrowest / 2)) * 1.02;
}

function framingPosition(distance: number): [number, number, number] {
  const { x, y, z } = CAMERA_DIRECTION;
  const length = Math.sqrt(x * x + y * y + z * z);

  return [(x / length) * distance, (y / length) * distance + 0.4, (z / length) * distance];
}

export function GardenScene() {
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  /* Unde se afla planta trasa acum, inainte sa fie asezata intr-o parcela. */
  const [dragPoint, setDragPoint] = useState<[number, number] | null>(null);
  /* Distanta de pornire si pozitia camerei merg impreuna: limitele de zoom se
     calculeaza din ea, nu din numere fixe. Pe un ecran ingust distanta creste,
     iar o limita fixa ar fi lasat camera in afara intervalului permis - caz in
     care controalele o mutau brusc si scena se stingea. */
  const [distance, setDistance] = useState(21);
  const cameraPosition = useMemo(() => framingPosition(distance), [distance]);

  const drag = useRef<{
    id: string;
    /* De unde a plecat degetul pe ecran: pragul se masoara fata de el. */
    pointerX: number;
    pointerY: number;
    startX: number;
    startZ: number;
    moved: boolean;
    /* Distanta dintre planta si punctul de sub deget, fixata cand incepe
       tragerea. Fara ea, planta ar sari in punctul de sub deget. */
    grab: { x: number; z: number } | null;
  } | null>(null);

  const selected = plants.find((plant) => plant.id === selectedId) ?? null;

  /* Parcela spre care se indreapta planta trasa. */
  const targetPlot = useMemo(
    () => (dragPoint ? nearestPlot(dragPoint[0], dragPoint[1]) : null),
    [dragPoint],
  );

  useEffect(() => {
    const fit = () =>
      setDistance(framingDistance(window.innerWidth, window.innerHeight));

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

      if (info && !info.moved) {
        /* Degetul nu s-a miscat: a fost o atingere, deci deschidem cardul. */
        setSelectedId(info.id);
      } else if (info) {
        setPlants((previous) => place(previous, info.id, targetPlot));
      }

      drag.current = null;
      setDraggingId(null);
      setDragPoint(null);
    };

    /* Pragul se urmareste pe fereastra, nu pe insula: degetul poate iesi de
       pe ea, si atunci raza nu mai loveste nimic si nu mai vine niciun eveniment. */
    const track = (event: PointerEvent) => {
      const info = drag.current;
      if (!info || info.moved) return;

      const travelled = Math.hypot(
        event.clientX - info.pointerX,
        event.clientY - info.pointerY,
      );

      if (travelled > DRAG_THRESHOLD) info.moved = true;
    };

    window.addEventListener("pointermove", track);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);

    return () => {
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [draggingId, targetPlot]);

  const startDrag = useCallback(
    (plant: GardenPlant) => (event: ThreeEvent<PointerEvent>) => {
      if (selectedId) return;

      event.stopPropagation();

      const start = PLOTS[plant.plot];
      drag.current = {
        id: plant.id,
        pointerX: event.clientX,
        pointerY: event.clientY,
        startX: start.x,
        startZ: start.z,
        moved: false,
        grab: null,
      };

      setDraggingId(plant.id);
      setDragPoint([start.x, start.z]);
    },
    [selectedId],
  );

  const moveDragged = useCallback((point: THREE.Vector3) => {
    const info = drag.current;

    /* Pana cand degetul nu trece de prag, planta sta in parcela ei: altfel o
       atingere ar muta-o cu cativa centimetri si tot ar parea tragere. */
    if (!info || !info.moved) return;

    /* Prima trecere de prag fixeaza distanta dintre planta si deget. */
    if (!info.grab) {
      info.grab = { x: info.startX - point.x, z: info.startZ - point.z };
    }

    /* Nu lasam planta sa iasa de pe insula. */
    const limit = ISLAND_HALF - 0.6;
    const x = Math.min(Math.max(point.x + info.grab.x, -limit), limit);
    const z = Math.min(Math.max(point.z + info.grab.z, -limit), limit);

    setDragPoint([x, z]);
  }, []);

  return (
    <div className="relative h-dvh w-full touch-none select-none">
      <Canvas
        /* Plafon mai jos decat ecranele moderne: pe telefon, 3x pixeli plus
           umbre plus postprocesare duce la pierderea contextului grafic. */
        dpr={[1, 1.6]}
        shadows
        /* Fara powerPreference: pe unele placi mobile cererea asta face ca
           contextul grafic sa nu porneasca deloc. */
        gl={{ antialias: true }}
        /* Daca browserul nu poate porni WebGL, Canvas nu arunca nicio eroare -
           pur si simplu nu randeaza. Fara mesajul asta, utilizatorul vede un
           ecran gol si nu afla niciodata de ce. */
        fallback={
          <SceneMessage
            title="Gradina 3D nu poate porni"
            detail="Browserul nu a putut porni randarea 3D (WebGL). Incearca sa inchizi alte file sau sa redeschizi pagina."
          />
        }
        onPointerMissed={() => setSelectedId(null)}
      >
        <PerspectiveCamera makeDefault fov={CAMERA_FOV} position={cameraPosition} />

        <SceneClock />
        <World />
        <Atmosphere />
        <DistantBirds />
        <Petals />
        <Butterflies />

        <Suspense fallback={null}>
          <Islets />
          <Island highlightedPlot={targetPlot} onPointerMove={moveDragged} />

          {plants.map((plant) => {
            const dragging = draggingId === plant.id;
            const plot = PLOTS[plant.plot];

            return (
              <Plant
                key={plant.id}
                url={plant.url}
                position={
                  dragging && dragPoint
                    ? [dragPoint[0], 0, dragPoint[1]]
                    : [plot.x, 0, plot.z]
                }
                height={plant.height}
                rotation={plant.rotation}
                windStrength={plant.wind}
                showcase={selectedId === plant.id}
                dragging={dragging}
                onPointerDown={startDrag(plant)}
              />
            );
          })}

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

          {FENCE_POSTS.map((post, index) => (
            <Decor
              key={`fence-${index}`}
              url="/garden3d/fence.glb"
              position={[post.x, 0, post.z]}
              height={FENCE_HEIGHT}
            />
          ))}

          {/* Pasari cocotate: una pe gard, una langa casa. */}
          <PerchedBird position={[FENCE_STEP * -1, FENCE_HEIGHT, ISLAND_HALF - 0.28]} rotation={2.6} height={0.26} />
          <PerchedBird position={[-1.1, 0, -1.6]} rotation={-0.7} height={0.22} offset={3.4} />
        </Suspense>

        <Dimmer active={Boolean(selectedId)} />

        <OrbitControls
          makeDefault
          /* Unghiul ramane fix. Se poate doar apropia, departa si plimba. */
          enableRotate={false}
          enableZoom
          enablePan
          /* Deplasarea urmeaza solul, nu ecranul: altfel, la camera inclinata,
             o miscare in sus ar ridica privirea in cer in loc sa mearga inainte. */
          screenSpacePanning={false}
          enableDamping
          dampingFactor={0.1}
          zoomSpeed={0.6}
          panSpeed={0.9}
          enabled={!draggingId && !selectedId}
          /* Un deget plimba, doua apropie. Degetul pe o planta e prins de
             planta, deci cele doua nu se incurca. */
          touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          minDistance={distance * 0.4}
          /* Departarea maxima: destul cat sa se vada si insulitele si cerul
             din jur, nu doar gradina. Acolo nu mai are rost deplasarea si se
             blocheaza singura. */
          maxDistance={distance * 1.75}
          target={[0, 0.3, 0]}
        />

        <PanLimits fov={CAMERA_FOV} />
      </Canvas>

      {/* Vinieta, ca strat CSS peste panza.
          Varianta din postprocesare arata la fel, dar cerea un lant intreg de
          randare in texturi - pe telefon ducea la ecran negru. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_45%,transparent_45%,rgba(14,40,24,0.38)_100%)]"
      />

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
    paint.opacity += ((active ? 0.88 : 0) - paint.opacity) * ease;
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
      <planeGeometry args={[60, 60]} />
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
        <div className="glass inline-block rounded-2xl px-4 py-3 shadow-card">
          <p className="text-[11px] uppercase tracking-wide text-ink-subtle">
            Test vizual
          </p>
          <h1 className="mt-0.5 text-[1.7rem] leading-none">Gradina ta</h1>
          <p
            className={`mt-1.5 text-[12px] transition-colors duration-300 ${
              dragging ? "text-leaf" : "text-ink-muted"
            }`}
          >
            {dragging
              ? "Aseaz-o intr-o parcela"
              : "Trage o planta. Atinge-o ca sa o vezi."}
          </p>
        </div>
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
