import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Navigation, Phone, QrCode, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

const ActiveBooking = () => {
  const navigate = useNavigate();
  const { activeBooking, setActiveBooking } = useApp();
  const [timeRemaining, setTimeRemaining] = useState({ hours: 1, minutes: 45, seconds: 30 });
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!activeBooking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Active Booking</h2>
          <p className="text-muted-foreground mb-6">You don't have any active parking sessions.</p>
          <Button onClick={() => navigate('/dashboard')}>Find Parking</Button>
        </div>
      </div>
    );
  }

  const handleEndSession = () => {
    setActiveBooking(null);
    navigate('/history');
  };

  const formatTime = (num: number) => num.toString().padStart(2, '0');
  const progress = ((timeRemaining.hours * 3600 + timeRemaining.minutes * 60 + timeRemaining.seconds) / (2 * 3600)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Active Booking</h1>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 px-4"
      >
        {/* Timer card */}
        <div className="glass rounded-3xl p-6 shadow-glow mb-4">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Time Remaining</p>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-secondary rounded-xl p-4 min-w-[70px]">
                <p className="text-3xl font-bold text-foreground">{formatTime(timeRemaining.hours)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <div className="bg-secondary rounded-xl p-4 min-w-[70px]">
                <p className="text-3xl font-bold text-foreground">{formatTime(timeRemaining.minutes)}</p>
                <p className="text-xs text-muted-foreground">Mins</p>
              </div>
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <div className="bg-secondary rounded-xl p-4 min-w-[70px]">
                <p className="text-3xl font-bold text-primary">{formatTime(timeRemaining.seconds)}</p>
                <p className="text-xs text-muted-foreground">Secs</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              className="h-full gradient-primary rounded-full"
            />
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Started: 10:00 AM</span>
            <span>Ends: 12:00 PM</span>
          </div>
        </div>

        {/* Booking code */}
        <div className="glass rounded-2xl p-5 mb-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Booking Code</p>
              <p className="text-2xl font-bold text-primary tracking-widest">{activeBooking.bookingCode}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowQR(!showQR)}
              className="h-14 w-14 rounded-xl"
            >
              <QrCode className="w-6 h-6" />
            </Button>
          </div>
          
          {showQR && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 p-4 bg-white rounded-xl flex items-center justify-center"
            >
              <div className="w-32 h-32 bg-[url('data:image/svg+xml,...')] grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Location info */}
        <div className="glass rounded-2xl p-5 mb-4 shadow-card">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{activeBooking.spot.name}</h3>
              <p className="text-sm text-muted-foreground">{activeBooking.spot.address}</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" size="lg">
              <Navigation className="w-4 h-4 mr-2" />
              Navigate
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>

        {/* Vehicle & payment info */}
        <div className="glass rounded-2xl p-5 mb-4 shadow-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-muted-foreground">Vehicle</span>
            <span className="font-medium text-foreground">{activeBooking.vehicleNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium text-foreground">{activeBooking.duration} Hours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="font-bold text-primary">${activeBooking.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Extend time */}
        <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-xl mb-4">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Need more time?</p>
            <p className="text-muted-foreground text-sm">Extend your booking before it expires.</p>
          </div>
          <Button variant="accent" size="sm">
            Extend
          </Button>
        </div>
      </motion.div>

      {/* End session button */}
      <div className="p-4">
        <Button variant="outline" size="xl" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleEndSession}>
          End Session Early
        </Button>
      </div>
    </div>
  );
};

export default ActiveBooking;
