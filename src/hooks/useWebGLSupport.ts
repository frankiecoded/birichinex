import { useEffect, useState } from "react";

// Detects whether a WebGL context can actually be created on this device.
// Used to fall back to static/CSS content when 3D rendering is unavailable,
// so core platform content never depends on WebGL being present.
export default function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    let ok = true;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      ok = !!gl;
    } catch {
      ok = false;
    }
    setSupported(ok);
  }, []);

  return supported;
}
