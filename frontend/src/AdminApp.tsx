import { useState } from "react";
import ProjectorsRegulatorsScreen from "./screens/ProjectorsRegulatorsScreen";
import { ToastProvider, useToast } from "./components/ToastProvider";

function AdminContent() {
  const [userName] = useState("Modérateur MAGRO");

  const handleNavigate = (screen: string) => {
    // Dans le back-office, on ne gère pas vraiment de navigation complexe pour l'instant
    if (screen === "logout") {
      window.location.href = "/";
    }
  };

  return (
    <ProjectorsRegulatorsScreen
      userName={userName}
      onNavigate={handleNavigate}
    />
  );
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <AdminContent />
    </ToastProvider>
  );
}
