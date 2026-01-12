import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, CreditCard, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { selectedSpot, addBooking, user } = useApp();
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicles[0]?.number || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const duration = 2;
  const totalPrice = selectedSpot ? selectedSpot.price * duration : 0;
  const serviceFee = 0.50;
  const finalTotal = totalPrice + serviceFee;

  const handleConfirmBooking = async () => {
    if (!selectedSpot) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const booking = {
      id: Date.now().toString(),
      spot: selectedSpot,
      date: 'Today',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      duration,
      totalPrice: finalTotal,
      status: 'active' as const,
      vehicleNumber,
      bookingCode: `PK${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };
    
    addBooking(booking);
    setIsProcessing(false);
    setIsConfirmed(true);
  };

  if (!selectedSpot) {
    navigate('/dashboard');
    return null;
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">Your parking spot has been reserved successfully.</p>
          
          <div className="glass rounded-2xl p-6 mb-8 w-full max-w-sm">
            <div className="text-center border-b border-border pb-4 mb-4">
              <p className="text-sm text-muted-foreground">Booking Code</p>
              <p className="text-3xl font-bold text-primary tracking-widest">PK2X8KM4</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">{selectedSpot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="font-medium text-foreground">Today, 10:00 AM</span>
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
            <Button variant="outline" size="lg" className="flex-1" onClick={() => navigate('/dashboard')}>
              Back to Map
            </Button>
            <Button size="lg" className="flex-1" onClick={() => navigate('/active-booking')}>
              View Booking
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Confirm Booking</h1>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 px-4 space-y-4"
      >
        {/* Parking info */}
        <div className="glass rounded-2xl p-4 shadow-card">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{selectedSpot.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedSpot.address}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Today, 10:00 AM - 12:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Vehicle Information
          </h3>
          <Input
            placeholder="Enter vehicle number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="h-14 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground"
          />
          {user?.vehicles && user.vehicles.length > 0 && (
            <div className="flex gap-2 mt-3">
              {user.vehicles.map((vehicle) => (
                <button
                  key={vehicle.number}
                  onClick={() => setVehicleNumber(vehicle.number)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    vehicleNumber === vehicle.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {vehicle.number}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Method
          </h3>
          <div className="flex items-center gap-4 bg-secondary rounded-xl p-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/25</p>
            </div>
            <button className="text-primary text-sm font-medium">Change</button>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-3">Price Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Parking Fee ({duration}h × ${selectedSpot.price.toFixed(2)})</span>
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

        {/* Cancellation policy */}
        <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">Free cancellation</p>
            <p className="text-muted-foreground text-sm">Cancel up to 30 minutes before your booking for a full refund.</p>
          </div>
        </div>
      </motion.div>

      {/* Confirm button */}
      <div className="p-4">
        <Button
          size="xl"
          className="w-full"
          onClick={handleConfirmBooking}
          disabled={isProcessing || !vehicleNumber}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Processing Payment...
            </div>
          ) : (
            `Confirm & Pay $${finalTotal.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
