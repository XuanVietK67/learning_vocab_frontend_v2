import type { Metadata } from "next";
import { MicIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <ComingSoon
      icon={MicIcon}
      title="Practice"
      description="Speak words out loud and write sentences — pronunciation scoring and writing practice land here soon."
    />
  );
}
