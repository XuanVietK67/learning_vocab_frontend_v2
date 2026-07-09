"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";

import { FieldError } from "@/components/auth/field-error";
import { AUTH_INPUT_CLASS } from "@/components/auth/input-style";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  errors?: string[];
  /** Forwarded to the input — e.g. min length for new passwords. */
  minLength?: number;
  placeholder?: string;
}

export function PasswordField({
  name,
  label,
  autoComplete,
  errors,
  minLength,
  placeholder,
}: PasswordFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const invalid = Boolean(errors?.length);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-[13px] font-semibold text-(--ink)">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className={cn(AUTH_INPUT_CLASS, "pr-12")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-(--r-input) text-(--ink-3) transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
        >
          {visible ? <EyeOffIcon className="size-4.5" /> : <EyeIcon className="size-4.5" />}
        </button>
      </div>
      <FieldError id={errorId} messages={errors} />
    </div>
  );
}
