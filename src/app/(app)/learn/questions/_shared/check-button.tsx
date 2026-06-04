"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

interface CheckButtonProps {
  disabled: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  children?: React.ReactNode;
}

/** Full-width mint primary action with the design's pressable drop-shadow. */
export function CheckButton({
  disabled,
  onClick,
  type = "button",
  children = "Check",
}: CheckButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-[14px] px-6 py-3.5 text-base font-bold transition active:translate-y-[3px]",
        disabled
          ? "cursor-not-allowed bg-[#e7e9ef] text-[#b3bac8] shadow-[0_4px_0_#d7dbe4]"
          : "bg-primary text-primary-foreground shadow-[0_4px_0_var(--primary-d)] hover:brightness-[1.04] active:shadow-[0_1px_0_var(--primary-d)]",
      )}
    >
      {children}
    </button>
  );
}
