import { EditOpportunityForm } from "@/components/opportunities/EditOpportunityForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

const EditOpportunity = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="Edit Opportunity"
        description="Update your sponsorship opportunity details"
      >
        <Link to="/opportunities">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
      </PageHeader>
      <EditOpportunityForm />
    </PageContainer>
  );
};

export default EditOpportunity; 