import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ApplicationsPeriod = 'all' | 'week' | 'month' | 'year';

export const useTotalApplications = (applicationsPeriod: ApplicationsPeriod = 'all') => {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [totalApplications, setTotalApplications] = useState<number>(0);

  useEffect(() => {
    if (user && userType === 'brand') {
      fetchTotalApplications();
    }
  }, [user, userType, applicationsPeriod]);

  const fetchTotalApplications = async () => {
    if (!user?.id || userType !== 'brand') return;
    
    setIsLoading(true);
    
    try {
      // First get all opportunities for this brand
      const { data: opportunitiesData } = await supabase
        .from('opportunities')
        .select('id')
        .eq('brand_id', user.id);

      if (opportunitiesData?.length) {
        const opportunityIds = opportunitiesData.map(opp => opp.id);
        
        // Get total applications across all opportunities with date filtering
        let applicationsQuery = supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('opportunity_id', opportunityIds);

        // Add date filtering based on applicationsPeriod
        if (applicationsPeriod !== 'all') {
          const now = new Date();
          let startDate: string;
          
          switch (applicationsPeriod) {
            case 'week':
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
              startDate = weekStart.toISOString();
              break;
            case 'month':
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              startDate = monthStart.toISOString();
              break;
            case 'year':
              const yearStart = new Date(now.getFullYear(), 0, 1);
              startDate = yearStart.toISOString();
              break;
            default:
              startDate = '';
          }
          
          if (startDate) {
            applicationsQuery = applicationsQuery.gte('created_at', startDate);
          }
        }

        const { count: totalApplicationCount } = await applicationsQuery;
        setTotalApplications(totalApplicationCount || 0);
      } else {
        setTotalApplications(0);
      }
    } catch (error: any) {
      console.error("Error fetching total applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    totalApplications,
    isLoading
  };
}; 