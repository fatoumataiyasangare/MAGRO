import AdminDashboard from "./AdminDashboard";

interface Props {
  userName: string;
  onNavigate: (screen: string) => void;
}

export default function SuperAdminDashboard(props: Props) {
  return <AdminDashboard {...props} propRole="SUPER_ADMIN" />;
}
