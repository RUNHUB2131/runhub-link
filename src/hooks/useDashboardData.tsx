
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/types";
import { Notification } from "@/services/notificationService";

interface DashboardStats {
  opportunities: number;
  applications: number;
}

export const useDashboardData = () => {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    opportunities: 0,
    applications: 0
  });
  const [recentActivity, setRecentActivity] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, userType]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch profile completion data
      if (userType === 'run_club') {
        const { data: profileData } = await supabase
          .from('run_club_profiles')
          .select('*')
          .eq('id', user?.id)
          .single();
          
        if (profileData) {
          calculateProfileCompletion(profileData, 'run_club');
        }
        
        // Fetch applications for run clubs
        const { data: applicationsData } = await supabase
          .from('applications')
          .select('*')
          .eq('run_club_id', user?.id);
          
        setStats(prev => ({
          ...prev,
          applications: applicationsData?.length || 0
        }));
        
        // Get all the opportunities that the run club has already applied to
        const appliedOpportunityIds = applicationsData?.map(app => app.opportunity_id) || [];
        
        // Fetch all available opportunities (exactly matching the browse opportunities page)
        const { data: availableOpportunities, error: opportunitiesError } = await supabase
          .from('opportunities')
          .select('*');
        
        if (opportunitiesError) {
          console.error("Error fetching available opportunities:", opportunitiesError);
        } else {
          // Filter out opportunities the run club has already applied for
          const filteredOpportunities = availableOpportunities.filter(
            opp => !appliedOpportunityIds.includes(opp.id)
          );
          
          setStats(prev => ({
            ...prev,
            opportunities: filteredOpportunities.length || 0
          }));
        }
      } else if (userType === 'brand') {
        const { data: profileData } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('id', user?.id)
          .single();
          
        if (profileData) {
          calculateProfileCompletion(profileData, 'brand');
        }
        
        // Fetch opportunities created by this brand
        const { data: opportunitiesData } = await supabase
          .from('opportunities')
          .select('*')
          .eq('brand_id', user?.id);
          
        setStats(prev => ({
          ...prev,
          opportunities: opportunitiesData?.length || 0
        }));
        
        // Fetch applications for opportunities created by this brand
        if (opportunitiesData?.length) {
          const opportunityIds = opportunitiesData.map(opp => opp.id);
          const { data: applicationsData } = await supabase
            .from('applications')
            .select('*')
            .in('opportunity_id', opportunityIds);
            
          setStats(prev => ({
            ...prev,
            applications: applicationsData?.length || 0
          }));
        }
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateProfileCompletion = (profileData: any, type: 'run_club' | 'brand') => {
    let totalFields = 0;
    let completedFields = 0;
    
    // Count total fields and completed fields
    Object.entries(profileData).forEach(([key, value]) => {
      // Skip id and technical fields
      if (!['id', 'created_at'].includes(key)) {
        totalFields++;
        if (value && 
            // Check for non-empty strings
            ((typeof value === 'string' && value.trim() !== '') || 
            // Check for non-zero numbers
            (typeof value === 'number' && value !== 0) ||
            // Check for non-empty objects
            (typeof value === 'object' && value !== null && Object.keys(value).length > 0))
          ) {
          completedFields++;
        }
      }
    });
    
    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    setProfileCompletionPercentage(percentage);
  };

  return {
    isLoading,
    profileCompletionPercentage,
    stats,
    recentActivity
  };
};
