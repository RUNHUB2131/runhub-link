import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRunClubApplications } from "@/services/applicationService";
import { Application } from "@/types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ApplicationsFilters from "@/components/applications/ApplicationsFilters";
import ApplicationsList from "@/components/applications/ApplicationsList";
import ApplicationsEmptyState from "@/components/applications/ApplicationsEmptyState";
import ApplicationsLoadingSkeleton from "@/components/applications/ApplicationsLoadingSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// We keep the interface here since it's used across multiple components
interface ApplicationWithOpportunity extends Application {
  opportunities?: {
    id: string;
    title: string;
    description: string;
    brand_id: string;
    reward: string;
    deadline: string | null;
    created_at: string;
    brand?: {
      company_name: string;
      logo_url?: string;
    } | null;
  };
}

const MyApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Keep track of withdrawn applications during the current session
  const [withdrawnApplicationIds, setWithdrawnApplicationIds] = useState<Set<string>>(new Set());
  
  const loadApplications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching applications for user:", user.id);
      const data = await fetchRunClubApplications(user.id);
      
      // Filter out any applications that have been withdrawn in the current session
      const filteredData = data.filter(app => !withdrawnApplicationIds.has(app.id));
      console.log("Filtered applications:", filteredData.length, "out of", data.length);
      setApplications(filteredData || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        title: "Error",
        description: "Failed to load your applications"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, withdrawnApplicationIds, toast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleWithdrawApplication = useCallback((applicationId: string) => {
    // Add to withdrawn applications set
    setWithdrawnApplicationIds(prev => {
      const newSet = new Set(prev);
      newSet.add(applicationId);
      return newSet;
    });
    
    // Remove the application from the local state
    setApplications(prevApps => prevApps.filter(app => app.id !== applicationId));
    
    // Note: The actual withdrawal API call and navigation is handled in ApplicationCard
    // This function is just for updating the local state
  }, []);

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <PageContainer>
      <PageHeader 
        title="My Applications" 
        description="Track the status of your applications to brand opportunities"
      />

      {isLoading ? (
        <ApplicationsLoadingSkeleton />
      ) : applications.length > 0 ? (
        <Tabs 
          defaultValue="all" 
          className="w-full"
          onValueChange={setActiveTab}
        >
          <ApplicationsFilters 
            totalCount={applications.length}
            pendingCount={pendingApplications.length}
            acceptedCount={acceptedApplications.length}
            rejectedCount={rejectedApplications.length}
          />
          
          <AnimatePresence mode="wait">
            <TabsContent value="all" className="space-y-6">
              {applications.length > 0 ? (
                <ApplicationsList 
                  applications={applications} 
                  onWithdraw={handleWithdrawApplication}
                />
              ) : (
                <ApplicationsEmptyState />
              )}
            </TabsContent>
          
            <TabsContent value="pending" className="space-y-6">
              {pendingApplications.length > 0 ? (
                <ApplicationsList 
                  applications={pendingApplications} 
                  onWithdraw={handleWithdrawApplication}
                />
              ) : (
                <ApplicationsEmptyState message="You don't have any pending applications" />
              )}
            </TabsContent>
          
            <TabsContent value="accepted" className="space-y-6">
              {acceptedApplications.length > 0 ? (
                <ApplicationsList 
                  applications={acceptedApplications}
                />
              ) : (
                <ApplicationsEmptyState message="You don't have any accepted applications" />
              )}
            </TabsContent>
          
            <TabsContent value="rejected" className="space-y-6">
              {rejectedApplications.length > 0 ? (
                <ApplicationsList 
                  applications={rejectedApplications}
                />
              ) : (
                <ApplicationsEmptyState message="You don't have any rejected applications" />
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      ) : (
        <ApplicationsEmptyState />
      )}
    </PageContainer>
  );
};

export default MyApplications;
