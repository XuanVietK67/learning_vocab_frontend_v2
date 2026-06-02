import { Card, CardContent } from "@/components/ui/card";
import type { StatsCounts } from "@/lib/me/types";

const TILES: { key: keyof StatsCounts; label: string }[] = [
  { key: "new", label: "New" },
  { key: "learning", label: "Learning" },
  { key: "review", label: "Review" },
  { key: "mastered", label: "Mastered" },
];

/** Four-up snapshot of the SRS lifecycle counts. */
export function StatTiles({ counts }: { counts: StatsCounts }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TILES.map((tile) => (
        <Card key={tile.key} size="sm">
          <CardContent className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums">
              {counts[tile.key]}
            </span>
            <span className="text-sm text-muted-foreground">{tile.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
