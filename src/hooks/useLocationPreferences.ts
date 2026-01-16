import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Location, getLocationByCity } from '@/data/indianLocations';

const LOCATION_STORAGE_KEY = 'parkease_selected_location';

interface LocationPreference {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export const useLocationPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localLocation, setLocalLocation] = useState<LocationPreference | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      try {
        setLocalLocation(JSON.parse(stored));
      } catch {
        localStorage.removeItem(LOCATION_STORAGE_KEY);
      }
    }
  }, []);

  // Fetch from database for logged in users
  const dbPreferenceQuery = useQuery({
    queryKey: ['location-preference', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('selected_city, selected_state')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.selected_city) {
        const location = getLocationByCity(data.selected_city);
        if (location) {
          return {
            city: location.city,
            state: location.state,
            lat: location.lat,
            lng: location.lng,
          };
        }
      }
      return null;
    },
    enabled: !!user,
  });

  // Save location mutation
  const saveLocationMutation = useMutation({
    mutationFn: async (location: Location) => {
      // Always save to localStorage
      const pref: LocationPreference = {
        city: location.city,
        state: location.state,
        lat: location.lat,
        lng: location.lng,
      };
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(pref));
      setLocalLocation(pref);

      // Save to database if logged in
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            selected_city: location.city,
            selected_state: location.state,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-preference', user?.id] });
    },
  });

  const clearLocation = useCallback(() => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setLocalLocation(null);
    if (user) {
      supabase
        .from('user_preferences')
        .update({ selected_city: null, selected_state: null })
        .eq('user_id', user.id);
      queryClient.invalidateQueries({ queryKey: ['location-preference', user?.id] });
    }
  }, [user, queryClient]);

  // Priority: DB preference (if logged in) > localStorage
  const selectedLocation = user ? (dbPreferenceQuery.data ?? localLocation) : localLocation;

  return {
    selectedLocation,
    setLocation: saveLocationMutation.mutateAsync,
    clearLocation,
    isLoading: dbPreferenceQuery.isLoading,
  };
};
