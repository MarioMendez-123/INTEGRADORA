// Solo aplica al CLI (studio/render). Ver https://remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Carpeta pública = audio/ (solo las mezclas): public/ entero se copiaría en cada render.
Config.setPublicDir("audio");
