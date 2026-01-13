import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('spot_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(f => f.spot_id);
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (spotId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, spot_id: spotId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (spotId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('spot_id', spotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const isFavorite = (spotId: string) => {
    return favoritesQuery.data?.includes(spotId) ?? false;
  };

  const toggleFavorite = async (spotId: string) => {
    if (isFavorite(spotId)) {
      await removeFavorite.mutateAsync(spotId);
    } else {
      await addFavorite.mutateAsync(spotId);
    }
  };

  return {
    favorites: favoritesQuery.data ?? [],
    isLoading: favoritesQuery.isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
  };
};
