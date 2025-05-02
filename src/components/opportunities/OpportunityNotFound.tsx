
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const OpportunityNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-2">Opportunity not found</h2>
      <p className="text-gray-500 mb-6">The opportunity you're looking for doesn't exist or has been removed.</p>
      <Button onClick={() => navigate("/opportunities")}>
        Back to Opportunities
      </Button>
    </div>
  );
};

export default OpportunityNotFound;
