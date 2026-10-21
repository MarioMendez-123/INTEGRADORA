import React from "react";
import { HonestLabel } from "../components/primitives";
import { prog } from "../lib/anim";
import { SceneProps, at } from "./types";

/** Todo lo conceptual se ve como conceptual. Nunca aparece sobre la demo real. */
export const Labels: React.FC<SceneProps> = ({ f, q }) => {
  const span = (from: number, to: number) => prog(f, from, 20) * (1 - prog(f, to, 16));
  const concept =
    span(at(q, "L06"), at(q, "L27")) + // anaquel, cadena, proceso, arquitectura
    span(at(q, "L28") + 48, at(q, "L29")) +
    span(at(q, "C1") + 20, at(q, "C3") + 10); // SEE → UNDERSTAND → DECIDE
  const schematic = span(at(q, "L27") + 16, at(q, "L28") + 30); // sin encimarse con la otra
  return (
    <g>
      <HonestLabel text="visualización conceptual" opacity={0.85 * Math.min(1, concept)} />
      <HonestLabel text="esquema ilustrativo" opacity={0.85 * schematic} />
    </g>
  );
};
