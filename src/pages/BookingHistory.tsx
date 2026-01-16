import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, CheckCircle2, XCircle, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/useBookings';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';

const BookingHistory = () => {
  const navigate = useNavigate();
  const { bookings, isLoading } = useBookings();

  // Filter out active bookings - show only completed and cancelled
  const historyBookings = bookings.filter(b => b.status !== 'active');

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Booking History</h1>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 px-4"
      >
        {historyBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground mb-6">Your booking history will appear here.</p>
            <Button onClick={() => navigate('/dashboard')}>Find Parking</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {historyBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-4 shadow-card"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground truncate">
                          {booking.spot?.name ?? 'Unknown Spot'}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {booking.spot?.address ?? 'No address'}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0 ${
                        booking.status === 'completed'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {booking.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium capitalize">{booking.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">{booking.duration} hours</span>
                      <span className="font-bold text-primary">₹{booking.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default BookingHistory;
