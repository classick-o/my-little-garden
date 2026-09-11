import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clase Tailwind, ultima castiga in caz de conflict. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
