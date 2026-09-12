import Image from "next/image";
import { Bell, Droplets, Leaf, Plus, ScanLine, Search, Sun } from "lucide-react";

import { ProgressRing } from "@/components/preview/ProgressRing";
import { VariantSwitcher } from "@/components/preview/VariantSwitcher";

/**
 * PREVIZUALIZARE - nu face parte din aplicatie.
 *
 * Aceeasi structura ca varianta intunecata - card mare cu poza, inele de
 * progres, butoane pastila - dar pe paleta calda si luminoasa din
 * first-context.md sectiunile 6 si 7.
 *
 * Diferenta importanta: poza nu are nevoie de un val intunecat peste ea.
 * Textul sta dedesubt, pe alb, deci fotografia isi pastreaza lumina.
 */

export const metadata = { title: "Previzualizare - varianta luminoasa" };

/* Generata cu 3D AI Studio (CLAUDE.md sectiunea 4b). */
const PLANT_PHOTO = "/demo/monstera.jpg";

export default function LightPreviewPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-canvas text-ink">
      <Glow />

      <div className="relative mx-auto w-full max-w-[30rem] px-5 pt-[max(env(safe-area-inset-top),1.5rem)] pb-28">
        <Header />
        <Title />
        <SearchField />
        <CareCard />
        <FeaturedPlant />

        <button className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-leaf text-[15px] font-semibold text-ink-inverse shadow-raised transition-transform duration-200 active:scale-[0.98]">
          <Plus className="size-5" strokeWidth={2.4} />
          Adauga o planta
        </button>
      </div>

      <VariantSwitcher />
    </div>
  );
}

/**
 * Lumina din fundal, mult mai discreta decat in varianta intunecata: aici e
 * doar o caldura in colt, nu o sursa care bate in ochi.
 */
function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-40 -right-28 size-[30rem] rounded-full bg-leaf-soft/70 blur-[110px]" />
      <div className="absolute top-1/3 -left-32 size-[24rem] rounded-full bg-[#f2ead9]/80 blur-[120px]" />
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-leaf-soft text-lg ring-1 ring-line">
          &#127793;
        </span>
        <div>
          <p className="text-[15px] font-medium">Buna seara</p>
          <p className="text-[13px] text-ink-subtle">Ma bucur sa te vad</p>
        </div>
      </div>

      <button className="flex size-11 items-center justify-center rounded-full bg-surface text-ink-muted shadow-soft ring-1 ring-line">
        <Bell className="size-5" strokeWidth={1.8} />
      </button>
    </header>
  );
}

function Title() {
  return <h1 className="mt-7 text-[2.1rem] leading-tight">Gradina ta mica</h1>;
}

function SearchField() {
  return (
    <div className="mt-5 flex items-center gap-3">
      <div className="flex h-12 flex-1 items-center rounded-full bg-surface px-5 shadow-soft ring-1 ring-line">
        <span className="text-[14px] text-ink-subtle">Cauta o planta</span>
      </div>
      <button className="flex size-12 shrink-0 items-center justify-center rounded-full bg-leaf text-ink-inverse shadow-soft">
        <Search className="size-5" strokeWidth={2.4} />
      </button>
    </div>
  );
}

function CareCard() {
  return (
    <section className="mt-5 rounded-[26px] bg-surface p-5 shadow-card ring-1 ring-line">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-leaf-soft">
          <ScanLine className="size-5 text-leaf" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-[17px]">Vezi ce au nevoie</h2>
          <p className="text-[13px] text-ink-muted">
            Doua plante asteapta atentia ta
          </p>
        </div>
      </div>

      <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-leaf text-[14px] font-semibold text-ink-inverse transition-transform duration-200 active:scale-[0.98]">
        <Leaf className="size-4" strokeWidth={2.4} />
        Ingrijeste-le acum
      </button>

      <div className="mt-5 flex items-center gap-5">
        <ProgressRing
          label="Udate"
          value={5}
          total={7}
          accent="#4a6b52"
          track="#e8e2d6"
          valueClassName="text-ink-subtle"
        />
        <ProgressRing
          label="Sanatoase"
          value={8}
          total={9}
          accent="#6d95af"
          track="#e8e2d6"
          valueClassName="text-ink-subtle"
        />
      </div>
    </section>
  );
}

function FeaturedPlant() {
  return (
    <article className="mt-5 overflow-hidden rounded-[26px] bg-surface shadow-card ring-1 ring-line">
      <div className="relative">
        <Image
          src={PLANT_PHOTO}
          alt="Monstera din sufragerie"
          width={1200}
          height={896}
          priority
          className="h-[15rem] w-full object-cover"
        />

        {/* Etichetele stau pe alb translucid: se citesc fara sa stinga poza. */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-surface/85 px-3 py-1.5 text-[12px] font-medium text-ink backdrop-blur-md">
            Sufragerie
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-surface/85 px-3 py-1.5 text-[12px] font-semibold text-leaf backdrop-blur-md">
            <Sun className="size-3.5" strokeWidth={2.6} />
            Sanatoasa
          </span>
        </div>
      </div>

      {/* Textul sta sub poza, nu peste ea. */}
      <div className="p-5">
        <h3 className="text-[1.75rem] leading-tight">Luna</h3>
        <p className="text-[13px] text-ink-muted">Monstera deliciosa</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-water-soft px-3 py-1.5 text-[12px] text-ink-muted">
            <Droplets className="size-3.5 text-water" strokeWidth={2.2} />
            Udata acum 3 zile
          </span>
          <span className="rounded-full bg-surface-sunken px-3 py-1.5 text-[12px] text-ink-muted">
            200 de zile impreuna
          </span>
        </div>
      </div>
    </article>
  );
}
