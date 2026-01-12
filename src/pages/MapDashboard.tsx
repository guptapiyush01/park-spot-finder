import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, Filter, Menu, Bell, Star, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';

const MapDashboard = () => {
  const navigate = useNavigate();
  const { parkingSpots, setSelectedSpot, activeBooking } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const handleSpotClick = (spot: typeof parkingSpots[0]) => {
    setSelectedSpot(spot);
    navigate('/spot-details');
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'bg-success';
    if (ratio > 0.2) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 pt-6 pb-4 relative z-20"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm">Your Location</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Downtown, NYC</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" size="icon" className="rounded-xl">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="icon" className="rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for parking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="secondary" size="icon" className="h-14 w-14 rounded-xl">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Map placeholder */}
      <div className="flex-1 relative bg-secondary/30 mx-4 rounded-2xl overflow-hidden">
        {/* Simulated map */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-secondary/20">
          {/* Grid pattern for map simulation */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
          
          {/* Parking markers */}
          {parkingSpots.map((spot, index) => (
            <motion.button
              key={spot.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSelectedMarkerId(spot.id);
                setSelectedSpot(spot);
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                selectedMarkerId === spot.id ? 'z-20' : 'z-10'
              }`}
              style={{
                left: `${20 + index * 20}%`,
                top: `${30 + (index % 2) * 30}%`,
              }}
            >
              <div className={`relative ${selectedMarkerId === spot.id ? 'scale-125' : ''} transition-transform`}>
                <div className={`px-3 py-2 rounded-xl font-bold text-sm shadow-lg ${
                  selectedMarkerId === spot.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card text-foreground border border-border'
                }`}>
                  ${spot.price.toFixed(2)}/hr
                </div>
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                  selectedMarkerId === spot.id ? 'bg-primary' : 'bg-card border-b border-r border-border'
                }`} />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getAvailabilityColor(spot.available, spot.total)}`} />
              </div>
            </motion.button>
          ))}

          {/* User location */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping absolute" />
              <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Locate me button */}
        <Button
          variant="glass"
          size="icon"
          className="absolute bottom-4 right-4 h-12 w-12 rounded-xl shadow-lg"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      {/* Active booking banner */}
      {activeBooking && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-4 mt-4"
        >
          <button
            onClick={() => navigate('/active-booking')}
            className="w-full glass rounded-xl p-4 flex items-center gap-4 shadow-glow border-primary/50"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-muted-foreground">Active Booking</p>
              <p className="font-semibold text-foreground">{activeBooking.spot.name}</p>
            </div>
            <div className="text-right">
              <p className="text-primary font-bold">02:45:30</p>
              <p className="text-xs text-muted-foreground">remaining</p>
            </div>
          </button>
        </motion.div>
      )}

      {/* Selected spot card */}
      <AnimatePresence>
        {selectedMarkerId && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="mx-4 mt-4"
          >
            {parkingSpots
              .filter((spot) => spot.id === selectedMarkerId)
              .map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotClick(spot)}
                  className="w-full glass rounded-2xl p-4 shadow-card text-left"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground">{spot.name}</h3>
                          <p className="text-sm text-muted-foreground">{spot.address}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-sm font-medium text-foreground">{spot.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{spot.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{spot.available} spots</span>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xl font-bold text-primary">${spot.price.toFixed(2)}</span>
                          <span className="text-muted-foreground text-sm">/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding for nav */}
      <div className="h-24" />

      <BottomNav />
    </div>
  );
};

export default MapDashboard;
