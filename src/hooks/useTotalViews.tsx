import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ViewsPeriod } from "@/components/dashboard/StatsCards";

export const useTotalViews = (viewsPeriod: ViewsPeriod = 'all') => {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [totalViews, setTotalViews] = useState<number>(0);

  useEffect(() => {
    if (user && userType === 'brand') {
      fetchTotalViews();
    }
  }, [user, userType, viewsPeriod]);

  const fetchTotalViews = async () => {
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
        
        // Get total unique views across all opportunities with date filtering
        let viewsQuery = supabase
          .from('opportunity_views')
          .select('*', { count: 'exact', head: true })
          .in('opportunity_id', opportunityIds);

        // Add date filtering based on viewsPeriod
        if (viewsPeriod !== 'all') {
          const now = new Date();
          let startDate: string;
          
          switch (viewsPeriod) {
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
            viewsQuery = viewsQuery.gte('viewed_at', startDate);
          }
        }

        const { count: totalViewCount } = await viewsQuery;
        setTotalViews(totalViewCount || 0);
      } else {
        setTotalViews(0);
      }
    } catch (error: any) {
      console.error("Error fetching total views:", error);
      toast({
        title: "Error",
        description: "Failed to load views data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    totalViews,
    isLoading
  };
}; 