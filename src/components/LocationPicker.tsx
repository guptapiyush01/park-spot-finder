import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Navigation, Check, History, Star } from 'lucide-react';
import { Location, searchLocations, popularLocations } from '@/data/indianLocations';
import { motion } from 'framer-motion';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: { city: string; state: string } | null;
  onLocationSelect: (location: Location) => void;
  onUseCurrentLocation: () => void;
}

const LocationPicker = ({
  isOpen,
  onClose,
  selectedLocation,
  onLocationSelect,
  onUseCurrentLocation,
}: LocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = useMemo(() => {
    return searchLocations(searchQuery);
  }, [searchQuery]);

  const popularCities = popularLocations.slice(0, 8);
  const recentCities = popularLocations.slice(8, 13);

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    onUseCurrentLocation();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <SheetTitle className="text-xl">Select Location</SheetTitle>
          </SheetHeader>

          <div className="px-6 py-4 border-b border-border">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search city, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-secondary border-0 rounded-xl"
              />
            </div>

            {/* Use Current Location */}
            <Button
              variant="ghost"
              className="w-full mt-3 h-14 justify-start gap-3 text-primary hover:bg-primary/10 rounded-xl"
              onClick={handleUseCurrentLocation}
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium">Use Current Location</p>
                <p className="text-xs text-muted-foreground">Based on GPS</p>
              </div>
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {searchQuery ? (
                // Search Results
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {filteredLocations.length} results found
                  </p>
                  <div className="space-y-2">
                    {filteredLocations.map((location, index) => (
                      <motion.button
                        key={`${location.city}-${location.state}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleLocationClick(location)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                      >
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{location.city}</p>
                          <p className="text-sm text-muted-foreground">{location.state}</p>
                        </div>
                        {selectedLocation?.city === location.city && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                // Default View
                <>
                  {/* Popular Cities */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-warning" />
                      <h3 className="font-semibold text-foreground">Popular Cities</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {popularCities.map((location, index) => (
                        <motion.button
                          key={location.city}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleLocationClick(location)}
                          className={`flex items-center gap-2 p-3 rounded-xl transition-colors text-left ${
                            selectedLocation?.city === location.city
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium truncate">{location.city}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Locations */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">More Cities</h3>
                    </div>
                    <div className="space-y-2">
                      {recentCities.map((location, index) => (
                        <motion.button
                          key={location.city}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          onClick={() => handleLocationClick(location)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                        >
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{location.city}</p>
                            <p className="text-sm text-muted-foreground">{location.state}</p>
                          </div>
                          {selectedLocation?.city === location.city && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* All States hint */}
                  <p className="text-sm text-muted-foreground text-center">
                    Search for any city or village in India
                  </p>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationPicker;
