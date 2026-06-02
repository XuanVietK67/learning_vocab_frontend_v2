import { CheckIcon, Volume2Icon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "studies", correct: true },
  { label: "teaches", correct: false },
  { label: "writes", correct: false },
  { label: "speaks", correct: false },
] as const;

/**
 * A static, non-interactive mock of a `cloze_mcq` question — the core learning
 * mechanic — used as the hero's product visual. Purely decorative; no state.
 */
export function SampleQuestionCard() {
  return (
    <Card className="w-full gap-5 py-5 shadow-sm">
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Fill the blank · A2
          </span>
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <Volume2Icon className="size-4" />
          </span>
        </div>

        <p className="text-xl leading-relaxed font-medium tracking-tight">
          She{" "}
          <span className="mx-0.5 inline-flex w-20 -translate-y-0.5 border-b-2 border-dashed border-muted-foreground/40 align-middle" />{" "}
          biology at university.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map((option) => (
            <div
              key={option.label}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium",
                option.correct
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground",
              )}
            >
              {option.label}
              {option.correct && <CheckIcon className="size-4" />}
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Cô ấy{" "}
          <span className="text-foreground/70">học</span> sinh học ở trường đại
          học.
        </p>
      </CardContent>
    </Card>
  );
}
