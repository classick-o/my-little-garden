/**
 * Lumina din fundalul aplicatiei.
 *
 * Fara ea, verdele inchis arata plat si mort. Cu ea, pare o camera in care
 * intra lumina - ceea ce e chiar ideea produsului.
 *
 * Sta fixat, nu se deruleaza cu continutul: lumina vine din camera, nu de pe
 * pagina.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* Sursa principala de lumina, in dreapta sus. */}
      <div className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-leaf-bright/45 blur-[120px]" />

      {/* Reflexie mai slaba in partea opusa, ca sa nu ramana un colt mort. */}
      <div className="absolute top-1/4 -left-40 size-[28rem] rounded-full bg-leaf/25 blur-[130px]" />

      <div className="absolute -bottom-24 right-0 size-[26rem] rounded-full bg-leaf-bright/18 blur-[110px]" />

      {/* Vigneta: inchide marginile si aduce atentia spre centru. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_20%,rgba(4,26,15,0.75)_100%)]" />
    </div>
  );
}
