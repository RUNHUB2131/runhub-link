import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAllClubs, ClubFilters, getAvailableStates } from "@/services/clubService";
import { RunClubProfile } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

export const useAllClubs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ClubFilters>({});
  const { favorites } = useFavorites();
  
  const pageSize = 20;

  // Fetch clubs data
  const {
    data: clubsResponse,
    isLoading: isClubsLoading,
    error: clubsError,
    refetch: refetchClubs
  } = useQuery({
    queryKey: ['clubs', filters, currentPage],
    queryFn: () => fetchAllClubs(filters, currentPage, pageSize),
    placeholderData: { data: [], count: 0 }
  });

  // Fetch available states
  const {
    data: availableStates = [],
    isLoading: isStatesLoading
  } = useQuery({
    queryKey: ['club-states'],
    queryFn: getAvailableStates,
    placeholderData: []
  });

  // Apply client-side favorites filtering
  let filteredClubs: RunClubProfile[] = clubsResponse?.data || [];
  let totalCount = clubsResponse?.count || 0;

  // Fix: Apply favorites filtering regardless of whether user has favorites
  if (filters.showFavoritesOnly) {
    filteredClubs = filteredClubs.filter(club => favorites.includes(club.id));
    totalCount = filteredClubs.length;
  }

  const updateFilters = (newFilters: Partial<ClubFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    clubs: filteredClubs,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    filters,
    availableStates,
    isLoading: isClubsLoading || isStatesLoading,
    error: clubsError,
    setCurrentPage,
    updateFilters,
    clearFilters,
    refetch: refetchClubs
  };
}; 