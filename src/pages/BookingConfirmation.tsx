import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, CreditCard, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ParkingSpot } from '@/hooks/useParkingSpots';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createBooking, isCreating } = useBookings();
  const { isAuthenticated } = useAuth();
  
  const bookingData = location.state as {
    spot: ParkingSpot;
    duration: number;
    date: string;
    time: string;
    totalPrice: number;
  } | undefined;

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  if (!bookingData) {
    navigate('/dashboard');
    return null;
  }

  const { spot, duration, totalPrice } = bookingData;
  const serviceFee = 0.50;
  const finalTotal = totalPrice + serviceFee;

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book');
      navigate('/auth');
      return;
    }

    if (!vehicleNumber) {
      toast.error('Please enter vehicle number');
      return;
    }

    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000);
      
      const booking = await createBooking({
        spot_id: spot.id,
        date: now.toISOString().split('T')[0],
        start_time: now.toTimeString().slice(0, 5),
        end_time: endTime.toTimeString().slice(0, 5),
        duration,
        total_price: finalTotal,
      });

      setBookingCode(booking.booking_code);
      setIsConfirmed(true);
      toast.success('Booking confirmed!');
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">Your parking spot has been reserved.</p>
          
          <div className="glass rounded-2xl p-6 mb-8 w-full max-w-sm">
            <div className="text-center border-b border-border pb-4 mb-4">
              <p className="text-sm text-muted-foreground">Booking Code</p>
              <p className="text-3xl font-bold text-primary tracking-widest">{bookingCode}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">{spot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">{duration} Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-bold text-primary">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-sm">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => navigate('/dashboard')}>Back to Map</Button>
            <Button size="lg" className="flex-1" onClick={() => navigate('/active-booking')}>View Booking</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-6 pb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Confirm Booking</h1>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 px-4 space-y-4">
        <div className="glass rounded-2xl p-4 shadow-card">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{spot.name}</h3>
              <p className="text-sm text-muted-foreground">{spot.address}</p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{duration} hours</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Vehicle Number
          </h3>
          <Input
            placeholder="Enter vehicle number (e.g., ABC 1234)"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="h-14 bg-secondary border-0 rounded-xl"
          />
        </div>

        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment (Demo)
          </h3>
          <div className="flex items-center gap-4 bg-secondary rounded-xl p-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-3">Price Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Parking Fee ({duration}h × ${spot.price.toFixed(2)})</span>
              <span className="font-medium text-foreground">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-medium text-foreground">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-xl text-primary">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground text-sm">Free cancellation up to 30 minutes before.</p>
        </div>
      </motion.div>

      <div className="p-4">
        <Button size="xl" className="w-full" onClick={handleConfirmBooking} disabled={isCreating || !vehicleNumber}>
          {isCreating ? 'Processing...' : `Confirm & Pay $${finalTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
