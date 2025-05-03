
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types";
import { AddOpportunityForm } from "@/components/opportunities/AddOpportunityForm";

const EditOpportunity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplications, setHasApplications] = useState(false);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id || !user) return;

      setIsLoading(true);
      try {
        // Fetch the opportunity
        const { data, error } = await supabase
          .from("opportunities")
          .select("*")
          .eq("id", id)
          .eq("brand_id", user.id)
          .single();

        if (error) throw error;
        
        // Check if there are any applications for this opportunity
        const { count, error: appError } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("opportunity_id", id);

        if (appError) throw appError;

        setHasApplications(count ? count > 0 : false);
        setOpportunity(data);

        // If there are applications, show a message and redirect
        if (count && count > 0) {
          toast({
            title: "Cannot edit opportunity",
            description: "This opportunity cannot be edited because it has received applications.",
            variant: "destructive",
          });
          navigate("/opportunities");
        }
      } catch (error: any) {
        console.error("Error fetching opportunity:", error);
        toast({
          title: "Error",
          description: "Failed to load opportunity details",
          variant: "destructive",
        });
        navigate("/opportunities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunity();
  }, [id, user, toast, navigate]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading opportunity details...</div>;
  }

  if (!opportunity) {
    return <div className="p-8 text-center">Opportunity not found or you don't have permission to edit it.</div>;
  }

  if (hasApplications) {
    return <div className="p-8 text-center">You cannot edit this opportunity as it has received applications.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Opportunity</h1>
      </div>
      <AddOpportunityForm 
        initialValues={opportunity} 
        isEditing={true}
        onSuccess={() => {
          toast({
            title: "Opportunity updated",
            description: "The opportunity has been successfully updated.",
          });
          navigate("/opportunities");
        }}
      />
    </div>
  );
};

export default EditOpportunity;
