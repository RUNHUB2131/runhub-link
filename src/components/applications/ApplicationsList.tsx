
import { Application } from "@/types";
import ApplicationCard from "./ApplicationCard";

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

interface ApplicationsListProps {
  applications: ApplicationWithOpportunity[];
}

const ApplicationsList = ({ applications }: ApplicationsListProps) => {
  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationCard 
          key={application.id} 
          application={application}
        />
      ))}
    </div>
  );
};

export default ApplicationsList;
