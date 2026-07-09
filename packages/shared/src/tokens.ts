/**
 * Brand design tokens — source of truth for both platforms. Extracted from the
 * web `globals.css` learn/app shell palette (mint primary + semantic colors).
 * The web keeps its CSS custom properties; mobile maps these into its
 * NativeWind / theme config so both stay visually in sync.
 */
export const tokens = {
  radius: {
    sm: 11,
    md: 14,
    lg: 18, // 1.125rem base
    xl: 25,
  },
  color: {
    primary: "#12bd8a",
    primaryPress: "#0ca576",
    primaryInk: "#07684b",
    primarySoft: "#e0f6ee",
    primarySoft2: "#c8eede",
    primaryForeground: "#ffffff",

    ink: "#15241e",
    ink2: "#5b6b64",
    ink3: "#91a09a",

    ok: "#11a368",
    okSoft: "#dcf4e7",
    okInk: "#0a6e44",
    bad: "#f1456a",
    badSoft: "#fde4ea",
    badInk: "#b51f42",

    amber: "#ffb020",
    amber2: "#ff7a1a",
    amberSoft: "#fff0d4",
    amberInk: "#92590a",

    violet: "#7b6cff",
    violetSoft: "#ece9ff",
    violetInk: "#4b3fb0",

    sky: "#1f9fd1",
    skySoft: "#e0f1fa",
    skyInk: "#0f5e80",

    gold: "#0a8f68",
    goldSoft: "#cfeee2",
    goldInk: "#075438",
  },
} as const;

export type Tokens = typeof tokens;
