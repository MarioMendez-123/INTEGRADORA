// Pantalla de llamada para dashboard/robot.html (se compila a dashboard/call-screen.js
// con `npm run call:build`). Expone window.LuminaCall para robot.js:
//   LuminaCall.start(nombre, mensaje) · LuminaCall.set(estado, detalle) · LuminaCall.end()
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, PlayerRef } from "@remotion/player";
import { useCurrentFrame } from "remotion";
import { CallProps, CallScreen, CallState } from "../src/call/CallScreen";

const RENDER_FPS = 60; // se dibuja a 60; la escena trabaja en cuadros de 30
const K = RENDER_FPS / 30;

const Live: React.FC<CallProps> = (props) => <CallScreen f={useCurrentFrame() / K} {...props} />;

type Api = { start: (name: string, message?: string) => void; set: (state: CallState, detail?: string) => void; end: () => void };
declare global {
  interface Window {
    LuminaCall?: Api;
  }
}

const App: React.FC<{ host: HTMLElement }> = ({ host }) => {
  const player = useRef<PlayerRef>(null);
  const [props, setProps] = useState<CallProps>({ name: "", events: [{ state: "dialing", at: 0 }], startAt: 0 });
  const now = () => (player.current?.getCurrentFrame() ?? 0) / K;

  useEffect(() => {
    window.LuminaCall = {
      start(name, message = "") {
        host.hidden = false;
        player.current?.seekTo(0);
        player.current?.play();
        setProps({ name, message, events: [{ state: "dialing", at: 0 }], startAt: 0 });
      },
      set(state, detail) {
        const at = now();
        setProps((p) => ({ ...p, events: [...p.events, { state, at, detail }] }));
      },
      end() {
        const at = now();
        setProps((p) => ({ ...p, endAt: at }));
        setTimeout(() => {
          player.current?.pause();
          host.hidden = true;
        }, 700);
      },
    };
  }, [host]);

  return (
    <div style={{ position: "relative", width: "min(100vw, calc(100vh * 16 / 9))", aspectRatio: "16 / 9" }}>
      <Player
        ref={player}
        component={Live}
        inputProps={props}
        durationInFrames={RENDER_FPS * 60 * 30}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={RENDER_FPS}
        style={{ width: "100%", height: "100%" }}
        controls={false}
        clickToPlay={false}
      />
    </div>
  );
};

const host = document.getElementById("call-screen");
if (host) createRoot(host).render(<App host={host} />);
