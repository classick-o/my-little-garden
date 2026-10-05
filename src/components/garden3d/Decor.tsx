"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { applyWind } from "./wind";

/**
 * Obiect decorativ: pietre, ciuperci, stropitoare.
 *
 * Nu se poate selecta si nu se poate muta - exista doar ca gradina sa nu para
 * un raft cu plante asezate la distante egale.
 */
export function Decor({
  url,
  position,
  height,
  rotation = 0,
  /* Ciupercile se clatina un pic; pietrele, deloc. */
  windStrength = 0,
}: {
  url: string;
  position: [number, number, number];
  height: number;
  rotation?: number;
  windStrength?: number;
}) {
  const { scene } = useGLTF(url);

  const { model, scale, offsetY } = useMemo(() => {
    const model = scene.clone(true);

    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bounds.getSize(size);

    const scale = height / Math.max(size.y, 0.0001);

    return { model, scale, offsetY: -bounds.min.y * scale };
  }, [scene, height]);

  useEffect(() => {
    const phase = Math.random() * Math.PI * 2;

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (windStrength <= 0) return;

      child.geometry.computeBoundingBox();
      const box = child.geometry.boundingBox;
      if (!box) return;

      const material = (child.material as THREE.Material).clone();
      applyWind(material, {
        minY: box.min.y,
        maxY: box.max.y,
        strength: windStrength,
        phase,
      });
      child.material = material;
    });
  }, [model, windStrength]);

  return (
    <group position={position} rotation-y={rotation}>
      <group scale={scale} position-y={offsetY}>
        <primitive object={model} />
      </group>
    </group>
  );
}
