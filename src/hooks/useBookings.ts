import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Booking {
  id: string;
  user_id: string;
  spot_id: string;
  vehicle_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_price: number;
  status: 'active' | 'completed' | 'cancelled';
  booking_code: string;
  created_at: string;
  spot?: {
    id: string;
    name: string;
    address: string;
    price: number;
    lat: number;
    lng: number;
  };
}

export const useBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async (): Promise<Booking[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          spot:parking_spots(id, name, address, price, lat, lng)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(booking => ({
        ...booking,
        total_price: Number(booking.total_price),
        spot: booking.spot ? {
          ...booking.spot,
          price: Number(booking.spot.price),
          lat: Number(booking.spot.lat),
          lng: Number(booking.spot.lng),
        } : undefined,
      })) as Booking[];
    },
    enabled: !!user,
  });

  const activeBooking = bookingsQuery.data?.find(b => b.status === 'active');

  const createBooking = useMutation({
    mutationFn: async (booking: {
      spot_id: string;
      date: string;
      start_time: string;
      end_time: string;
      duration: number;
      total_price: number;
      vehicle_id?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const bookingCode = `PK${Date.now().toString(36).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          ...booking,
          booking_code: bookingCode,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: 'active' | 'completed' | 'cancelled' }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
    },
  });

  return {
    bookings: bookingsQuery.data ?? [],
    activeBooking,
    isLoading: bookingsQuery.isLoading,
    createBooking: createBooking.mutateAsync,
    updateBookingStatus: updateBookingStatus.mutate,
    isCreating: createBooking.isPending,
  };
};
