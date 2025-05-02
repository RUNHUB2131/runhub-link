
import { useState } from "react";
import { Clock, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Application } from "@/types";

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
        <CardDescription>
          {application.opportunities?.brand?.company_name || "Unknown Brand"}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="line-clamp-2">{application.opportunities?.description || "No description available"}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 text-sm text-gray-500">
        <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
        <Button variant="outline" size="sm" asChild>
          <a href={`/opportunities/${application.opportunity_id}`}>View Opportunity</a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyApplicationsList;
