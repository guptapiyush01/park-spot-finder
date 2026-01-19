import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, startOfWeek, endOfWeek } from 'date-fns';

interface BookingWithSpot {
  id: string;
  total_price: number;
  date: string;
  status: string;
  created_at: string;
  spot: {
    id: string;
    name: string;
  } | null;
}

interface SpotStats {
  spotId: string;
  spotName: string;
  totalBookings: number;
  totalEarnings: number;
}

interface DailyEarning {
  date: string;
  earnings: number;
  bookings: number;
}

interface Analytics {
  totalEarnings: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  thisWeekEarnings: number;
  averageBookingValue: number;
  spotStats: SpotStats[];
  dailyEarnings: DailyEarning[];
  recentBookings: BookingWithSpot[];
}

export const useSpotAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // First, get user's spots
      const { data: userSpots, error: spotsError } = await supabase
        .from('parking_spots')
        .select('id, name')
        .eq('user_id', user.id);

      if (spotsError) throw spotsError;

      if (!userSpots || userSpots.length === 0) {
        setAnalytics({
          totalEarnings: 0,
          totalBookings: 0,
          activeBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          thisMonthEarnings: 0,
          lastMonthEarnings: 0,
          thisWeekEarnings: 0,
          averageBookingValue: 0,
          spotStats: [],
          dailyEarnings: [],
          recentBookings: [],
        });
        setIsLoading(false);
        return;
      }

      const spotIds = userSpots.map(s => s.id);

      // Get all bookings for user's spots
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          total_price,
          date,
          status,
          created_at,
          spot_id
        `)
        .in('spot_id', spotIds)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      const thisWeekStart = startOfWeek(now);
      const thisWeekEnd = endOfWeek(now);

      // Calculate stats
      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      let lastMonthEarnings = 0;
      let thisWeekEarnings = 0;
      let activeBookings = 0;
      let completedBookings = 0;
      let cancelledBookings = 0;

      const spotStatsMap: Record<string, SpotStats> = {};
      const dailyEarningsMap: Record<string, DailyEarning> = {};

      // Initialize spot stats
      userSpots.forEach(spot => {
        spotStatsMap[spot.id] = {
          spotId: spot.id,
          spotName: spot.name,
          totalBookings: 0,
          totalEarnings: 0,
        };
      });

      // Process bookings
      (bookings || []).forEach(booking => {
        const bookingDate = parseISO(booking.date);
        const price = Number(booking.total_price) || 0;

        // Status counts
        if (booking.status === 'active') activeBookings++;
        else if (booking.status === 'completed') completedBookings++;
        else if (booking.status === 'cancelled') cancelledBookings++;

        // Only count earnings for non-cancelled bookings
        if (booking.status !== 'cancelled') {
          totalEarnings += price;

          // This month
          if (bookingDate >= thisMonthStart && bookingDate <= thisMonthEnd) {
            thisMonthEarnings += price;
          }

          // Last month
          if (bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd) {
            lastMonthEarnings += price;
          }

          // This week
          if (bookingDate >= thisWeekStart && bookingDate <= thisWeekEnd) {
            thisWeekEarnings += price;
          }

          // Spot stats
          if (spotStatsMap[booking.spot_id]) {
            spotStatsMap[booking.spot_id].totalBookings++;
            spotStatsMap[booking.spot_id].totalEarnings += price;
          }

          // Daily earnings (last 30 days)
          const dateKey = format(bookingDate, 'yyyy-MM-dd');
          if (!dailyEarningsMap[dateKey]) {
            dailyEarningsMap[dateKey] = { date: dateKey, earnings: 0, bookings: 0 };
          }
          dailyEarningsMap[dateKey].earnings += price;
          dailyEarningsMap[dateKey].bookings++;
        }
      });

      // Convert maps to arrays
      const spotStats = Object.values(spotStatsMap).sort((a, b) => b.totalEarnings - a.totalEarnings);
      
      // Get last 30 days for chart
      const dailyEarnings: DailyEarning[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subMonths(now, 0).setDate(now.getDate() - i), 'yyyy-MM-dd');
        dailyEarnings.push(dailyEarningsMap[date] || { date, earnings: 0, bookings: 0 });
      }

      // Map bookings with spot info
      const recentBookings: BookingWithSpot[] = (bookings || []).slice(0, 10).map(b => ({
        id: b.id,
        total_price: Number(b.total_price),
        date: b.date,
        status: b.status,
        created_at: b.created_at,
        spot: userSpots.find(s => s.id === b.spot_id) || null,
      }));

      const totalBookingsCount = (bookings || []).filter(b => b.status !== 'cancelled').length;

      setAnalytics({
        totalEarnings,
        totalBookings: totalBookingsCount,
        activeBookings,
        completedBookings,
        cancelledBookings,
        thisMonthEarnings,
        lastMonthEarnings,
        thisWeekEarnings,
        averageBookingValue: totalBookingsCount > 0 ? totalEarnings / totalBookingsCount : 0,
        spotStats,
        dailyEarnings,
        recentBookings,
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    analytics,
    isLoading,
    refetch: fetchAnalytics,
  };
};
