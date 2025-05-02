
import { Badge } from "@/components/ui/badge";

type ApplicationStatus = "pending" | "accepted" | "rejected";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const ApplicationStatusBadge = ({ status }: ApplicationStatusBadgeProps) => {
  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return "outline";
      case "accepted":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default ApplicationStatusBadge;
