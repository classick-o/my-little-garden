"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type * as THREE from "three";

import { ISLAND_HALF } from "./Island";

/**
 * Tine privirea in limitele gradinii.
 *
 * Ideea: cat de mult te poti plimba depinde de cat de aproape esti.
 *
 * - departat la maximum vezi toata insula, deci nu ai unde sa te plimbi -
 *   camera ramane blocata pe centru
 * - apropiat, vezi o bucata, deci poti muta fereastra - dar numai cat sa nu
 *   iasa din gradina
 *
 * Fara asta, deplasarea te-ar lasa sa pleci in cer si sa pierzi insula din
 * vedere, fara niciun fel de a te intoarce.
 *
 * Controalele se iau din scena, nu printr-o referinta primita ca proprietate:
 * `OrbitControls` are `makeDefault`, deci sunt deja aici, si asa nu modificam
 * o valoare pe care React o vede.
 */

/** Cat se poate privi dincolo de marginea insulei, ca sa nu para taiata. */
const EDGE_MARGIN = 0.5;

/** Inaltimea la care priveste camera. Nu se schimba la deplasare. */
const TARGET_HEIGHT = 0.3;

/** Partea din controale de care avem nevoie. */
type PannableControls = { target: THREE.Vector3 };

export function PanLimits({ fov }: { fov: number }) {
  const controls = useThree((state) => state.controls) as PannableControls | null;

  useFrame((state) => {
    const target = controls?.target;
    if (!target) return;

    const camera = state.camera as THREE.PerspectiveCamera;
    const distance = camera.position.distanceTo(target);

    /* Cat din lume incape pe ecran, masurat pe axa mai stramta - pe telefon
       cea orizontala. */
    const verticalFov = (fov * Math.PI) / 180;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
    const visibleHalf = distance * Math.tan(Math.min(verticalFov, horizontalFov) / 2);

    /* Daca vezi mai mult decat insula, nu ai unde sa te plimbi. */
    const allowed = Math.max(0, ISLAND_HALF + EDGE_MARGIN - visibleHalf);

    const clampedX = clamp(target.x, -allowed, allowed);
    const clampedZ = clamp(target.z, -allowed, allowed);

    const shiftX = clampedX - target.x;
    const shiftZ = clampedZ - target.z;
    const shiftY = TARGET_HEIGHT - target.y;

    if (shiftX === 0 && shiftZ === 0 && shiftY === 0) return;

    /* Mutam si camera cu aceeasi cantitate: altfel s-ar roti in loc sa se
       deplaseze, iar unghiul trebuie sa ramana fix. */
    camera.position.x += shiftX;
    camera.position.z += shiftZ;

    target.set(clampedX, TARGET_HEIGHT, clampedZ);
  });

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
