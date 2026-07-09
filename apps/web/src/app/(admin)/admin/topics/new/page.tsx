import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTopicAction } from "@/lib/admin/topic-actions";

export const metadata: Metadata = {
  title: "New topic",
};

export default function NewTopicPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/admin/topics"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Topics
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New topic
        </h1>
        <p className="text-sm text-muted-foreground">
          The slug is the identifier and can&apos;t be renamed later — delete
          and recreate to change it.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <ActionForm action={createTopicAction} className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required placeholder="food-and-drink" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Food & Drink" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Words about meals, dishes, ingredients"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="iconUrl">Icon URL</Label>
              <Input id="iconUrl" name="iconUrl" type="url" />
            </div>
            <div className="sm:col-span-2">
              <AdminSubmit>Create topic</AdminSubmit>
            </div>
          </ActionForm>
        </CardContent>
      </Card>
    </div>
  );
}
