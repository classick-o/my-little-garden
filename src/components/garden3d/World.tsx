"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { VIEW_DIRECTION } from "./camera";
import { seededRandom } from "./random";

/**
 * Lumea din jurul insulei: cer, soare si nori.
 *
 * Totul aici e decor pur - nu se poate atinge, nu arunca umbre, nu participa
 * la nimic. Exista ca insula sa pluteasca undeva, nu intr-un gol.
 */

/** Cerul, de sus in jos. */
const SKY_TOP = "#5fa8dd";
const SKY_HORIZON = "#cfe9f2";

/** Ceata are culoarea orizontului, altfel departarile taie brusc. */
export const HAZE_COLOR = "#cfe9f2";

/** Raza cupolei. Trebuie sa cuprinda si colturile panzei din fundal. */
const SKY_RADIUS = 150;

export function World() {
  return (
    <>
      <SkyDome />
      <Sun />
      <Valley />
      <Clouds />
    </>
  );
}

/** Cat de departe, in spatele insulei, sta valea pictata. */
const VALLEY_DISTANCE = 42;

/** Cat de lata e panza. Trebuie sa umple cadrul si la departarea maxima. */
const VALLEY_SIZE = 78;

/**
 * Valea de dedesubt.
 *
 * O singura imagine pictata, asezata perpendicular pe privire - ca o panza de
 * fundal din film. Imaginea are perspectiva ei, cu linia orizontului inauntru;
 * intinsa pe un plan orizontal, ca un teren adevarat, perspectiva ei s-ar
 * aduna peste cea a camerei si valea s-ar culca.
 *
 * Merge pentru ca unghiul camerei nu se schimba niciodata. Deplasarea si
 * apropierea o misca mai putin decat insula, fiind mult mai departe, si tocmai
 * de asta se citeste ca departare.
 */
function Valley() {
  const texture = useTexture("/garden3d/textures/valley.webp");

  const { position, quaternion } = useMemo(() => {
    /* In spatele insulei fata de camera, deci si mai jos: privirea vine de sus. */
    const position = VIEW_DIRECTION.clone().multiplyScalar(-VALLEY_DISTANCE);

    /* Normala planului e +Z. O intoarcem spre camera. */
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      VIEW_DIRECTION,
    );

    return { position, quaternion };
  }, []);

  /* Ceata o aplicam singuri, ca sa controlam si marginile. Ceata scenei ar fi
     inecat-o uniform, si tot s-ar fi vazut unde se termina panza. */
  const fade = useCallback(
    (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uHaze = { value: new THREE.Color(HAZE_COLOR) };

      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vFade;")
        .replace("#include <uv_vertex>", "#include <uv_vertex>\nvFade = uv;");

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform vec3 uHaze;\nvarying vec2 vFade;",
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
           /* Panza e mai lata decat ecranul, ca sa nu i se vada marginile. Din
              ea se foloseste doar partea de jos: sus se face transparenta si
              ramane cerul. Vopsita in culoarea cetii in loc sa se stearga, ar
              fi acoperit cupola cu o pata plata si albastrul ar fi disparut.
              Pragurile sunt in coordonatele panzei; pe ecran se vede banda
              dintre 0.12 si 0.89, restul cade in afara cadrului. */
           float vanish = max(
             smoothstep(0.44, 0.74, vFade.y),
             smoothstep(0.66, 0.92, abs(vFade.x - 0.5) * 2.0)
           );

           /* Putina ceata peste tot, ca valea sa stea in departare. */
           diffuseColor.rgb = mix(diffuseColor.rgb, uHaze, 0.2 + 0.5 * vanish);
           diffuseColor.a *= 1.0 - vanish;`,
        );
    },
    [],
  );

  return (
    <mesh position={position} quaternion={quaternion}>
      <planeGeometry args={[VALLEY_SIZE, VALLEY_SIZE]} />
      <meshBasicMaterial
        map={texture}
        /* Ceata scenei e deja cuprinsa in amestecul de mai sus. */
        fog={false}
        transparent
        depthWrite={false}
        onBeforeCompile={fade}
      />
    </mesh>
  );
}

/**
 * Cupola de cer.
 *
 * Un gradient pe o sfera intoarsa pe dos. Mai ieftin decat o imagine de fundal
 * si nu se pixeleaza niciodata, oricat de aproape ar ajunge camera.
 */
function SkyDome() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(SKY_TOP) },
      uHorizon: { value: new THREE.Color(SKY_HORIZON) },
    }),
    [],
  );

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[SKY_RADIUS, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        depthWrite={false}
        side={THREE.BackSide}
        vertexShader={/* glsl */ `
          varying vec3 vWorld;
          void main() {
            vWorld = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uHorizon;
          varying vec3 vWorld;

          void main() {
            /* Inaltimea pe cupola, luata din directie, nu din pozitie: asa nu
               depinde de raza. Legat de raza, gradientul s-a stins cu totul
               cand cupola a fost marita ca sa cuprinda panza din fundal. */
            float h = normalize(vWorld).y * 0.5 + 0.5;
            float t = smoothstep(0.42, 0.95, h);
            gl_FragColor = vec4(mix(uHorizon, uTop, t), 1.0);
          }
        `}
      />
    </mesh>
  );
}

/** Soarele: un disc moale, sus in spate. Nu lumineaza, doar se vede. */
function Sun() {
  return (
    <group position={[-14, 11, -34]}>
      <mesh>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color="#fff6d8" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[6.5, 48]} />
        <meshBasicMaterial color="#ffe9a8" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[13, 48]} />
        <meshBasicMaterial color="#ffeec0" transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Cati nori plutesc in jur. */
const CLOUD_COUNT = 18;

type CloudSeed = {
  position: [number, number, number];
  scale: number;
  speed: number;
  opacity: number;
};

/**
 * Norii.
 *
 * Panouri care se intorc mereu spre camera. Plutesc lent si, cand ies prea
 * departe intr-o parte, reapar in cealalta - asa nu se termina niciodata.
 *
 * Stau toti in spatele insulei. Asezati pe un cerc in jurul ei, unii treceau
 * prin fata, iar apropiat se vedea muchia dreapta a panoului taind gradina -
 * textura nu se stinge la margine, iar de departe asta nu se observa.
 */
function Clouds() {
  const texture = useTexture("/garden3d/textures/cloud.png");
  const group = useRef<THREE.Group>(null);

  const seeds = useMemo<CloudSeed[]>(() => {
    const random = seededRandom(99);

    return Array.from({ length: CLOUD_COUNT }, () => {
      return {
        position: [
          (random() - 0.5) * 46,
          -6 + random() * 10,
          /* Mereu in spate, si destul de departe cat sa nu ajunga langa
             camera nici la apropierea maxima. */
          -(11 + random() * 17),
        ] as [number, number, number],
        scale: 4 + random() * 7,
        speed: 0.12 + random() * 0.2,
        opacity: 0.55 + random() * 0.35,
      };
    });
  }, []);

  useFrame((_, delta) => {
    const clouds = group.current;
    if (!clouds) return;

    for (const cloud of clouds.children) {
      cloud.position.x += delta * 0.25;

      /* Reintra pe partea cealalta cand a trecut de margine. */
      if (cloud.position.x > 28) cloud.position.x = -28;
    }
  });

  return (
    <group ref={group}>
      {seeds.map((seed, index) => (
        <sprite
          key={index}
          position={seed.position}
          scale={[seed.scale, seed.scale * 0.58, 1]}
        >
          <spriteMaterial
            map={texture}
            transparent
            opacity={seed.opacity}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

