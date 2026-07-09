import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ImageTileProps {
  /** Backend-supplied image URL, or null/absent to show a placeholder tile. */
  src?: string | null;
  alt: string;
  /** Sizing/extra classes (e.g. `size-[150px]`). */
  className?: string;
  /** Adds the gentle floating idle motion. */
  float?: boolean;
}

/**
 * A rounded image tile on a mint→sky gradient. Falls back to a placeholder glyph
 * when no image is available, so the layout never shows a broken box (brief §5).
 */
export function ImageTile({ src, alt, className, float = false }: ImageTileProps) {
  return (
    <div className={cn("lr-imgtile", float && "lr-float", className)}>
      {src ? (
        // Arbitrary backend-supplied URL — not a configured next/image host.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <span className="ph">
          <ImageIcon className="size-10" strokeWidth={1.7} />
        </span>
      )}
    </div>
  );
}
