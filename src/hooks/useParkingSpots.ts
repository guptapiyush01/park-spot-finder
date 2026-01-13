import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
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
  return useQuery({
    queryKey: ['parking-spots'],
    queryFn: async (): Promise<ParkingSpot[]> => {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;

      return data.map(spot => ({
        ...spot,
        price: Number(spot.price),
        lat: Number(spot.lat),
        lng: Number(spot.lng),
        rating: Number(spot.rating),
        distance: '0.5 mi', // Will be calculated client-side
      }));
    },
  });
};
