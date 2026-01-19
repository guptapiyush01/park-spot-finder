import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
  ParkingCircle,
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useSpotAnalytics } from '@/hooks/useSpotAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const EarningsDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { analytics, isLoading } = useSpotAnalytics();

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate('/auth');
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const monthlyGrowth = analytics?.lastMonthEarnings 
    ? ((analytics.thisMonthEarnings - analytics.lastMonthEarnings) / analytics.lastMonthEarnings) * 100
    : 0;

  const hasSpots = analytics && analytics.spotStats.length > 0;

  // Format chart data
  const chartData = analytics?.dailyEarnings.map(d => ({
    date: format(parseISO(d.date), 'dd MMM'),
    earnings: d.earnings,
    bookings: d.bookings,
  })) || [];

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Earnings Dashboard</h1>
        </div>
      </div>

      {!hasSpots ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <ParkingCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No Parking Spots Yet</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Add your first parking spot to start tracking earnings and bookings
          </p>
          <Button onClick={() => navigate('/add-spot')} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Parking Spot
          </Button>
        </motion.div>
      ) : (
        <div className="px-4 pt-4 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-4 h-4 opacity-80" />
                    <span className="text-sm opacity-80">Total Earnings</span>
                  </div>
                  <p className="text-2xl font-bold">₹{analytics?.totalEarnings.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">This Month</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">₹{analytics?.thisMonthEarnings.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${monthlyGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {monthlyGrowth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{Math.abs(monthlyGrowth).toFixed(1)}% vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Bookings</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{analytics?.totalBookings}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Avg. Booking</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">₹{analytics?.averageBookingValue.toFixed(0)}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Earnings (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }}
                        formatter={(value: number) => [`₹${value}`, 'Earnings']}
                      />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEarnings)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-success/10">
                    <p className="text-2xl font-bold text-success">{analytics?.completedBookings}</p>
                    <p className="text-xs text-muted-foreground mt-1">Completed</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-primary/10">
                    <p className="text-2xl font-bold text-primary">{analytics?.activeBookings}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-destructive/10">
                    <p className="text-2xl font-bold text-destructive">{analytics?.cancelledBookings}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Spot Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Spot Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.spotStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bookings yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics?.spotStats.map((spot, index) => (
                      <div 
                        key={spot.spotId}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{spot.spotName}</p>
                            <p className="text-xs text-muted-foreground">{spot.totalBookings} bookings</p>
                          </div>
                        </div>
                        <p className="font-semibold text-primary">₹{spot.totalEarnings.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.recentBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bookings yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics?.recentBookings.slice(0, 5).map((booking) => (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium text-foreground text-sm">{booking.spot?.name || 'Unknown Spot'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(booking.date), 'dd MMM yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">₹{booking.total_price}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            booking.status === 'completed' 
                              ? 'bg-success/10 text-success' 
                              : booking.status === 'active'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EarningsDashboard;
