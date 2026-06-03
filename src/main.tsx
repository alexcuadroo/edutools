import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm("Nueva versión disponible. ¿Recargar?")) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log("App lista para usar offline");
    },
  });
}
