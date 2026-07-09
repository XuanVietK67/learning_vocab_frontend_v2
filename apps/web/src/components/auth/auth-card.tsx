import { cn } from "@/lib/utils";

interface AuthCardProps {
  /** Serif card title — the headline moment ("Welcome back"). */
  title: string;
  /** Warm-ink subtitle under the title. Accepts inline marks (e.g. the email). */
  description: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * The single branded hero card shared by all three auth screens: a 30px
 * rounded surface with a soft mint -> sky wash, a lifted shadow, and a gentle
 * entrance. Styling lives in `.auth-card` (globals.css); this composes the
 * serif title + warm subtitle header on top.
 */
export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className={cn("auth-card box-border w-full px-8.5 py-9", className)}>
      <h1 className="mb-1.5 font-(family-name:--serif) text-[30px] leading-tight font-medium tracking-tight text-(--ink)">
        {title}
      </h1>
      <p className="mb-6 text-[15px] leading-[1.45] text-(--ink-2)">{description}</p>
      {children}
    </div>
  );
}
