
import { Button } from "@/components/ui/button";

interface ApplicationsEmptyStateProps {
  message?: string;
}

const ApplicationsEmptyState = ({ 
  message = "You haven't applied to any opportunities yet" 
}: ApplicationsEmptyStateProps) => (
  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
    <h3 className="text-lg font-medium mb-2">No applications found</h3>
    <p className="text-gray-500 mb-4">{message}</p>
    <Button onClick={() => window.location.href = "/opportunities"}>
      Browse Opportunities
    </Button>
  </div>
);

export default ApplicationsEmptyState;
