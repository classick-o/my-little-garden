/**
 * Generator pseudo-aleator cu samanta.
 *
 * Doua motive, amandoua practice:
 *
 * 1. `Math.random()` apelat in timpul randarii e impur - React Compiler il
 *    semnaleaza, pe buna dreptate.
 * 2. Cu samanta fixa, firele de iarba si polenul cad in aceleasi locuri la
 *    fiecare incarcare. Fara asta, gradina ar arata usor altfel de fiecare
 *    data, iar o captura de ecran nu s-ar putea compara cu urmatoarea.
 *
 * Algoritm: mulberry32. Scurt, rapid, suficient de bun pentru imprastiat
 * obiecte intr-o scena.
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;

    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
