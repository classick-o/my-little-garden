"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Comutator intre variantele de design.
 *
 * Exista doar pe ecranele de previzualizare, ca sa se poata compara direct de pe
 * telefon. Dispare odata cu folderul preview, dupa ce se alege o directie.
 */

const VARIANTS = [
  { href: "/preview/light", label: "Luminos" },
  { href: "/preview/dark", label: "Intunecat" },
] as const;

export function VariantSwitcher() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="flex items-center gap-1 rounded-full bg-black/75 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        {VARIANTS.map((variant) => {
          const active = pathname === variant.href;

          return (
            <Link
              key={variant.href}
              href={variant.href}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                active ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {variant.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
