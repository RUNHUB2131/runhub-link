import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import ApplicationActionButtons from "./ApplicationActionButtons";
import EmptyApplicationsState from "./EmptyApplicationsState";
import RunClubProfileDialog from "./RunClubProfileDialog";
import { PitchViewDialog } from "../PitchViewDialog";
import { MapPin, Users, Calendar } from "lucide-react";
import { Application } from "@/types";

export interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    city?: string;
    state?: string;
    member_count: number;
  } | null;
}

interface ApplicationsContentProps {
  applications: RunClubApplication[];
  isLoading: boolean;
  handleUpdateStatus: (applicationId: string, status: "accepted" | "rejected") => Promise<void>;
}

const ApplicationsContent = ({ applications, isLoading, handleUpdateStatus }: ApplicationsContentProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRunClubId, setSelectedRunClubId] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedPitch, setSelectedPitch] = useState<string>("");
  const [selectedClubName, setSelectedClubName] = useState<string>("");
  const [pitchDialogOpen, setPitchDialogOpen] = useState(false);

  // Filter applications based on active tab
  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status === "pending";
    if (activeTab === "accepted") return app.status === "accepted";
    if (activeTab === "rejected") return app.status === "rejected";
    return true;
  });

  const openRunClubProfile = (runClubId: string) => {
    setSelectedRunClubId(runClubId);
    setProfileDialogOpen(true);
  };

  const openPitchDialog = (pitch: string, clubName: string) => {
    setSelectedPitch(pitch);
    setSelectedClubName(clubName);
    setPitchDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="bg-gray-200 h-16 rounded-md"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return <EmptyApplicationsState />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({applications.filter(app => app.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({applications.filter(app => app.status === "accepted").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({applications.filter(app => app.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <p className="text-muted-foreground">No {activeTab} applications found</p>
            </div>
          ) : (
            filteredApplications.map(app => (
              <Card key={app.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">
                        {app.run_club_profile?.club_name || "Unknown Run Club"}
                      </h3>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
                      {(app.run_club_profile?.city || app.run_club_profile?.state || app.run_club_profile?.location) && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {app.run_club_profile?.city && app.run_club_profile?.state 
                            ? `${app.run_club_profile.city}, ${app.run_club_profile.state}`
                            : app.run_club_profile?.city || app.run_club_profile?.state || app.run_club_profile?.location
                          }
                        </div>
                      )}
                      
                      {app.run_club_profile?.member_count && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {app.run_club_profile.member_count} members
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openRunClubProfile(app.run_club_id)}
                    >
                      View Profile
                    </Button>
                    
                    {app.pitch && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white text-primary-500 border-primary-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-600"
                        onClick={() => openPitchDialog(app.pitch || "", app.run_club_profile?.club_name || "Unknown Club")}
                      >
                        View pitch
                      </Button>
                    )}
                    
                    <ApplicationActionButtons 
                      applicationId={app.id}
                      status={app.status}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {selectedRunClubId && (
        <RunClubProfileDialog 
          runClubId={selectedRunClubId} 
          isOpen={profileDialogOpen} 
          onOpenChange={setProfileDialogOpen} 
        />
      )}
      
      <PitchViewDialog
        isOpen={pitchDialogOpen}
        onOpenChange={setPitchDialogOpen}
        pitch={selectedPitch}
        clubName={selectedClubName}
      />
    </div>
  );
};

export default ApplicationsContent;
