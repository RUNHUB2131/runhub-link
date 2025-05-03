
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyOpportunitiesProps {
  onAddOpportunity: () => void;
}

const EmptyOpportunities = ({ onAddOpportunity }: EmptyOpportunitiesProps) => {
  return (
    <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
      <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
      <p className="text-gray-500 mb-4">Create your first sponsorship opportunity to connect with run clubs</p>
      <Button onClick={onAddOpportunity}>
        <Plus className="h-4 w-4 mr-2" />
        Create Opportunity
      </Button>
    </div>
  );
};

export default EmptyOpportunities;
