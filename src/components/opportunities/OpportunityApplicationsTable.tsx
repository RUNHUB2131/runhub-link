
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    member_count: number;
  } | null;
}

interface OpportunityApplicationsTableProps {
  opportunityId: string;
}

const OpportunityApplicationsTable = ({ opportunityId }: OpportunityApplicationsTableProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<RunClubApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [opportunityId]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // First fetch the applications
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', opportunityId);

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

  const getStatusBadgeVariant = (status: "pending" | "accepted" | "rejected") => {
    switch (status) {
      case "pending":
        return "outline";
      case "accepted":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
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

  if (isLoading) {
    return <div className="p-8 text-center">Loading applications...</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Applications</h2>
      
      {applications.length > 0 ? (
        <Table>
          <TableCaption>List of run clubs that applied for this opportunity</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Run Club</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">
                  {application.run_club_profile?.club_name || "Unknown Club"}
                </TableCell>
                <TableCell>{application.run_club_profile?.location || "N/A"}</TableCell>
                <TableCell>{application.run_club_profile?.member_count || 0}</TableCell>
                <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(application.status as "pending" | "accepted" | "rejected")}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {application.status === "pending" && (
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateStatus(application.id, "accepted")}
                        className="border-green-500 text-green-500 hover:bg-green-50"
                      >
                        Approve
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
  );
};

export default OpportunityApplicationsTable;
