// Escena Remotion del dashboard (se compila a dashboard/web-scenes.js con
// `npm run web:build`): monta el wordmark de la portada en #hero-scene, que
// sigue al puntero.
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { useCurrentFrame } from "remotion";
import { HeroWordmark, LOOP, pointer } from "../src/web/HeroWordmark";

const FPS = 60;
const K = FPS / 30;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Hero: React.FC = () => <HeroWordmark f={useCurrentFrame() / K} />;

const hero = document.getElementById("hero-scene");
if (hero) {
  createRoot(hero).render(
    <Player
      component={Hero}
      durationInFrames={LOOP * K}
      compositionWidth={1920}
      compositionHeight={720}
      fps={FPS}
      style={{ width: "100%", height: "100%" }}
      controls={false}
      clickToPlay={false}
      autoPlay={!reduce}
      loop
    />,
  );
  document.documentElement.classList.add("has-hero-scene");
  if (!reduce) {
    const target = { x: 0, y: 0 };
    window.addEventListener("pointermove", (e) => {
      target.x = e.clientX / innerWidth - 0.5;
      target.y = e.clientY / innerHeight - 0.5;
    }, { passive: true });
    const tick = () => {
      pointer.x += (target.x - pointer.x) * 0.08;
      pointer.y += (target.y - pointer.y) * 0.08;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
