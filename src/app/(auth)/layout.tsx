/**
 * Shared chrome for the auth screens: a centered column with a brand mark.
 * Server Component — no interactivity here.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          V
        </div>
        <span className="text-base font-semibold tracking-tight">Vocab</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
