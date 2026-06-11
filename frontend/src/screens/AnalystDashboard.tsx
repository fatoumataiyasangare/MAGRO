import AdminDashboard from "./AdminDashboard";

interface Props {
  userName: string;
  onNavigate: (screen: string) => void;
}

export default function AnalystDashboard(props: Props) {
  return <AdminDashboard {...props} propRole="ANALYST" />;
}
