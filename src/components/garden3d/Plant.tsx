"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { applyWind } from "./wind";
import { stageTarget } from "./stage";

/**
 * O planta in gradina.
 *
 * Pozitia nu e pusa direct pe grup, ci urmarita lin la fiecare cadru. Asa
 * aceeasi logica acopera si tragerea cu degetul, si urcarea in prim-plan cand
 * e deschis cardul - fara doua sisteme de animatie separate.
 */

/** Inaltimea la care apare orice planta cand e in prim-plan. */
const SHOWCASE_HEIGHT = 0.88;

export type PlantProps = {
  url: string;
  position: [number, number, number];
  /** Inaltimea dorita in gradina, in unitati de lume. */
  height: number;
  rotation?: number;
  /** Cat de tare o misca vantul. Plantele rigide primesc valori mici. */
  windStrength?: number;
  /** 0 = abia plantata, 1 = crescuta complet. In aplicatie vine din date reale. */
  growth?: number;
  /** In prim-plan, cu cardul deschis. */
  showcase?: boolean;
  dragging?: boolean;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
};

export function Plant({
  url,
  position,
  height,
  rotation = 0,
  windStrength = 1,
  growth = 1,
  showcase = false,
  dragging = false,
  onPointerDown,
}: PlantProps) {
  const { scene } = useGLTF(url);

  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

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

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;

    /* Factor independent de rata de cadre: pe un telefon lent animatia merge
       la fel de repede ca pe desktop. */
    const ease = 1 - Math.pow(0.0001, delta);

    if (showcase) {
      group.position.lerp(stageTarget, ease);

      const target = SHOWCASE_HEIGHT / height;
      group.scale.lerp(new THREE.Vector3(target, target, target), ease);

      /* Se roteste incet, ca un obiect pe care il intorci in mana. */
      if (spin.current) spin.current.rotation.y += delta * 0.35;
    } else {
      /* Cand e trasa cu degetul, urmareste mai aproape de instantaneu. */
      const follow = dragging ? 1 - Math.pow(0.000000001, delta) : ease;
      group.position.lerp(
        new THREE.Vector3(position[0], position[1], position[2]),
        follow,
      );

      group.scale.lerp(new THREE.Vector3(growth, growth, growth), ease);

      if (spin.current) {
        /* Se intoarce lin la orientarea ei din gradina. */
        spin.current.rotation.y += (rotation - spin.current.rotation.y) * ease;
      }

      /* Cat e trasa, se ridica putin de la sol - se vede ca e "in mana".
         Numai in gradina: in prim-plan ar trage-o inapoi spre pamant. */
      const lift = dragging ? 0.12 : 0;
      group.position.y += (position[1] + lift - group.position.y) * ease * 0.6;
    }
  });

  return (
    <group ref={root} position={position} onPointerDown={onPointerDown}>
      <group ref={spin} rotation-y={rotation}>
        <group scale={scale} position-y={offsetY}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}
