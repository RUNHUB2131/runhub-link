
import { Users } from "lucide-react";
import { Application } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import EmptyApplicationsState from "./EmptyApplicationsState";

interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    member_count: number;
  } | null;
}

interface ApplicationsContentProps {
  applications: RunClubApplication[];
  isLoading: boolean;
  handleUpdateStatus: (applicationId: string, status: "accepted" | "rejected") => Promise<void>;
}

const ApplicationsContent = ({ applications, isLoading, handleUpdateStatus }: ApplicationsContentProps) => {
  return (
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
        <EmptyApplicationsState />
      )}
    </div>
  );
};

export default ApplicationsContent;
