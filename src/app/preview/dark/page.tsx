import Image from "next/image";
import { Bell, Droplets, Leaf, Plus, ScanLine, Search, Sun } from "lucide-react";

import { ProgressRing } from "@/components/preview/ProgressRing";
import { VariantSwitcher } from "@/components/preview/VariantSwitcher";

/**
 * PREVIZUALIZARE - nu face parte din aplicatie.
 *
 * Varianta intunecata, dupa referinta vizuala trimisa de proprietar:
 * fundal verde inchis, carduri de sticla, verde viu ca accent.
 *
 * Exista ca sa poata fi comparata cu ecranul real, cald si luminos, de la "/".
 * Daca directia asta e aleasa, tokenurile se muta in globals.css si folderul
 * asta dispare. Daca nu, folderul dispare oricum.
 *
 * Stilurile sunt scrise local, cu valori directe, tocmai ca sa nu atinga
 * design system-ul existent pana la o decizie.
 */

export const metadata = { title: "Previzualizare - varianta intunecata" };

/* Poza de substituire, generata cu 3D AI Studio (vezi CLAUDE.md sectiunea 4b).
   In aplicatia reala aici vine poza facuta de utilizator. */
const PLANT_PHOTO = "/demo/monstera.jpg";

export default function DarkPreviewPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#13402a] text-white">
      <Glow />

      <div className="relative mx-auto w-full max-w-[30rem] px-5 pt-[max(env(safe-area-inset-top),1.5rem)] pb-28">
        <Header />
        <SearchField />
        <DiagnosisCard />
        <FeaturedPlant />

        <button className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-[#0b1f14] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-200 active:scale-[0.98]">
          <Plus className="size-5" strokeWidth={2.4} />
          Adauga o planta
        </button>
      </div>

      <VariantSwitcher />
    </div>
  );
}

/**
 * Lumina din fundal. Referinta are un verde luminos, nu unul plat: o sursa
 * puternica in dreapta sus si o cadere spre inchis catre margini.
 */
function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Sursa principala de lumina. */}
      <div className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-[#8ef2a8]/45 blur-[120px]" />
      {/* Reflexie mai slaba, in partea opusa, ca sa nu ramana un colt mort. */}
      <div className="absolute top-1/4 -left-40 size-[28rem] rounded-full bg-[#4ade80]/25 blur-[130px]" />
      <div className="absolute -bottom-24 right-0 size-[26rem] rounded-full bg-[#bbf7d0]/18 blur-[110px]" />
      {/* Vigneta: inchide marginile si aduce atentia spre centru. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_20%,rgba(4,26,15,0.75)_100%)]" />
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-lg ring-1 ring-white/20">
          &#127793;
        </span>
        <div>
          <p className="text-[15px] font-medium">Buna seara</p>
          <p className="text-[13px] text-white/55">Ma bucur sa te vad</p>
        </div>
      </div>

      <button className="flex size-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
        <Bell className="size-5" strokeWidth={1.8} />
      </button>
    </header>

  );
}

function SearchField() {
  return (
    <>
      <h1 className="mt-7 font-[family-name:var(--font-fraunces)] text-[2.1rem] leading-tight">
        Gradina ta mica
      </h1>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-12 flex-1 items-center rounded-full bg-white/10 px-5 ring-1 ring-white/18">
          <span className="text-[14px] text-white/45">Cauta o planta</span>
        </div>
        <button className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#4ade80] text-[#0b1f14]">
          <Search className="size-5" strokeWidth={2.4} />
        </button>
      </div>
    </>
  );
}

function DiagnosisCard() {
  return (
    <section className="mt-5 rounded-[26px] bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <ScanLine className="size-5 text-[#4ade80]" strokeWidth={2} />
        </span>
        <div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-[17px]">
            Vezi ce au nevoie
          </h2>
          <p className="text-[13px] text-white/55">
            Doua plante asteapta atentia ta
          </p>
        </div>
      </div>

      <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[14px] font-semibold text-[#0b1f14] transition-transform duration-200 active:scale-[0.98]">
        <Leaf className="size-4 text-[#22c55e]" strokeWidth={2.4} />
        Ingrijeste-le acum
      </button>

      <div className="mt-5 flex items-center gap-5">
        <ProgressRing
          label="Udate"
          value={5}
          total={7}
          accent="#4ade80"
          track="rgba(255,255,255,0.15)"
          valueClassName="text-white/50"
        />
        <ProgressRing
          label="Sanatoase"
          value={8}
          total={9}
          accent="#86efac"
          track="rgba(255,255,255,0.15)"
          valueClassName="text-white/50"
        />
      </div>
    </section>
  );
}

function FeaturedPlant() {
  return (
    <article className="relative mt-5 overflow-hidden rounded-[26px] ring-1 ring-white/12">
      <Image
        src={PLANT_PHOTO}
        alt="Monstera din sufragerie"
        width={1200}
        height={896}
        priority
        className="h-[17rem] w-full object-cover"
      />

      {/* Gradientul face textul lizibil peste orice poza, dar numai jos:
          mai sus poza trebuie sa isi pastreze lumina. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06150d] via-[#06150d]/20 via-45% to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <span className="rounded-full bg-black/35 px-3 py-1.5 text-[12px] font-medium backdrop-blur-md">
          Sufragerie
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#4ade80] px-3 py-1.5 text-[12px] font-semibold text-[#0b1f14]">
          <Sun className="size-3.5" strokeWidth={2.6} />
          Sanatoasa
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-[family-name:var(--font-fraunces)] text-[1.75rem] leading-tight">
          Luna
        </h3>
        <p className="text-[13px] text-white/65">Monstera deliciosa</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[12px] backdrop-blur-md ring-1 ring-white/15">
            <Droplets className="size-3.5 text-[#7dd3fc]" strokeWidth={2.2} />
            Udata acum 3 zile
          </span>
          <span className="rounded-full bg-white/12 px-3 py-1.5 text-[12px] backdrop-blur-md ring-1 ring-white/15">
            200 de zile impreuna
          </span>
        </div>
      </div>
    </article>
  );
}
