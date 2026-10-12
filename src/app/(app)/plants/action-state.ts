/**
 * Starea intoarsa de actiunile asupra plantelor.
 *
 * Sta separat de `actions.ts` pentru ca un fisier marcat `"use server"` are
 * voie sa exporte numai functii asincrone. O constanta exportata de acolo
 * opreste build-ul, si mesajul nu spune care anume e de vina.
 */
export type ActionState = { error: string | null };

export const OK: ActionState = { error: null };
