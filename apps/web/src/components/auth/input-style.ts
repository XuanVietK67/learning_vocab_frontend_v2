/**
 * Shared Sprout look for the auth text fields (matches the design mock): a 50px
 * white field with the 16px input radius and a warm `--bad` invalid state. The
 * mint focus ring is inherited from the in-scope shadcn `Input` (`--ring`).
 */
export const AUTH_INPUT_CLASS =
  "h-12.5 rounded-(--r-input) bg-white px-4 text-[15px] aria-invalid:border-(--bad) aria-invalid:ring-(--bad)/20";
