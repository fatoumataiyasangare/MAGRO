
  import { createRoot } from "react-dom/client";
  import { registerSW } from "virtual:pwa-register";
  import App from "./App.tsx";
  import AdminApp from "./AdminApp.tsx";
  import "./styles/index.css";

  // Register Service Worker for offline support (PWA)
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm("Nouvelle version de MAGRO disponible. Recharger ?")) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log("[MAGRO PWA] Application prête à fonctionner hors ligne !");
    },
    onRegisteredSW(swUrl, registration) {
      console.log("[MAGRO PWA] Service Worker enregistré :", swUrl);
      // Check for updates every 30 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("[MAGRO PWA] Erreur d'enregistrement :", error);
    }
  });

  const root = createRoot(document.getElementById("root")!);
  
  if (window.location.pathname.startsWith("/admin")) {
    root.render(<AdminApp />);
  } else {
    root.render(<App />);
  }
  