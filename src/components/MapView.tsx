import { useMemo, useState } from 'react';
import { ParkingSpot } from '@/hooks/useParkingSpots';
import { Button } from '@/components/ui/button';
import { Navigation, Locate, MapPin, Star, Clock, Zap, Shield, Car, List, Map } from 'lucide-react';

interface MapViewProps {
  userLocation: { latitude: number; longitude: number; heading?: number | null } | null;
  onSpotSelect: (spotId: string) => void;
  selectedSpotId: string | null;
  searchRadius?: number;
  spots: ParkingSpot[];
  isTracking?: boolean;
  onStartTracking?: () => void;
  onStopTracking?: () => void;
  onCenterUser?: () => void;
}

const MapView = ({ 
  userLocation, 
  onSpotSelect, 
  selectedSpotId, 
  searchRadius = 1, 
  spots,
  isTracking = false,
  onCenterUser,
}: MapViewProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Calculate distance between two points in miles
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get spots with distance, sorted by proximity
  const spotsWithDistance = useMemo(() => {
    if (!userLocation) return spots.map(spot => ({ ...spot, distance: null }));
    
    return spots
      .map(spot => ({
        ...spot,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          spot.lat,
          spot.lng
        )
      }))
      .filter(spot => spot.distance !== null && spot.distance <= searchRadius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation, spots, searchRadius]);

  // Get availability color
  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'bg-success';
    if (ratio > 0.2) return 'bg-warning';
    return 'bg-destructive';
  };

  const getAvailabilityText = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'text-success';
    if (ratio > 0.2) return 'text-warning';
    return 'text-destructive';
  };

  // Format distance for display
  const formatDistance = (miles: number): string => {
    if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
    return `${miles.toFixed(1)} mi`;
  };

  const amenityIcons: Record<string, React.ReactNode> = {
    'EV Charging': <Zap className="w-3 h-3" />,
    'Security': <Shield className="w-3 h-3" />,
    '24/7': <Clock className="w-3 h-3" />,
    'Covered': <Car className="w-3 h-3" />,
    'Valet': <Car className="w-3 h-3" />,
    'Premium': <Star className="w-3 h-3" />,
  };

  const handleNavigate = (e: React.MouseEvent, spot: ParkingSpot) => {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=driving`,
      '_blank'
    );
  };

  // Generate Google Maps embed URL with markers
  const getGoogleMapsEmbedUrl = () => {
    if (!userLocation) return '';
    
    const center = `${userLocation.latitude},${userLocation.longitude}`;
    const zoom = 14;
    
    // Create a static map URL showing the area
    // Using embed mode with place to show the user's location area
    return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${center}&zoom=${zoom}&maptype=roadmap`;
  };

  // Generate static map with markers for all spots
  const getStaticMapUrl = () => {
    if (!userLocation) return '';
    
    const center = `${userLocation.latitude},${userLocation.longitude}`;
    const markers = spotsWithDistance.slice(0, 10).map((spot, index) => 
      `markers=color:red%7Clabel:${index + 1}%7C${spot.lat},${spot.lng}`
    ).join('&');
    
    const userMarker = `markers=color:blue%7Clabel:U%7C${userLocation.latitude},${userLocation.longitude}`;
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=14&size=600x400&maptype=roadmap&${userMarker}&${markers}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header with location status and view toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-t-2xl border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-success animate-pulse' : 'bg-muted'}`} />
          <span className="text-sm text-muted-foreground">
            {userLocation ? 'Live location active' : 'Location unavailable'}
          </span>
          {isTracking && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium">
              Tracking
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* View toggle */}
          <div className="flex bg-muted rounded-lg p-0.5">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 px-2 gap-1"
            >
              <List className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">List</span>
            </Button>
            <Button
              variant={viewMode === 'map' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="h-7 px-2 gap-1"
            >
              <Map className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Map</span>
            </Button>
          </div>
          {onCenterUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCenterUser}
              className="gap-1 text-xs h-7"
            >
              <Locate className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content area */}
      {viewMode === 'map' ? (
        /* Google Maps embed view */
        <div className="flex-1 flex flex-col overflow-hidden">
          {userLocation ? (
            <>
              <div className="flex-1 relative">
                <iframe
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={getGoogleMapsEmbedUrl()}
                  allowFullScreen
                />
                {/* Overlay with spot markers legend */}
                <div className="absolute bottom-2 left-2 right-2 bg-background/95 backdrop-blur-sm rounded-lg p-2 max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Nearby Parking ({spotsWithDistance.length})
                  </p>
                  <div className="space-y-1">
                    {spotsWithDistance.slice(0, 5).map((spot, index) => (
                      <button
                        key={spot.id}
                        onClick={() => onSpotSelect(spot.id)}
                        className={`w-full flex items-center gap-2 text-left p-1.5 rounded-md transition-colors ${
                          selectedSpotId === spot.id ? 'bg-primary/10' : 'hover:bg-secondary'
                        }`}
                      >
                        <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{spot.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {spot.distance !== null ? formatDistance(spot.distance) : ''} • ${spot.price}/hr
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => handleNavigate(e, spot)}
                        >
                          <Navigation className="w-3 h-3" />
                        </Button>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Location required</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Enable location to view the map
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List view */
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {spotsWithDistance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MapPin className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">No parking spots found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try increasing the search radius or check your location
              </p>
            </div>
          ) : (
            spotsWithDistance.map((spot) => {
              const isSelected = spot.id === selectedSpotId;
              const isFull = spot.available === 0;

              return (
                <button
                  key={spot.id}
                  onClick={() => onSpotSelect(spot.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-primary/10 border-2 border-primary shadow-md' 
                      : 'bg-card border border-border hover:border-primary/50'
                  } ${isFull ? 'opacity-60' : ''}`}
                >
                  <div className="flex gap-3">
                    {/* Distance indicator */}
                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      }`}>
                        <Navigation className="w-5 h-5" />
                      </div>
                      {spot.distance !== null && (
                        <span className="text-xs font-medium text-muted-foreground mt-1">
                          {formatDistance(spot.distance)}
                        </span>
                      )}
                    </div>

                    {/* Spot info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{spot.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{spot.address}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-sm font-medium">{spot.rating}</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {spot.amenities.slice(0, 3).map(amenity => (
                          <span 
                            key={amenity} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full"
                          >
                            {amenityIcons[amenity]}
                            {amenity}
                          </span>
                        ))}
                        {spot.amenities.length > 3 && (
                          <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full">
                            +{spot.amenities.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Price and availability */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(spot.available, spot.total)}`} />
                          <span className={`text-sm font-medium ${getAvailabilityText(spot.available, spot.total)}`}>
                            {isFull ? 'Full' : `${spot.available} spots`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">${spot.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigate button */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground"
                        onClick={(e) => handleNavigate(e, spot)}
                      >
                        <Navigation className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Summary footer */}
      <div className="p-3 bg-secondary/50 rounded-b-2xl border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {spotsWithDistance.length} spots within {searchRadius} mi
          </span>
          {spotsWithDistance.length > 0 && (
            <span className="text-muted-foreground">
              Nearest: {spotsWithDistance[0]?.distance !== null 
                ? formatDistance(spotsWithDistance[0].distance!) 
                : 'N/A'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
