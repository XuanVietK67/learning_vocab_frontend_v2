import { Separator } from "@/components/ui/separator";

/** Horizontal "or" divider between the form and the social buttons. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">or</span>
      <Separator className="flex-1" />
    </div>
  );
}
