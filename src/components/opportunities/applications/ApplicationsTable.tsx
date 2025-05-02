
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Application } from "@/types";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import ApplicationActionButtons from "./ApplicationActionButtons";

interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    member_count: number;
  } | null;
}

interface ApplicationsTableProps {
  applications: RunClubApplication[];
  onUpdateStatus: (applicationId: string, status: "accepted" | "rejected") => Promise<void>;
}

const ApplicationsTable = ({ applications, onUpdateStatus }: ApplicationsTableProps) => {
  return (
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
              <ApplicationStatusBadge status={application.status as "pending" | "accepted" | "rejected"} />
            </TableCell>
            <TableCell className="text-right">
              <ApplicationActionButtons 
                applicationId={application.id}
                status={application.status as "pending" | "accepted" | "rejected"}
                onUpdateStatus={onUpdateStatus}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ApplicationsTable;
