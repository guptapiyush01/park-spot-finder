import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Clock, Zap, Shield, Car, ChevronDown, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParkingSpot } from '@/hooks/useParkingSpots';

const SpotDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSpot = location.state?.spot as ParkingSpot | undefined;
  
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [selectedDate] = useState('Today');
  const [selectedTime] = useState('10:00 AM');

  if (!selectedSpot) {
    navigate('/dashboard');
    return null;
  }

  const durations = [1, 2, 3, 4, 6, 8];
  const totalPrice = selectedSpot.price * selectedDuration;

  const amenityIcons: Record<string, React.ReactNode> = {
    'EV Charging': <Zap className="w-4 h-4" />,
    'Security': <Shield className="w-4 h-4" />,
    '24/7': <Clock className="w-4 h-4" />,
    'Covered': <Car className="w-4 h-4" />,
    'Valet': <Car className="w-4 h-4" />,
    'Premium': <Star className="w-4 h-4" />,
  };

  const handleBookNow = () => {
    navigate('/booking-confirm', { 
      state: { 
        spot: selectedSpot, 
        duration: selectedDuration,
        date: selectedDate,
        time: selectedTime,
        totalPrice
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative h-56 bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-20 h-20 text-primary/30" />
        </div>
        
        <Button variant="glass" size="icon" onClick={() => navigate(-1)} className="absolute top-6 left-4 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 glass rounded-xl px-3 py-2">
          <Star className="w-5 h-5 text-warning fill-warning" />
          <span className="font-bold text-foreground">{selectedSpot.rating}</span>
        </div>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 px-4 -mt-8 relative z-10">
        <div className="glass rounded-2xl p-5 shadow-card mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">{selectedSpot.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span>{selectedSpot.address}</span>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedSpot.available}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">${selectedSpot.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Per Hour</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSpot.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg">
                {amenityIcons[amenity]}
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 shadow-card mb-4">
          <h3 className="font-bold text-foreground mb-3">Select Date & Time</h3>
          <div className="flex gap-3">
            <button className="flex-1 bg-secondary rounded-xl p-4 flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground">{selectedDate}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="flex-1 bg-secondary rounded-xl p-4 flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Start Time</p>
                <p className="font-semibold text-foreground">{selectedTime}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 shadow-card mb-4">
          <h3 className="font-bold text-foreground mb-3">Parking Duration</h3>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  selectedDuration === duration
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {duration} {duration === 1 ? 'Hour' : 'Hours'}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" size="lg" className="w-full mb-4" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.lat},${selectedSpot.lng}`, '_blank')}>
          <Navigation className="w-5 h-5 mr-2" />
          Navigate to Location
        </Button>
      </motion.div>

      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-strong p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Price</p>
            <p className="text-2xl font-bold text-foreground">
              ${totalPrice.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1">for {selectedDuration}h</span>
            </p>
          </div>
          <Button size="xl" onClick={handleBookNow} disabled={selectedSpot.available === 0}>
            {selectedSpot.available === 0 ? 'Sold Out' : 'Book Now'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SpotDetails;
