import { BrandMark } from "@/components/brand-mark";

/**
 * Shared chrome for the auth screens: a centered column with a brand mark.
 * Server Component — no interactivity here.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <BrandMark />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
