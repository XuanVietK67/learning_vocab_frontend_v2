import type { Metadata } from "next";
import { BookMarkedIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "My Words" };

export default function WordsPage() {
  return (
    <ComingSoon
      icon={BookMarkedIcon}
      title="My Words"
      description="Your personal vocabulary collection — add, search, and edit the words you're learning. Full management lands here soon."
    />
  );
}
