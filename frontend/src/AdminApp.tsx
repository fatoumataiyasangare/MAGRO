import { useState } from "react";
import AdminDashboard from "./screens/AdminDashboard";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import { ToastProvider } from "./components/ToastProvider";

function AdminContent() {
  const [adminUser, setAdminUser] = useState<{
    name: string;
    role: "MODERATOR" | "SUPER_ADMIN" | "ANALYST";
  } | null>(null);

  const handleLoginComplete = (role: "MODERATOR" | "SUPER_ADMIN" | "ANALYST") => {
    setAdminUser({ name: role === "SUPER_ADMIN" ? "Super Admin" : role === "ANALYST" ? "Analyste" : "Modérateur MAGRO", role });
  };

  const handleLogout = () => {
    setAdminUser(null);
  };

  const handleNavigate = (screen: string) => {
    if (screen === "logout") {
      handleLogout();
    }
  };

  if (!adminUser) {
    return <AdminLoginScreen onLoginComplete={handleLoginComplete} />;
  }

  return (
    <AdminDashboard
      userName={adminUser.name}
      onNavigate={handleNavigate}
      propRole={adminUser.role}
      onLogout={handleLogout}
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
