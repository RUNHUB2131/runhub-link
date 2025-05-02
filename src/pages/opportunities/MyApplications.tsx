
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ListFilter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const MyApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadApplications();
    }
  }, [user?.id]);

  const loadApplications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch applications for the current run club user
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities (
            id,
            title,
            description,
            reward,
            brand_id,
            created_at
          ),
          brands: opportunities(
            brand_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq('run_club_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the data for easier access in the UI
      const formattedData = data.map(app => ({
        ...app,
        opportunity: app.opportunities,
        brand: app.brands?.brand_profiles || { company_name: "Unknown Brand" }
      }));
      
      setApplications(formattedData);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOpportunity = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Button variant="outline" className="border-[#0040FF] text-[#0040FF]">
          <ListFilter className="h-4 w-4 mr-2" />
          Filter Applications
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading applications...</div>
      ) : applications.length > 0 ? (
        <div className="border rounded-lg p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Brand</TableHead>
                <TableHead className="w-[300px]">Opportunity</TableHead>
                <TableHead className="w-[150px]">Reward</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[150px]">Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {application.brand?.logo_url ? (
                        <div className="w-8 h-8 rounded overflow-hidden mr-2 bg-gray-100 flex-shrink-0">
                          <img 
                            src={application.brand.logo_url} 
                            alt={application.brand.company_name || "Brand logo"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center mr-2 flex-shrink-0">
                          {(application.brand?.company_name?.[0] || "B").toUpperCase()}
                        </div>
                      )}
                      {application.brand?.company_name || "Unknown Brand"}
                    </div>
                  </TableCell>
                  <TableCell>{application.opportunity?.title || "Unknown Opportunity"}</TableCell>
                  <TableCell>{application.opportunity?.reward || "N/A"}</TableCell>
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
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewOpportunity(application.opportunity.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium mb-2">You haven't applied to any opportunities yet</h3>
          <p className="text-gray-500 mb-4">Browse opportunities and apply to get started</p>
          <Button onClick={() => navigate('/opportunities')} className="bg-[#0040FF] hover:bg-[#0033cc]">
            Browse Opportunities
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
