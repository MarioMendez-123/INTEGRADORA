import { Composition } from "remotion";
import { Intro, TOTAL } from "./Intro";
export const Root: React.FC = () => <Composition id="AetherIntro" component={Intro} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />;
