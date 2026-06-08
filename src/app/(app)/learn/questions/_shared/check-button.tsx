"use client";

import type * as React from "react";

interface CheckButtonProps {
  disabled: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  children?: React.ReactNode;
}

/** Full-width Sprout mint primary action (the "Check" footer button). */
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
      className="lr-btn lr-btn--primary lr-btn--lg lr-btn--block"
    >
      {children}
    </button>
  );
}
