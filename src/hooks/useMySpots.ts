import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type ParkingSpot = Tables<'parking_spots'>;

export const useMySpots = () => {
  const { user } = useAuth();
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMySpots = async () => {
    if (!user) {
      setSpots([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpots(data || []);
    } catch (error: any) {
      console.error('Error fetching spots:', error);
      toast.error('Failed to load your parking spots');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySpots();
  }, [user]);

  const deleteSpot = async (spotId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('parking_spots')
        .delete()
        .eq('id', spotId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSpots(prev => prev.filter(spot => spot.id !== spotId));
      toast.success('Parking spot deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting spot:', error);
      toast.error('Failed to delete parking spot');
      return false;
    }
  };

  const updateSpot = async (spotId: string, updates: Partial<ParkingSpot>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .update(updates)
        .eq('id', spotId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSpots(prev => prev.map(spot => spot.id === spotId ? data : spot));
      toast.success('Parking spot updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating spot:', error);
      toast.error('Failed to update parking spot');
      return null;
    }
  };

  return {
    spots,
    isLoading,
    deleteSpot,
    updateSpot,
    refetch: fetchMySpots,
  };
};
