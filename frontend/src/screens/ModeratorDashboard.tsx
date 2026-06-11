import AdminDashboard from "./AdminDashboard";

interface Props {
  userName: string;
  onNavigate: (screen: string) => void;
}

export default function ModeratorDashboard(props: Props) {
  return <AdminDashboard {...props} propRole="MODERATOR" />;
}
