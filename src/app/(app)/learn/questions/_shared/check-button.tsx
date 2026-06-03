"use client";

import type * as React from "react";

import { Button } from "@/components/ui/button";

interface CheckButtonProps {
  disabled: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  children?: React.ReactNode;
}

/** Full-width primary action shared by the interactive question types. */
export function CheckButton({
  disabled,
  onClick,
  type = "button",
  children = "Check",
}: CheckButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="h-11 w-full text-base"
    >
      {children}
    </Button>
  );
}
