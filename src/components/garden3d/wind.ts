import * as THREE from "three";

/**
 * Vant in frunze, facut in vertex shader.
 *
 * Modelele generate nu au schelet, deci nu putem anima frunze individual.
 * Solutia: deplasam varfurile mesh-ului cu atat mai mult cu cat sunt mai sus
 * fata de baza obiectului. Ghiveciul sta pe loc, frunzele se leagana.
 *
 * Merge pe orice model, indiferent de forma lui, fiindca inaltimea se citeste
 * din bounding box la rulare.
 */

/**
 * Ceasul comun al vantului.
 *
 * Timpul e acelasi pentru toata gradina, deci toate materialele arata catre
 * acest singur obiect. Avem o scriere pe cadru in loc de una pentru fiecare
 * mesh, si nicio stare mutabila care sa treaca prin React.
 */
export const windClock = { value: 0 };

/** De apelat o data pe cadru, dintr-un singur loc. */
export function tickWind(elapsedSeconds: number) {
  windClock.value = elapsedSeconds;
}

/** Valorile fixe ale unui material: se scriu o data, la montare. */
export type WindSettings = {
  /** Baza obiectului, in coordonatele mesh-ului. */
  minY: number;
  /** Varful obiectului. */
  maxY: number;
  /** Cat de tare il misca vantul. */
  strength: number;
  /** Decalaj, ca plantele sa nu se legene sincronizat. */
  phase: number;
};

/**
 * Altoieste miscarea peste materialul existent, fara sa ii strice textura.
 *
 * `onBeforeCompile` ne lasa sa injectam cod in shaderul generat de Three,
 * deci pastram materialul original cu tot cu textura venita din model.
 */
export function applyWind(material: THREE.Material, settings: WindSettings) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windClock;
    shader.uniforms.uMinY = { value: settings.minY };
    shader.uniforms.uMaxY = { value: settings.maxY };
    shader.uniforms.uStrength = { value: settings.strength };
    shader.uniforms.uPhase = { value: settings.phase };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `
          #include <common>
          uniform float uTime;
          uniform float uMinY;
          uniform float uMaxY;
          uniform float uStrength;
          uniform float uPhase;
        `,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
          #include <begin_vertex>

          // 0 la baza ghiveciului, 1 in varful plantei.
          float heightRatio = clamp(
            (transformed.y - uMinY) / max(uMaxY - uMinY, 0.0001),
            0.0,
            1.0
          );

          // Patratul face ca ghiveciul sa stea aproape nemiscat, iar varfurile
          // sa se legene vizibil. Miscarea liniara arata ca un obiect care
          // aluneca, nu ca o planta.
          float sway = heightRatio * heightRatio;

          // Doua frecvente usor diferite: miscarea nu se repeta vizibil.
          float t = uTime + uPhase;
          transformed.x += sin(t * 1.1 + transformed.y * 1.8) * 0.030 * sway * uStrength;
          transformed.z += sin(t * 0.8 + transformed.x * 2.2) * 0.022 * sway * uStrength;

          // Rafala lenta care trece peste toata gradina din cand in cand.
          float gust = sin(uTime * 0.23) * 0.5 + 0.5;
          transformed.x += sin(t * 2.3) * 0.012 * sway * uStrength * gust;
        `,
      );
  };

  material.needsUpdate = true;
}
