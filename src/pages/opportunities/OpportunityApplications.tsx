
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types";
import { ArrowLeft, Users, MapPin, RefreshCw } from "lucide-react";

interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    member_count: number;
  } | null;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
}

const OpportunityApplications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<RunClubApplication[]>([]);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOpportunityDetails();
      fetchApplications();
    }
  }, [id]);

  const fetchOpportunityDetails = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, title, description')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setOpportunity(data);
    } catch (error: any) {
      console.error("Error fetching opportunity details:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunity details",
        variant: "destructive",
      });
    }
  };

  const fetchApplications = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // First fetch the applications
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', id);

      if (appError) throw appError;

      // Initialize applications array with proper typing for status
      const initialApps: RunClubApplication[] = (appData || []).map(app => ({
        ...app,
        status: app.status as "pending" | "accepted" | "rejected"
      }));
      
      // Now fetch the run club profile data separately for each application
      const appsWithProfiles = await Promise.all(
        initialApps.map(async (app) => {
          const { data: profileData, error: profileError } = await supabase
            .from('run_club_profiles')
            .select('club_name, location, member_count')
            .eq('id', app.run_club_id)
            .single();

          return {
            ...app,
            run_club_profile: profileError ? null : profileData
          };
        })
      );

      setApplications(appsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
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
    fetchApplications();
  };

  const handleUpdateStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state to reflect the change
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));

      toast({
        title: "Status updated",
        description: `Application ${status === 'accepted' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-2 p-0 hover:bg-transparent" 
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-xl font-medium">Back to opportunities</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{opportunity?.title || 'Loading...'} - Applications</h1>
        <p className="text-gray-500">{opportunity?.description || ''}</p>
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Users className="h-5 w-5 mr-3" />
          <h2 className="text-xl font-bold">Run Club Applications ({applications.length})</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading applications...</div>
        ) : applications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Run Club</TableHead>
                <TableHead className="w-[200px]">Location</TableHead>
                <TableHead className="w-[100px]">Members</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[150px]">Applied On</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.run_club_profile?.club_name || "Unnamed Run Club"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {application.run_club_profile?.location || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-500" />
                      {application.run_club_profile?.member_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={application.status === 'pending' ? 'outline' : 
                              application.status === 'accepted' ? 'secondary' : 'destructive'}
                      className={application.status === 'pending' ? 'bg-[#FEC6A1] text-[#7d4829] hover:bg-[#FEC6A1]' : 
                                application.status === 'accepted' ? 'bg-[#F2FCE2] text-[#4c7520] hover:bg-[#F2FCE2]' : ''}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(application.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="px-0"
                    >
                      View Profile
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    {application.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(application.id, "accepted")}
                          className="border-green-500 text-green-500 hover:bg-green-50"
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(application.id, "rejected")}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No applications have been submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityApplications;
