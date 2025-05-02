
import { Button } from "@/components/ui/button";

interface ApplicationActionButtonsProps {
  applicationId: string;
  status: "pending" | "accepted" | "rejected";
  onUpdateStatus: (applicationId: string, status: "accepted" | "rejected") => Promise<void>;
}

const ApplicationActionButtons = ({
  applicationId,
  status,
  onUpdateStatus
}: ApplicationActionButtonsProps) => {
  if (status !== "pending") return null;
  
  return (
    <div className="space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onUpdateStatus(applicationId, "accepted")}
        className="border-green-500 text-green-500 hover:bg-green-50"
      >
        Approve
      </Button>
      <Button 
        variant="outline"
        size="sm"
        onClick={() => onUpdateStatus(applicationId, "rejected")}
        className="border-red-500 text-red-500 hover:bg-red-50"
      >
        Reject
      </Button>
    </div>
  );
};

export default ApplicationActionButtons;
