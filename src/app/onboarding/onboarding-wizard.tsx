"use client";

import { type ReactNode, useState, useTransition } from "react";

import { completeOnboardingAction } from "@/app/(auth)/actions";
import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { CefrLevel } from "@/lib/auth/types";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
  { value: "pt-BR", label: "Português (Brasil)" },
] as const;

const LEVELS: { value: CefrLevel; hint: string }[] = [
  { value: "A1", hint: "Beginner" },
  { value: "A2", hint: "Elementary" },
  { value: "B1", hint: "Intermediate" },
  { value: "B2", hint: "Upper-int." },
  { value: "C1", hint: "Advanced" },
  { value: "C2", hint: "Mastery" },
];

const STEP_META = [
  { title: "Your languages", description: "What you speak and what you're learning." },
  { title: "Your level", description: "Pick your current proficiency." },
  { title: "Your goals", description: "Set a pace you can keep." },
];

function firstOf(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}

/** Render the selected language's label (Base UI Select.Value shows the raw value otherwise). */
function renderLanguageValue(value: string | null): ReactNode {
  if (!value) return "Select language";
  return LANGUAGES.find((lang) => lang.value === value)?.label ?? value;
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState<CefrLevel | "">("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(20);
  const [weeklyVocabGoal, setWeeklyVocabGoal] = useState(50);

  const sameLanguage =
    Boolean(nativeLanguage) && nativeLanguage === targetLanguage;

  const canAdvance =
    step === 0
      ? Boolean(nativeLanguage) && Boolean(targetLanguage) && !sameLanguage
      : step === 1
        ? Boolean(proficiencyLevel)
        : true;

  function next() {
    setError(undefined);
    if (step < STEP_META.length - 1) setStep((s) => s + 1);
  }

  function back() {
    setError(undefined);
    setStep((s) => Math.max(0, s - 1));
  }

  function finish() {
    if (!proficiencyLevel) return;
    setError(undefined);
    startTransition(async () => {
      const result = await completeOnboardingAction({
        nativeLanguage,
        targetLanguage,
        proficiencyLevel,
        dailyGoalMinutes,
        weeklyVocabGoal,
      });
      // Success redirects server-side; only errors come back.
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) {
        setError("Some answers look invalid. Please review and try again.");
      }
    });
  }

  const meta = STEP_META[step];

  return (
    <Card className="py-6">
      <CardHeader>
        <div className="mb-2 flex items-center gap-1.5" aria-hidden="true">
          {STEP_META.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <CardTitle className="text-xl">{meta.title}</CardTitle>
        <CardDescription>{meta.description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <FormAlert message={error} />

        {step === 0 && (
          <>
            <div className="grid gap-2">
              <Label>I speak (native language)</Label>
              <Select value={nativeLanguage} onValueChange={(v) => setNativeLanguage(String(v))}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue>{renderLanguageValue}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>I&apos;m learning (target language)</Label>
              <Select value={targetLanguage} onValueChange={(v) => setTargetLanguage(String(v))}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue>{renderLanguageValue}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sameLanguage && (
                <p className="text-sm text-destructive">
                  Pick a different language than your native one.
                </p>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((level) => {
              const selected = proficiencyLevel === level.value;
              return (
                <Button
                  key={level.value}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  onClick={() => setProficiencyLevel(level.value)}
                  className="h-auto flex-col gap-0.5 py-3"
                >
                  <span className="text-sm font-semibold">{level.value}</span>
                  <span className="text-xs opacity-80">{level.hint}</span>
                </Button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between">
                <Label>Daily goal</Label>
                <span className="text-sm font-medium">{dailyGoalMinutes} min</span>
              </div>
              <Slider
                value={[dailyGoalMinutes]}
                onValueChange={(v) => setDailyGoalMinutes(firstOf(v))}
                min={5}
                max={240}
                step={5}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between">
                <Label>Weekly new words</Label>
                <span className="text-sm font-medium">{weeklyVocabGoal} words</span>
              </div>
              <Slider
                value={[weeklyVocabGoal]}
                onValueChange={(v) => setWeeklyVocabGoal(firstOf(v))}
                min={5}
                max={250}
                step={5}
              />
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={step === 0 || pending}
        >
          Back
        </Button>
        {step < STEP_META.length - 1 ? (
          <Button type="button" onClick={next} disabled={!canAdvance}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={finish} disabled={pending}>
            {pending ? "Saving…" : "Finish"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
