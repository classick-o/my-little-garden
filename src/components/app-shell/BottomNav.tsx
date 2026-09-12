"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Leaf, NotebookPen, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Navigatia principala (first-context.md sectiunea 11).
 * Rutele sunt in engleza, etichetele in romana - vezi CLAUDE.md sectiunea 2.
 */
const TABS = [
  { href: "/", label: "Gradina", icon: Leaf },
  { href: "/discover", label: "Descopera", icon: Compass },
  { href: "/journal", label: "Jurnal", icon: NotebookPen },
  { href: "/assistant", label: "Asistent", icon: Sparkles },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigare principala"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas-deep/70 backdrop-blur-2xl"
    >
      <div className="content-width grid grid-cols-5 items-end px-2">
        {TABS.slice(0, 2).map((tab) => (
          <NavItem key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
        ))}

        <AddPlantButton />

        {TABS.slice(2).map((tab) => (
          <NavItem key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
        ))}
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
};

function NavItem({ href, label, icon: Icon, active }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-16 flex-col items-center justify-center gap-1 rounded-lg",
        "transition-colors duration-(--duration-quick)",
        active ? "text-leaf" : "text-ink-subtle hover:text-ink-muted",
      )}
    >
      <Icon className="size-6" strokeWidth={active ? 2.1 : 1.7} />
      <span className={cn("text-[11px]", active && "font-medium")}>{label}</span>
    </Link>
  );
}

/** Actiunea principala, centrata (first-context.md sectiunea 11). */
function AddPlantButton() {
  return (
    <div className="flex h-16 items-center justify-center">
      <Link
        href="/plants/new"
        aria-label="Adauga o planta"
        className={cn(
          "flex size-14 -translate-y-3 items-center justify-center rounded-full",
          "bg-leaf text-ink-inverse shadow-raised",
          "transition-transform duration-(--duration-quick) ease-(--ease-spring)",
          "hover:bg-leaf-deep active:scale-95",
        )}
      >
        <Plus className="size-7" strokeWidth={2.2} />
      </Link>
    </div>
  );
}
