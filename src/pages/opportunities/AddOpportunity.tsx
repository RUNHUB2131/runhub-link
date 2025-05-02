
import { AddOpportunityForm } from "@/components/opportunities/AddOpportunityForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AddOpportunity = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/opportunities">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Opportunity</h1>
      </div>
      <AddOpportunityForm />
    </div>
  );
};

export default AddOpportunity;
