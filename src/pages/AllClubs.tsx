import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllClubs } from "@/hooks/useAllClubs";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Users, Building2 } from "lucide-react";
import ClubCard from "@/components/clubs/ClubCard";
import ClubFilters from "@/components/clubs/ClubFilters";
import { ClubDetailModal } from "@/components/clubs/ClubDetailModal";
import { RunClubProfile } from "@/types";

const AllClubs = () => {
  const { user, userType } = useAuth();
  const [selectedClub, setSelectedClub] = useState<RunClubProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    clubs,
    totalCount,
    currentPage,
    totalPages,
    filters,
    availableStates,
    isLoading,
    error,
    setCurrentPage,
    updateFilters,
    clearFilters
  } = useAllClubs();

  // Only brands can access this page
  if (!user || userType !== 'brand') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleClubClick = (club: RunClubProfile) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading clubs: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Clubs</h1>
          <p className="text-muted-foreground mt-1">
            Discover and connect with running clubs
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {totalCount} clubs
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <ClubFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        availableStates={availableStates}
        isLoading={isLoading}
      />

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No clubs found</CardTitle>
            <p className="text-muted-foreground mb-4">
              {Object.keys(filters).length > 0 
                ? "Try adjusting your filters to find more clubs." 
                : "There are no clubs available at the moment."}
            </p>
            {Object.keys(filters).length > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Clubs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <ClubCard 
                key={club.id} 
                club={club} 
                onClick={() => handleClubClick(club)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Club Detail Modal */}
      <ClubDetailModal
        club={selectedClub}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default AllClubs; 