
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const [stats, setStats] = useState({
    opportunities: 0,
    applications: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    message: string;
    timestamp: string;
  }>>([]);

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
      
      // For simplicity, we don't have a real activity log table yet
      // In a real application, you would fetch from an activity log table
      // This is a placeholder for now
      setRecentActivity([]);
      
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your {userType === 'run_club' ? 'Run Club' : 'Brand'} dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Add more details to your profile to increase visibility</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-2 w-full" />
            ) : (
              <>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ width: `${profileCompletionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-2">{profileCompletionPercentage}% complete</p>
              </>
            )}
          </CardContent>
        </Card>

        {userType === 'run_club' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Open Opportunities</CardTitle>
                <CardDescription>Find sponsorship opportunities for your club</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-16" /> : "—"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Track your open applications</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Your currently active sponsorship opportunities</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-16" /> : stats.opportunities}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New Applications</CardTitle>
                <CardDescription>Applications waiting for your review</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <h2 className="text-2xl font-bold mt-12">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : recentActivity.length > 0 ? (
          recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-medium">{activity.message}</p>
                <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
              <Button>View</Button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No recent activity to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Button = ({ children, ...props }) => (
  <button 
    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
    {...props}
  >
    {children}
  </button>
);

export default Dashboard;
