import { loadFont as loadSans } from "@remotion/google-fonts/IBMPlexSans";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

// En el reproductor en vivo las fuentes van en local (player/fonts.css): el
// escenario puede no tener internet. Remotion (studio/render) las descarga.
const localFonts = typeof window !== "undefined" && (window as unknown as { AETHER_LOCAL_FONTS?: boolean }).AETHER_LOCAL_FONTS;
const sans = localFonts ? { fontFamily: "IBM Plex Sans" } : loadSans("normal", { weights: ["300", "400", "500"], subsets: ["latin", "latin-ext"] });
const mono = localFonts ? { fontFamily: "IBM Plex Mono" } : loadMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });

// Negro industrial, blanco cálido y un solo acento ámbar (el mismo --warn del dashboard).
export const C = {
  bg: "#0a0a09",
  bgDeep: "#050505",
  ink: "#ece6da",
  inkDim: "rgba(236,230,218,0.55)",
  inkFaint: "rgba(236,230,218,0.16)",
  inkGhost: "rgba(236,230,218,0.07)",
  blade: "#121210",
  amber: "#e0a64a",
  amberDim: "rgba(224,166,74,0.35)",
  amberGhost: "rgba(224,166,74,0.12)",
};

export const F = {
  sans: sans.fontFamily,
  mono: mono.fontFamily,
};

export const W = 1920;
export const H = 1080;
export const CX = W / 2;
export const CY = H / 2;
