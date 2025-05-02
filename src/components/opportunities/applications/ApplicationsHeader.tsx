
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ApplicationsHeaderProps {
  title: string;
  description?: string;
  onRefresh: () => void;
}

const ApplicationsHeader = ({ title, description, onRefresh }: ApplicationsHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-2 p-0 hover:bg-transparent" 
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-xl font-medium">Back to opportunities</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{title || 'Loading...'} - Applications</h1>
        {description && <p className="text-gray-500">{description}</p>}
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default ApplicationsHeader;
