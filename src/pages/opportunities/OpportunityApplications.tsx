
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types";
import {
  fetchOpportunityDetails,
  fetchApplications,
  updateApplicationStatus,
  RunClubApplication,
  Opportunity
} from "@/services/applicationService";
import ApplicationsHeader from "@/components/opportunities/applications/ApplicationsHeader";
import ApplicationsContent from "@/components/opportunities/applications/ApplicationsContent";

const OpportunityApplications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<RunClubApplication[]>([]);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOpportunityDetails(id)
        .then(setOpportunity)
        .catch((error) => {
          console.error("Error fetching opportunity details:", error);
          toast({
            title: "Error",
            description: "Failed to load opportunity details",
            variant: "destructive",
          });
        });
        
      loadApplications();
    }
  }, [id]);

  const loadApplications = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const applicationsData = await fetchApplications(id);
      setApplications(applicationsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadApplications();
  };

  const handleUpdateStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      await updateApplicationStatus(applicationId, status);

      // Update local state to reflect the change
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));

      toast({
        title: "Status updated",
        description: `Application ${status === 'accepted' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <ApplicationsHeader
        title={opportunity?.title || ''}
        description={opportunity?.description}
        onRefresh={handleRefresh}
      />
      
      <ApplicationsContent
        applications={applications}
        isLoading={isLoading}
        handleUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default OpportunityApplications;
