import { BottomNav } from "@/components/app-shell/BottomNav";

/**
 * Invelisul aplicatiei: continut derulabil plus navigatia fixa de jos.
 * Padding-ul de jos tine cont de bara si de zona sigura a iPhone-ului.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="content-width flex-1 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(var(--nav-height)+env(safe-area-inset-bottom)+1rem)]">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
