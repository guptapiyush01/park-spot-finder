import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocationPreferences } from './useLocationPreferences';

export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  city: string | null;
  price: number;
  lat: number;
  lng: number;
  rating: number;
  available: number;
  total: number;
  amenities: string[];
  image_url: string | null;
  distance?: string;
  distanceFromUser?: number;
}

export const useParkingSpots = () => {
  const { selectedLocation } = useLocationPreferences();

  return useQuery({
    queryKey: ['parking-spots', selectedLocation?.city, selectedLocation?.state],
    queryFn: async (): Promise<ParkingSpot[]> => {
      let query = supabase
        .from('parking_spots')
        .select('*')
        .order('rating', { ascending: false });

      // Filter by selected city if one is selected
      if (selectedLocation?.city) {
        query = query.ilike('city', `%${selectedLocation.city}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(spot => ({
        ...spot,
        price: Number(spot.price),
        lat: Number(spot.lat),
        lng: Number(spot.lng),
        rating: Number(spot.rating),
        distance: '0.5 km',
      }));
    },
  });
};
