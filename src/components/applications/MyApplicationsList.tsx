import { useState } from "react";
import { Clock, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Application } from "@/types";
import OpportunityBrandInfo from "@/components/opportunities/OpportunityBrandInfo";
import { Link } from "react-router-dom";

interface ApplicationWithOpportunity extends Application {
  opportunities?: {
    id: string;
    title: string;
    brand_id: string;
    club_incentives: string;
    submission_deadline: string;
    target_launch_date: string;
    brand?: {
      company_name: string;
      logo_url?: string;
    } | null;
  };
}

interface MyApplicationsListProps {
  applications: ApplicationWithOpportunity[];
  isLoading: boolean;
}

const MyApplicationsList = ({ applications, isLoading }: MyApplicationsListProps) => {
  const pendingApplications = applications.filter(app => app.status === "pending");
  const acceptedApplications = applications.filter(app => app.status === "accepted");
  const rejectedApplications = applications.filter(app => app.status === "rejected");

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading your applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-xl font-medium text-gray-700">No applications yet</h3>
        <p className="text-gray-500 mt-2">You haven't applied to any opportunities yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Applications Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-medium">Pending Applications ({pendingApplications.length})</h3>
        </div>
        
        {pendingApplications.length === 0 ? (
          <p className="text-gray-500">No pending applications</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApplications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </section>

      {/* Accepted Applications Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Check className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-medium">Accepted Applications ({acceptedApplications.length})</h3>
        </div>
        
        {acceptedApplications.length === 0 ? (
          <p className="text-gray-500">No accepted applications</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedApplications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </section>

      {/* Rejected Applications Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <X className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-medium">Rejected Applications ({rejectedApplications.length})</h3>
        </div>
        
        {rejectedApplications.length === 0 ? (
          <p className="text-gray-500">No rejected applications</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedApplications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ApplicationCard = ({ application }: { application: ApplicationWithOpportunity }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-amber-100 text-amber-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <Check className="h-4 w-4" />;
      case "rejected": return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <Badge 
          className={`mb-2 ${getStatusColor(application.status)} flex w-fit items-center gap-1 border-none`}
        >
          {getStatusIcon(application.status)}
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </Badge>
        <CardTitle className="text-lg">{application.opportunities?.title || "Unknown Opportunity"}</CardTitle>
        {application.opportunities && application.opportunities.brand_id && (
          <OpportunityBrandInfo opportunity={{
            brand_id: application.opportunities.brand_id,
            brand: application.opportunities.brand || null
          } as any} />
        )}
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <div><span className="font-medium">Application Due:</span> {application.opportunities?.submission_deadline}</div>
        <div><span className="font-medium">Incentive:</span> {application.opportunities?.club_incentives}</div>
        <div><span className="font-medium">Activation Launch:</span> {application.opportunities?.target_launch_date}</div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 text-sm text-gray-500">
        <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
        <Button variant="outline" size="sm" asChild>
          <Link 
            to={`/opportunities/${application.opportunity_id}`}
            state={{ from: 'applications' }}
          >
            View Opportunity
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyApplicationsList;
