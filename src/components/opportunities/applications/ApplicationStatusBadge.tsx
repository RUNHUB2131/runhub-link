import { Badge } from "@/components/ui/badge";
import { Clock, Check, X } from "lucide-react";

type ApplicationStatus = "pending" | "accepted" | "rejected";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const ApplicationStatusBadge = ({ status }: ApplicationStatusBadgeProps) => {
  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return {
          className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: "Pending"
        };
      case "accepted":
        return {
          className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
          icon: <Check className="h-3 w-3 mr-1" />,
          label: "Accepted"
        };
      case "rejected":
        return {
          className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
          icon: <X className="h-3 w-3 mr-1" />,
          label: "Rejected"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={`border ${config.className} flex items-center font-medium`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default ApplicationStatusBadge;
