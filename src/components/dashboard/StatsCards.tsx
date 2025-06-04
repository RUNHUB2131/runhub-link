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
import { LayoutGrid, Users, Eye, ChevronDown, Loader2, FileText, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ApplicationsPeriod } from "@/hooks/useTotalApplications";

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
  totalApplications?: number;
  totalApplicationsLoading?: boolean;
  applicationsPeriod?: ApplicationsPeriod;
  onApplicationsPeriodChange?: (period: ApplicationsPeriod) => void;
}

export const StatsCards = ({ 
  userType, 
  isLoading, 
  stats, 
  totalViews = 0,
  totalViewsLoading = false,
  viewsPeriod: propViewsPeriod, 
  onViewsPeriodChange,
  totalApplications = 0,
  totalApplicationsLoading = false,
  applicationsPeriod: propApplicationsPeriod,
  onApplicationsPeriodChange
}: StatsCardsProps) => {
  const navigate = useNavigate();
  const [localViewsPeriod, setLocalViewsPeriod] = useState<ViewsPeriod>('all');
  const [localApplicationsPeriod, setLocalApplicationsPeriod] = useState<ApplicationsPeriod>('all');

  // Use prop if provided, otherwise use local state
  const currentViewsPeriod = propViewsPeriod || localViewsPeriod;
  const currentApplicationsPeriod = propApplicationsPeriod || localApplicationsPeriod;

  // Load periods from localStorage on mount
  useEffect(() => {
    const savedViewsPeriod = localStorage.getItem('dashboardViewsPeriod') as ViewsPeriod;
    if (savedViewsPeriod && ['all', 'week', 'month', 'year'].includes(savedViewsPeriod)) {
      setLocalViewsPeriod(savedViewsPeriod);
      onViewsPeriodChange?.(savedViewsPeriod);
    }

    const savedApplicationsPeriod = localStorage.getItem('dashboardApplicationsPeriod') as ApplicationsPeriod;
    if (savedApplicationsPeriod && ['all', 'week', 'month', 'year'].includes(savedApplicationsPeriod)) {
      setLocalApplicationsPeriod(savedApplicationsPeriod);
      onApplicationsPeriodChange?.(savedApplicationsPeriod);
    }
  }, [onViewsPeriodChange, onApplicationsPeriodChange]);

  const handleViewsPeriodChange = (period: ViewsPeriod) => {
    setLocalViewsPeriod(period);
    localStorage.setItem('dashboardViewsPeriod', period);
    onViewsPeriodChange?.(period);
  };

  const handleApplicationsPeriodChange = (period: ApplicationsPeriod) => {
    setLocalApplicationsPeriod(period);
    localStorage.setItem('dashboardApplicationsPeriod', period);
    onApplicationsPeriodChange?.(period);
  };

  const getViewsPeriodLabel = (period: ViewsPeriod) => {
    switch (period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  const getApplicationsPeriodLabel = (period: ApplicationsPeriod) => {
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
      navigate("/opportunities");
    } else {
      navigate("/applications");
    }
  };

  if (userType === 'run_club') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer"
          onClick={handleOpportunitiesClick}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between h-8">
              <CardTitle className="text-xl font-semibold">Available Opportunities</CardTitle>
              <LayoutGrid className="h-6 w-6 text-primary-600" />
            </div>
            <CardDescription className="text-gray-600 h-12 flex items-center">
              Sponsorship opportunities waiting for your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20 mb-2" />
            ) : (
              <div className="text-5xl font-bold text-primary-600 mb-2 h-16 flex items-center">{stats.opportunities}</div>
            )}
            <div className="flex items-center gap-1 mt-4">
              <p className="text-sm text-gray-500 font-medium">New opportunities available</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer"
          onClick={handleApplicationsClick}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between h-8">
              <CardTitle className="text-xl font-semibold">My Applications</CardTitle>
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <CardDescription className="text-gray-600 h-12 flex items-center">
              Track your applications and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20 mb-2" />
            ) : (
              <div className="text-5xl font-bold text-primary-600 mb-2 h-16 flex items-center">{stats.applications}</div>
            )}
            <div className="flex items-center gap-1 mt-4">
              <p className="text-sm text-gray-500 font-medium">Applications submitted</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Opportunities Card */}
      <Card 
        className="bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer"
        onClick={handleOpportunitiesClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between h-8">
            <CardTitle className="text-xl font-semibold">Active Opportunities</CardTitle>
            <LayoutGrid className="h-6 w-6 text-primary-600" />
          </div>
          <CardDescription className="text-gray-600 h-12 flex items-center">
            Live sponsorship opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-12 w-20 mb-2" />
          ) : (
            <div className="text-5xl font-bold text-primary-600 mb-2 h-16 flex items-center">{stats.opportunities}</div>
          )}
          <div className="flex items-center gap-1 mt-4">
            <p className="text-sm text-gray-500 font-medium">Opportunities created</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Views Card */}
      <Card 
        className="bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer"
        onClick={handleOpportunitiesClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">Opportunity Views</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-1">
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleViewsPeriodChange('all');
                  }}>
                    All Time
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleViewsPeriodChange('week');
                  }}>
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleViewsPeriodChange('month');
                  }}>
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleViewsPeriodChange('year');
                  }}>
                    This Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Eye className="h-6 w-6 text-primary-600" />
          </div>
          <CardDescription className="text-gray-600 h-12 flex items-center">
            {getViewsPeriodLabel(currentViewsPeriod)} • Reach & Interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 h-16">
            <div className={`text-5xl font-bold text-primary-600 transition-opacity duration-300 ${
              totalViewsLoading ? 'opacity-50' : 'opacity-100'
            }`}>
              {totalViews || 0}
            </div>
            {totalViewsLoading && (
              <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-1 mt-4">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <p className="text-sm text-gray-500 font-medium">Unique club views</p>
          </div>
        </CardContent>
      </Card>

      {/* Club Applications Card */}
      <Card 
        className="bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer"
        onClick={handleOpportunitiesClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">Applications</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-1">
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleApplicationsPeriodChange('all');
                  }}>
                    All Time
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleApplicationsPeriodChange('week');
                  }}>
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleApplicationsPeriodChange('month');
                  }}>
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleApplicationsPeriodChange('year');
                  }}>
                    This Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <CardDescription className="text-gray-600 h-12 flex items-center">
            {getApplicationsPeriodLabel(currentApplicationsPeriod)} • Quality Leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 h-16">
            <div className={`text-5xl font-bold text-primary-600 transition-opacity duration-300 ${
              totalApplicationsLoading ? 'opacity-50' : 'opacity-100'
            }`}>
              {totalApplications || 0}
            </div>
            {totalApplicationsLoading && (
              <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-1 mt-4">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <p className="text-sm text-gray-500 font-medium">From interested clubs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
