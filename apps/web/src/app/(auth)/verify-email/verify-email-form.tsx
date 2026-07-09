"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { sendVerificationAction, verifyEmailAction } from "@/app/(auth)/actions";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { EMPTY_FORM_STATE } from "@/lib/forms";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_SECONDS = 60;

const OTP_SLOT_CLASS =
  "h-14.5 w-12 rounded-(--r-input) border border-(--line-2) bg-(--card-2) text-2xl font-bold text-(--ink) first:rounded-l-(--r-input) last:rounded-r-(--r-input) data-[active=true]:bg-white";

export function VerifyEmailForm() {
  const [state, formAction] = useActionState(verifyEmailAction, EMPTY_FORM_STATE);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [sending, startSending] = useTransition();
  const [hasSent, setHasSent] = useState(false);

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleSend() {
    startSending(async () => {
      const result = await sendVerificationAction();
      if (result.ok) {
        setHasSent(true);
        setCooldown(RESEND_COOLDOWN_SECONDS);
        toast.success("Code sent. Check your inbox.");
      } else {
        if (result.retryAfter) setCooldown(result.retryAfter);
        toast.error(result.message ?? "Could not send a code.");
      }
    });
  }

  const onCooldown = sending || cooldown > 0;
  const sendLabel = sending
    ? "Sending…"
    : cooldown > 0
      ? `Resend in ${cooldown}s`
      : hasSent
        ? "Resend code"
        : "Send code";

  return (
    <div className="grid gap-5">
      <form action={formAction} className="grid gap-5">
        <FormAlert message={state.error} />

        <div className="flex flex-col items-center gap-2">
          <input type="hidden" name="code" value={code} />
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            aria-label="Verification code"
            containerClassName="justify-center gap-3.5"
          >
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <InputOTPSlot key={i} index={i} className={OTP_SLOT_CLASS} />
              ))}
            </InputOTPGroup>
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <InputOTPSlot key={i + 3} index={i + 3} className={OTP_SLOT_CLASS} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <SubmitButton pendingLabel="Verifying…" className="h-13.5 text-base shadow-(--sh-primary)">
          Verify
        </SubmitButton>
      </form>

      <div className="flex flex-col items-center gap-3.5 text-sm">
        <Button
          type="button"
          variant="ghost"
          onClick={handleSend}
          disabled={onCooldown}
          className={cn(
            "h-auto px-2 py-1 font-semibold tabular-nums",
            onCooldown ? "text-(--ink-3)" : "text-(--primary-ink)",
          )}
        >
          {sendLabel}
        </Button>
        <Link
          href="/onboarding"
          className="font-semibold text-(--ink-2) transition-colors hover:text-primary hover:underline"
        >
          Skip for now
        </Link>
      </div>
    </div>
  );
}
