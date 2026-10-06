import * as THREE from "three";

/**
 * Cum se incadreaza gradina in ecran.
 *
 * Stau aici, nu in scena, fiindca le foloseste si fundalul: panza pictata din
 * spate trebuie sa stea perpendicular pe privire, iar pentru asta are nevoie
 * de aceeasi directie din care se uita camera.
 */

/** Raza zonei care trebuie sa incapa in cadru la pornire. */
export const CONTENT_RADIUS = 4.55;

export const CAMERA_FOV = 42;

/**
 * Unghiul din care se vede gradina. Nu se schimba niciodata - rotirea libera
 * scotea insula din cadru.
 *
 * Nu se modifica de nimeni: e o constanta, chiar daca tipul permite scrierea.
 */
export const VIEW_DIRECTION = new THREE.Vector3(0.62, 0.72, 1).normalize();

/** Distanta de la care gradina incape intreaga in cadru. */
export function framingDistance(width: number, height: number): number {
  const aspect = width / Math.max(height, 1);
  const verticalFov = (CAMERA_FOV * Math.PI) / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

  /* Ne incadram dupa axa mai stramta: pe telefon e cea orizontala. */
  const narrowest = Math.min(verticalFov, horizontalFov);
  return (CONTENT_RADIUS / Math.tan(narrowest / 2)) * 1.02;
}

export function framingPosition(distance: number): [number, number, number] {
  return [
    VIEW_DIRECTION.x * distance,
    VIEW_DIRECTION.y * distance + 0.4,
    VIEW_DIRECTION.z * distance,
  ];
}
