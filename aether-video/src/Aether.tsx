import React from "react";
import { Audio, staticFile, useCurrentFrame } from "remotion";
import { Rehearsal } from "./Rehearsal";
import { Stage } from "./Stage";
import { MEDIAN_CUES } from "./timeline";

export type AetherProps = { rehearsal: boolean; audio: string | null };

/** MP4 de referencia: cues en las medianas medidas (timeline.json). */
export const Aether: React.FC<AetherProps> = ({ rehearsal, audio }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage f={f} q={MEDIAN_CUES} />
      {rehearsal && <Rehearsal f={f} q={MEDIAN_CUES} />}
      {audio && <Audio src={staticFile(audio)} />}
    </>
  );
};
