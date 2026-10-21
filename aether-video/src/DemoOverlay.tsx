import { AbsoluteFill } from "remotion";
import { DEMO, DemoFrame } from "./scenes/Demo";
import { C } from "./theme";

/** Marco de la demo con interior TRANSPARENTE (1440×810 centrado): se exporta
 * como PNG para componer encima el feed real de la cámara de Aether. */
export const DemoOverlay = () => (
  <AbsoluteFill>
    <svg width={1920} height={1080}>
      <path d={`M0,0H1920V1080H0Z M${DEMO.x},${DEMO.y}V${DEMO.y + DEMO.h}H${DEMO.x + DEMO.w}V${DEMO.y}Z`} fill={C.bg} fillRule="evenodd" />
      <DemoFrame />
    </svg>
  </AbsoluteFill>
);
