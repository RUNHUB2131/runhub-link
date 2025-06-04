import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserType } from "@/types";
import { LayoutGrid, Users, Eye, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export type ViewsPeriod = 'all' | 'week' | 'month' | 'year';

interface StatsCardsProps {
  userType: UserType;
  isLoading: boolean;
  stats: {
    opportunities: number;
    applications: number;
  };
  totalViews?: number;
  totalViewsLoading?: boolean;
  viewsPeriod?: ViewsPeriod;
  onViewsPeriodChange?: (period: ViewsPeriod) => void;
}

export const StatsCards = ({ 
  userType, 
  isLoading, 
  stats, 
  totalViews = 0,
  totalViewsLoading = false,
  viewsPeriod: propViewsPeriod, 
  onViewsPeriodChange 
}: StatsCardsProps) => {
  const navigate = useNavigate();
  const [localViewsPeriod, setLocalViewsPeriod] = useState<ViewsPeriod>('all');

  // Use prop if provided, otherwise use local state
  const currentViewsPeriod = propViewsPeriod || localViewsPeriod;

  // Load views period from localStorage on mount
  useEffect(() => {
    const savedPeriod = localStorage.getItem('dashboardViewsPeriod') as ViewsPeriod;
    if (savedPeriod && ['all', 'week', 'month', 'year'].includes(savedPeriod)) {
      setLocalViewsPeriod(savedPeriod);
      onViewsPeriodChange?.(savedPeriod);
    }
  }, [onViewsPeriodChange]);

  const handleViewsPeriodChange = (period: ViewsPeriod) => {
    setLocalViewsPeriod(period);
    localStorage.setItem('dashboardViewsPeriod', period);
    onViewsPeriodChange?.(period);
  };

  const getViewsPeriodLabel = (period: ViewsPeriod) => {
    switch (period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  const handleOpportunitiesClick = () => {
    navigate("/opportunities");
  };

  const handleApplicationsClick = () => {
    if (userType === 'brand') {
      // Navigate to the brand's opportunities management page
      navigate("/opportunities");
    } else {
      // For run clubs, navigate to their applications
      navigate("/applications");
    }
  };

  if (userType === 'run_club') {
    return (
      <div className="flex flex-col gap-6">
        <Card 
          className="shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={handleOpportunitiesClick}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Open Opportunities</CardTitle>
              <LayoutGrid className="h-5 w-5 text-primary-500" />
            </div>
            <CardDescription>Find sponsorship opportunities for your club</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-500">
              {isLoading ? <Skeleton className="h-10 w-16" /> : stats.opportunities}
            </div>
          </CardContent>
        </Card>
        <Card 
          className="shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={handleApplicationsClick}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Applications</CardTitle>
              <Users className="h-5 w-5 text-primary-500" />
            </div>
            <CardDescription>Track your open applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-500">
              {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card 
        className="shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
        onClick={handleOpportunitiesClick}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Campaigns</CardTitle>
            <LayoutGrid className="h-5 w-5 text-primary-500" />
          </div>
          <CardDescription>Your currently active sponsorship opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary-500">
            {isLoading ? <Skeleton className="h-10 w-16" /> : stats.opportunities}
          </div>
        </CardContent>
      </Card>
      <Card 
        className="shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
        onClick={handleApplicationsClick}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>New Applications</CardTitle>
            <Users className="h-5 w-5 text-primary-500" />
          </div>
          <CardDescription>Applications waiting for your review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary-500">
            {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Total Views</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleViewsPeriodChange('all')}>
                    All Time
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewsPeriodChange('week')}>
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewsPeriodChange('month')}>
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewsPeriodChange('year')}>
                    This Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Eye className="h-5 w-5 text-primary-500" />
          </div>
          <CardDescription>
            Unique views across all your opportunities - {getViewsPeriodLabel(currentViewsPeriod)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`text-3xl font-bold text-primary-500 transition-opacity duration-300 ${
              totalViewsLoading ? 'opacity-50' : 'opacity-100'
            }`}>
              {totalViews || 0}
            </div>
            {totalViewsLoading && (
              <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
