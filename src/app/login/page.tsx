import { GoogleSignIn } from "./GoogleSignIn";

/**
 * Conectarea.
 *
 * Singura pagina care se deschide fara cont. Aplicatia e privata: intra doar
 * adresele din `allowed_emails`, iar verificarea se face in baza de date, nu
 * aici - un declansator pe `auth.users` o refuza pe oricare alta.
 */
export const metadata = { title: "Intra in gradina" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  /* In Next 16 `searchParams` e asincron. */
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const failed = params.error !== undefined;

  return (
    <main className="content-width flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="glass rounded-2xl p-7 text-center shadow-card">
        <p className="text-[11px] uppercase tracking-wide text-ink-subtle">
          My little garden
        </p>
        <h1 className="mt-2 text-[2rem] leading-tight">Gradina ta te asteapta</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Intra cu contul tau Google. Aplicatia e doar a ta.
        </p>

        {failed ? (
          <p className="mt-5 rounded-md bg-wilt-soft px-4 py-3 text-[13px] text-wilt">
            Conectarea nu a reusit. Mai incearca o data.
          </p>
        ) : null}

        <GoogleSignIn next={next} />
      </div>
    </main>
  );
}
