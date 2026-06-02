import { useState } from "react";
import AdminDashboard from "./screens/AdminDashboard";
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
    <AdminDashboard
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
