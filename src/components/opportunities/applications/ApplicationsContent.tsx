import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Application } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import RunClubProfileDialog from "@/components/opportunities/applications/RunClubProfileDialog";

interface ApplicationsContentProps {
  applications: Application[];
  onStatusChange: () => void;
}

export const ApplicationsContent = ({ applications, onStatusChange }: ApplicationsContentProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewingRunClubId, setViewingRunClubId] = useState<string | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleStatusChange = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      toast({
        title: `Application ${newStatus}`,
        description: `The application has been ${newStatus}.`,
      });
      
      onStatusChange();
    } catch (error: any) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const viewRunClubProfile = (runClubId: string) => {
    setViewingRunClubId(runClubId);
    setIsProfileDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No applications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div 
          key={application.id} 
          className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{application.run_club?.club_name || "Unknown Run Club"}</h3>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => viewRunClubProfile(application.run_club_id)}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Profile
            </Button>
            
            {application.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange(application.id, 'accepted')}
                  disabled={isUpdating}
                  className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange(application.id, 'rejected')}
                  disabled={isUpdating}
                  className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
      
      {viewingRunClubId && (
        <RunClubProfileDialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
          runClubId={viewingRunClubId}
        />
      )}
    </div>
  );
};

export default ApplicationsContent;
