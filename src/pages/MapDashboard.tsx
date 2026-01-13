import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, Filter, Menu, Bell, Star, Clock, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import MapView from '@/components/MapView';
import { useUserLocation } from '@/hooks/useUserLocation';

const MapDashboard = () => {
  const navigate = useNavigate();
  const { parkingSpots, setSelectedSpot, activeBooking } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(1); // 1 mile default
  const { location, loading: locationLoading, requestLocation } = useUserLocation();

  const handleSpotClick = (spot: typeof parkingSpots[0]) => {
    setSelectedSpot(spot);
    navigate('/spot-details');
  };

  const handleSpotSelect = (spotId: string) => {
    setSelectedMarkerId(spotId);
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot) {
      setSelectedSpot(spot);
    }
  };

  const handleNavigateToSpot = (spot: typeof parkingSpots[0]) => {
    // Open in Google Maps or Apple Maps for navigation
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'bg-success';
    if (ratio > 0.2) return 'bg-warning';
    return 'bg-destructive';
  };

  const getLocationDisplay = () => {
    if (locationLoading) return 'Getting location...';
    if (location) return 'Current Location';
    return 'Location unavailable';
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
              {locationLoading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 text-primary" />
              )}
              <span className="font-semibold text-foreground">{getLocationDisplay()}</span>
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

        {/* Radius selector */}
        <div className="flex gap-2 mt-3">
          {[0.5, 1, 2, 5].map((radius) => (
            <Button
              key={radius}
              variant={searchRadius === radius ? 'default' : 'secondary'}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setSearchRadius(radius)}
            >
              {radius} mi
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Map */}
      <div className="flex-1 relative mx-4 rounded-2xl overflow-hidden">
        <MapView
          userLocation={location}
          onSpotSelect={handleSpotSelect}
          selectedSpotId={selectedMarkerId}
          searchRadius={searchRadius}
        />

        {/* Locate me button */}
        <Button
          variant="glass"
          size="icon"
          className="absolute bottom-4 right-4 h-12 w-12 rounded-xl shadow-lg z-10"
          onClick={requestLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </Button>

        {/* Legend */}
        <div className="absolute top-4 left-4 glass rounded-xl p-3 z-10">
          <p className="text-xs font-medium text-foreground mb-2">Availability</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground">Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Full</span>
            </div>
          </div>
        </div>
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
                <div
                  key={spot.id}
                  className="w-full glass rounded-2xl p-4 shadow-card"
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
                          <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(spot.available, spot.total)}`} />
                          <span className="text-sm text-muted-foreground">{spot.available} spots</span>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xl font-bold text-primary">${spot.price.toFixed(2)}</span>
                          <span className="text-muted-foreground text-sm">/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      className="flex-1 rounded-xl"
                      onClick={() => handleNavigateToSpot(spot)}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate
                    </Button>
                    <Button
                      className="flex-1 rounded-xl"
                      onClick={() => handleSpotClick(spot)}
                      disabled={spot.available === 0}
                    >
                      {spot.available === 0 ? 'Full' : 'Book Now'}
                    </Button>
                  </div>
                </div>
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
