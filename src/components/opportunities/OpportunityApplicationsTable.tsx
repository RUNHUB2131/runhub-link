
import { useApplications } from "@/hooks/useApplications";
import ApplicationsTable from "./applications/ApplicationsTable";
import EmptyApplicationsState from "./applications/EmptyApplicationsState";

interface OpportunityApplicationsTableProps {
  opportunityId: string;
}

const OpportunityApplicationsTable = ({ opportunityId }: OpportunityApplicationsTableProps) => {
  const { applications, isLoading, updateApplicationStatus } = useApplications(opportunityId);

  if (isLoading) {
    return <div className="p-8 text-center">Loading applications...</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Applications</h2>
      
      {applications.length > 0 ? (
        <ApplicationsTable 
          applications={applications} 
          onUpdateStatus={updateApplicationStatus}
        />
      ) : (
        <EmptyApplicationsState />
      )}
    </div>
  );
};

export default OpportunityApplicationsTable;
