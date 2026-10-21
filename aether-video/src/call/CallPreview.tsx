import { useCurrentFrame } from "remotion";
import { CallProps, CallScreen } from "./CallScreen";

/** Vista previa en Remotion Studio: los estados llegan en cuadros fijos. */
export const CallPreview: React.FC<CallProps> = (props) => <CallScreen f={useCurrentFrame()} {...props} />;
