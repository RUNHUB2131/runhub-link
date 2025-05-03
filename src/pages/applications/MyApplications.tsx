import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRunClubApplications } from "@/services/applicationService";
import { Application } from "@/types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ApplicationsFilters from "@/components/applications/ApplicationsFilters";
import ApplicationsList from "@/components/applications/ApplicationsList";
import ApplicationsEmptyState from "@/components/applications/ApplicationsEmptyState";
import ApplicationsLoadingSkeleton from "@/components/applications/ApplicationsLoadingSkeleton";
import { AnimatePresence } from "framer-motion";

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
  const [applications, setApplications] = useState<ApplicationWithOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchRunClubApplications(user.id);
        setApplications(data || []);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [user?.id]);

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
                <ApplicationsList applications={applications} />
              ) : (
                <ApplicationsEmptyState />
              )}
            </TabsContent>
          
            <TabsContent value="pending" className="space-y-6" key="pending">
              {pendingApplications.length > 0 ? (
                <ApplicationsList applications={pendingApplications} />
              ) : (
                <ApplicationsEmptyState message="You don't have any pending applications" />
              )}
            </TabsContent>
          
            <TabsContent value="accepted" className="space-y-6" key="accepted">
              {acceptedApplications.length > 0 ? (
                <ApplicationsList applications={acceptedApplications} />
              ) : (
                <ApplicationsEmptyState message="You don't have any accepted applications" />
              )}
            </TabsContent>
          
            <TabsContent value="rejected" className="space-y-6" key="rejected">
              {rejectedApplications.length > 0 ? (
                <ApplicationsList applications={rejectedApplications} />
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
