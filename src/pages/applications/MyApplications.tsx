
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRunClubApplications, withdrawApplication } from "@/services/applicationService";
import { Application } from "@/types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ApplicationsFilters from "@/components/applications/ApplicationsFilters";
import ApplicationsList from "@/components/applications/ApplicationsList";
import ApplicationsEmptyState from "@/components/applications/ApplicationsEmptyState";
import ApplicationsLoadingSkeleton from "@/components/applications/ApplicationsLoadingSkeleton";
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
  const [withdrawnApplications, setWithdrawnApplications] = useState<Set<string>>(new Set());

  const loadApplications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await fetchRunClubApplications(user.id);
      console.log("Loaded applications:", data);
      
      // Filter out applications that have been withdrawn in the current session
      const filteredData = data.filter(app => !withdrawnApplications.has(app.id));
      console.log("Filtered applications after withdrawal check:", filteredData);
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
  };

  useEffect(() => {
    loadApplications();
  }, [user?.id, withdrawnApplications]);

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      console.log("Handling withdrawal for application:", applicationId);
      
      // Find the withdrawn application to get its opportunity ID before it's removed
      const withdrawnApp = applications.find(app => app.id === applicationId);
      
      if (!withdrawnApp) {
        console.error("Could not find application to withdraw:", applicationId);
        return;
      }
      
      // Add to withdrawn applications set
      setWithdrawnApplications(prev => {
        const newSet = new Set(prev);
        newSet.add(applicationId);
        return newSet;
      });
      
      // Remove the application from the local state
      setApplications(prevApplications => 
        prevApplications.filter(app => app.id !== applicationId)
      );
      
      toast({
        title: "Application withdrawn",
        description: "The opportunity is now available in Browse Opportunities"
      });
      
      // Navigate to Browse Opportunities with state to trigger refresh
      navigate('/opportunities/browse', { 
        state: { 
          fromWithdraw: true, 
          opportunityId: withdrawnApp.opportunity_id 
        } 
      });
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive",
      });
    }
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Applications</h1>
        <p className="text-gray-600">Track the status of your applications to brand opportunities</p>
      </div>

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
            <TabsContent value="all" className="space-y-6" key="all">
              {applications.length > 0 ? (
                <ApplicationsList 
                  applications={applications} 
                  onWithdraw={handleWithdrawApplication}
                />
              ) : (
                <ApplicationsEmptyState />
              )}
            </TabsContent>
          
            <TabsContent value="pending" className="space-y-6" key="pending">
              {pendingApplications.length > 0 ? (
                <ApplicationsList 
                  applications={pendingApplications} 
                  onWithdraw={handleWithdrawApplication}
                />
              ) : (
                <ApplicationsEmptyState message="You don't have any pending applications" />
              )}
            </TabsContent>
          
            <TabsContent value="accepted" className="space-y-6" key="accepted">
              {acceptedApplications.length > 0 ? (
                <ApplicationsList 
                  applications={acceptedApplications}
                />
              ) : (
                <ApplicationsEmptyState message="You don't have any accepted applications" />
              )}
            </TabsContent>
          
            <TabsContent value="rejected" className="space-y-6" key="rejected">
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
    </div>
  );
};

export default MyApplications;
