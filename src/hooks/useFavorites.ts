import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FAVORITES_KEY = "runhub_favorite_clubs";

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  // Load localStorage favorites on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setLocalFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading localStorage favorites:", error);
    }
  }, []);

  // Save localStorage favorites whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(localFavorites));
    } catch (error) {
      console.error("Error saving localStorage favorites:", error);
    }
  }, [localFavorites]);

  // Fetch favorites from database
  const { data: dbFavorites = [], isLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('club_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        return [];
      }
      
      return data.map(item => item.club_id);
    },
    enabled: !!user?.id,
    placeholderData: []
  });

  // Use database favorites if user is authenticated, otherwise use localStorage
  const favorites = user?.id ? dbFavorites : localFavorites;

  // Migration from localStorage to database (one-time)
  useEffect(() => {
    const migrateFromLocalStorage = async () => {
      if (!user?.id || hasInitialized) return;
      
      try {
        if (localFavorites.length > 0 && dbFavorites.length === 0) {
          console.log('Migrating favorites from localStorage to database...');
          
          // Insert each favorite
          for (const clubId of localFavorites) {
            await supabase
              .from('user_favorites')
              .insert({
                user_id: user.id,
                club_id: clubId
              })
              .select()
              .single();
          }
          
          // Refresh favorites data
          queryClient.invalidateQueries({ queryKey: ['user-favorites', user.id] });
          
          // Clear localStorage after successful migration
          setLocalFavorites([]);
          console.log('Migration completed successfully');
        }
      } catch (error) {
        console.error('Error migrating favorites:', error);
      } finally {
        setHasInitialized(true);
      }
    };

    if (user?.id && !isLoading) {
      migrateFromLocalStorage();
    }
  }, [user?.id, localFavorites.length, dbFavorites.length, hasInitialized, isLoading, queryClient]);

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (clubId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          club_id: clubId
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites', user?.id] });
    },
    onError: (error) => {
      console.error('Error adding favorite:', error);
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (clubId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('club_id', clubId);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites', user?.id] });
    },
    onError: (error) => {
      console.error('Error removing favorite:', error);
    }
  });

  const isFavorite = (clubId: string) => favorites.includes(clubId);

  const toggleFavorite = async (clubId: string) => {
    if (!user?.id) {
      // Fallback to localStorage when not authenticated
      setLocalFavorites(prev => 
        prev.includes(clubId) 
          ? prev.filter(id => id !== clubId)
          : [...prev, clubId]
      );
      return;
    }
    
    try {
      if (isFavorite(clubId)) {
        await removeFavoriteMutation.mutateAsync(clubId);
      } else {
        await addFavoriteMutation.mutateAsync(clubId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading: isLoading || addFavoriteMutation.isPending || removeFavoriteMutation.isPending
  };
}; 