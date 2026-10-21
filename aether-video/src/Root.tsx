import { Composition, Still } from "remotion";
import { Aether, AetherProps } from "./Aether";
import { CallPreview } from "./call/CallPreview";
import type { CallProps } from "./call/CallScreen";
import { DemoOverlay } from "./DemoOverlay";
import { DURATION_FRAMES, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Escenario / referencia: sin voz (Lumina habla desde el robot), música + efectos con ducking. */}
    <Composition id="Aether" component={Aether} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ rehearsal: false, audio: "mix_escenario.wav" } as AetherProps} />
    {/* Ensayo: voz real de Lumina en su mediana, frases y timecode en pantalla. */}
    <Composition id="AetherEnsayo" component={Aether} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ rehearsal: true, audio: "mix_ensayo.wav" } as AetherProps} />
    {/* Overlay de la demo con interior transparente (PNG) para componer el feed real. */}
    <Still id="DemoOverlay" component={DemoOverlay} width={1920} height={1080} />
    {/* Pantalla de llamada de Lumina (robot.html): marcando → contestó / no contestó / falló. */}
    <Composition
      id="LlamadaLumina"
      component={CallPreview}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ name: "Mamá", message: "ya voy", events: [{ state: "dialing", at: 0 }, { state: "answered", at: 180 }], startAt: 0, endAt: 330 } as CallProps}
    />
  </>
);
