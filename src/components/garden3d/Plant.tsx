"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { applyWind } from "./wind";

/**
 * O planta in gradina 3D.
 *
 * Modelul vine normalizat: indiferent ce dimensiuni are fisierul, il scalam la
 * inaltimea ceruta si il asezam cu baza exact pe sol. Modelele generate ies la
 * scari arbitrare, deci asta nu e optional.
 *
 * Impartirea muncii nu e intamplatoare: in `useMemo` stau doar calcule pure,
 * iar modificarile asupra obiectelor Three.js stau in `useEffect`. Altfel
 * React Compiler se plange, pe buna dreptate - obiectele Three sunt mutabile
 * si traiesc in afara modelului React.
 */

export type PlantProps = {
  url: string;
  position: [number, number, number];
  /** Inaltimea dorita in scena, in unitati de lume. */
  height: number;
  rotation?: number;
  /** Cat de tare o misca vantul. Plantele rigide primesc valori mici. */
  windStrength?: number;
  /** 0 = abia plantata, 1 = crescuta complet. In aplicatie vine din date reale. */
  growth?: number;
  selected?: boolean;
  onSelect?: () => void;
};

export function Plant({
  url,
  position,
  height,
  rotation = 0,
  windStrength = 1,
  growth = 1,
  selected = false,
  onSelect,
}: PlantProps) {
  const { scene } = useGLTF(url);

  const liftRef = useRef<THREE.Group>(null);

  /* Fiecare planta are nevoie de propria copie: altfel ar imparti materialele
     cu celelalte si vantul le-ar misca pe toate la fel. */
  const { model, scale, offsetY } = useMemo(() => {
    const model = scene.clone(true);

    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bounds.getSize(size);

    /* Scalam dupa inaltimea reala a modelului, nu dupa o valoare presupusa. */
    const scale = height / Math.max(size.y, 0.0001);

    /* Si il coboram astfel incat baza sa atinga solul. */
    return { model, scale, offsetY: -bounds.min.y * scale };
  }, [scene, height]);

  /* Materialele si vantul: mutatii, deci efect, nu calcul de randare. */
  useEffect(() => {
    /* Faza decaleaza miscarea fiecarei plante. Fara ea toata gradina se
       leagana sincronizat si arata mecanic. */
    const phase = Math.random() * Math.PI * 2;

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = true;
      child.receiveShadow = true;

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

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    /* Planta selectata se ridica usor si pluteste - semnalul ca e aleasa,
       fara sa adaugam un contur strident. */
    const lift = liftRef.current;
    if (lift) {
      const target = selected ? 0.09 + Math.sin(time * 2) * 0.015 : 0;
      lift.position.y += (target - lift.position.y) * 0.12;
    }
  });

  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
    >
      <group ref={liftRef}>
        <group scale={growth}>
          <group scale={scale} position-y={offsetY}>
            <primitive object={model} />
          </group>
        </group>
      </group>
    </group>
  );
}
