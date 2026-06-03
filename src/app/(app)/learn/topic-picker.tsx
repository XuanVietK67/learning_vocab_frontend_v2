import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/admin/types";

interface TopicPickerProps {
  topics: Topic[];
}

/** Topic selection step shown before a `mode=topic` session can start. */
export function TopicPicker({ topics }: TopicPickerProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Choose a topic</h1>
        <p className="text-muted-foreground">Study words grouped by subject.</p>
      </div>

      {topics.length === 0 ? (
        <p className="text-muted-foreground">No topics are available yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/learn?mode=topic&topicSlug=${topic.slug}`} className="group">
              <Card className="h-full transition-shadow group-hover:ring-foreground/20">
                <CardContent className="flex flex-col gap-1">
                  <span className="font-medium">{topic.name}</span>
                  {topic.description && (
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {topic.description}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "self-start")}>
        Back to dashboard
      </Link>
    </div>
  );
}
