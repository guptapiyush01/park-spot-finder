import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';

const mockHistory = [
  {
    id: '1',
    spotName: 'Downtown Central Parking',
    address: '123 Main Street',
    date: 'Jan 10, 2026',
    time: '10:00 AM - 12:00 PM',
    duration: 2,
    totalPrice: 7.50,
    status: 'completed' as const,
  },
  {
    id: '2',
    spotName: 'City Mall Parking',
    address: '456 Shopping Ave',
    date: 'Jan 8, 2026',
    time: '2:00 PM - 4:00 PM',
    duration: 2,
    totalPrice: 4.50,
    status: 'completed' as const,
  },
  {
    id: '3',
    spotName: 'Metro Station Garage',
    address: '789 Transit Blvd',
    date: 'Jan 5, 2026',
    time: '9:00 AM - 11:00 AM',
    duration: 2,
    totalPrice: 8.50,
    status: 'cancelled' as const,
  },
  {
    id: '4',
    spotName: 'Harbor View Parking',
    address: '321 Waterfront Dr',
    date: 'Jan 3, 2026',
    time: '6:00 PM - 10:00 PM',
    duration: 4,
    totalPrice: 20.50,
    status: 'completed' as const,
  },
];

const BookingHistory = () => {
  const navigate = useNavigate();
  const { bookings } = useApp();

  const allBookings = [...bookings.filter(b => b.status !== 'active'), ...mockHistory];

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
        {allBookings.length === 0 ? (
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
            {allBookings.map((booking, index) => (
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
                          {'spotName' in booking ? booking.spotName : booking.spot.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {'address' in booking ? booking.address : booking.spot.address}
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
                        <span className="text-sm text-muted-foreground">{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {'time' in booking ? booking.time : `${booking.startTime} - ${booking.endTime}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">{booking.duration} hours</span>
                      <span className="font-bold text-primary">${booking.totalPrice.toFixed(2)}</span>
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
