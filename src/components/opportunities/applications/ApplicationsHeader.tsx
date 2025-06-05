import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ApplicationsHeaderProps {
  title: string;
  description?: string;
  onRefresh: () => void;
}

const ApplicationsHeader = ({ title, description, onRefresh }: ApplicationsHeaderProps) => {
  const navigate = useNavigate();
  const { id: opportunityId } = useParams<{ id: string }>();
  
  const handleBackNavigation = () => {
    if (opportunityId) {
      navigate(`/opportunities/${opportunityId}`);
    } else {
      navigate('/opportunities');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-3 p-0 hover:bg-transparent text-gray-600 hover:text-gray-900" 
          onClick={handleBackNavigation}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Back to opportunity</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{title || 'Loading...'} - Applications</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>

        <Button 
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2 self-start"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default ApplicationsHeader;
