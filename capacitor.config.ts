import type { CapacitorConfig } from "@capacitor/cli";

// Native iOS/Android shells around the static build from `npm run build:mobile`.
// See docs/MOBILE.md for building and publishing to the stores.
const config: CapacitorConfig = {
  appId: "com.cuentacartas.app",
  appName: "CuentaCartas",
  webDir: "dist/client",
  backgroundColor: "#0d241b",
  ios: { contentInset: "never" },
};

export default config;
