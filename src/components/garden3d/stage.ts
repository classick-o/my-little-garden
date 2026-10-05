import * as THREE from "three";

/**
 * Locul din fata camerei in care urca planta selectata.
 *
 * Se recalculeaza la fiecare cadru dintr-un singur loc, fiindca depinde de
 * unde se uita camera. Stand in afara React, nu creeaza stare mutabila care sa
 * treaca prin randare - la fel ca ceasul vantului.
 */

/** Cat de departe de camera sta planta cand e in prim-plan. */
export const STAGE_DISTANCE = 3;

/**
 * Cat de jos fata de centrul ecranului sta baza plantei.
 *
 * Masurat pe axa verticala a CAMEREI, nu pe cea a lumii. Camera priveste in
 * jos, si se poate si roti - cu verticala lumii, planta ar aluneca pe ecran
 * de fiecare data cand utilizatorul schimba unghiul.
 */
const STAGE_OFFSET = -0.28;

export const stageTarget = new THREE.Vector3();

const forward = new THREE.Vector3();
const screenUp = new THREE.Vector3();

export function updateStageTarget(camera: THREE.Camera) {
  camera.getWorldDirection(forward);

  /* Axa Y locala a camerei: exact directia "sus" de pe ecran. */
  screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion);

  stageTarget
    .copy(camera.position)
    .addScaledVector(forward, STAGE_DISTANCE)
    .addScaledVector(screenUp, STAGE_OFFSET);
}
