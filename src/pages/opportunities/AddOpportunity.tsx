import { AddOpportunityForm } from "@/components/opportunities/AddOpportunityForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

const AddOpportunity = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="Create Opportunity"
        description="Create a new sponsorship opportunity to connect with run clubs"
      >
        <Link to="/opportunities">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
      </PageHeader>
      <AddOpportunityForm />
    </PageContainer>
  );
};

export default AddOpportunity;
