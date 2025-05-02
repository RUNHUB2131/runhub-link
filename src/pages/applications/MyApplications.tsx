
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRunClubApplications } from "@/services/applicationService";
import { Application } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const viewOpportunity = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Applications</h1>
        <p className="text-gray-600">Track the status of your applications to brand opportunities</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedApplications.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {applications.length > 0 ? (
              <ApplicationsList applications={applications} onViewOpportunity={viewOpportunity} />
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-6">
            {pendingApplications.length > 0 ? (
              <ApplicationsList applications={pendingApplications} onViewOpportunity={viewOpportunity} />
            ) : (
              <EmptyState message="You don't have any pending applications" />
            )}
          </TabsContent>
          
          <TabsContent value="accepted" className="space-y-6">
            {acceptedApplications.length > 0 ? (
              <ApplicationsList applications={acceptedApplications} onViewOpportunity={viewOpportunity} />
            ) : (
              <EmptyState message="You don't have any accepted applications" />
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-6">
            {rejectedApplications.length > 0 ? (
              <ApplicationsList applications={rejectedApplications} onViewOpportunity={viewOpportunity} />
            ) : (
              <EmptyState message="You don't have any rejected applications" />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

const ApplicationsList = ({ 
  applications, 
  onViewOpportunity 
}: { 
  applications: ApplicationWithOpportunity[],
  onViewOpportunity: (id: string) => void
}) => {
  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationCard 
          key={application.id} 
          application={application} 
          onViewOpportunity={onViewOpportunity} 
        />
      ))}
    </div>
  );
};

const ApplicationCard = ({ 
  application, 
  onViewOpportunity 
}: { 
  application: ApplicationWithOpportunity,
  onViewOpportunity: (id: string) => void
}) => {
  if (!application.opportunities) {
    return null;
  }

  const opportunity = application.opportunities;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#FEC6A1] text-[#7d4829] hover:bg-[#FEC6A1]';
      case 'accepted':
        return 'bg-[#F2FCE2] text-[#4c7520] hover:bg-[#F2FCE2]';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              {opportunity.brand?.logo_url ? (
                <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                  <img 
                    src={opportunity.brand.logo_url} 
                    alt={opportunity.brand.company_name || "Brand logo"}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                  {(opportunity.brand?.company_name?.[0] || "B").toUpperCase()}
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                <CardDescription>{opportunity.brand?.company_name}</CardDescription>
              </div>
            </div>
          </div>
          <Badge 
            variant="outline"
            className={getStatusBadgeClass(application.status)}
          >
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm line-clamp-2">{opportunity.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div>
              <strong>Reward:</strong> {opportunity.reward}
            </div>
            {opportunity.deadline && (
              <div>
                <strong>Deadline:</strong> {new Date(opportunity.deadline).toLocaleDateString()}
              </div>
            )}
            <div>
              <strong>Applied on:</strong> {new Date(application.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          onClick={() => onViewOpportunity(opportunity.id)}
        >
          View Opportunity
        </Button>
      </CardFooter>
    </Card>
  );
};

const EmptyState = ({ message = "You haven't applied to any opportunities yet" }) => (
  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
    <h3 className="text-lg font-medium mb-2">No applications found</h3>
    <p className="text-gray-500 mb-4">{message}</p>
    <Button onClick={() => window.location.href = "/opportunities"}>
      Browse Opportunities
    </Button>
  </div>
);

export default MyApplications;
