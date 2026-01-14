import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ParkingSpot } from '@/hooks/useParkingSpots';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navigation, X, Locate } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
}

const MapView = ({ 
  userLocation, 
  onSpotSelect, 
  selectedSpotId, 
  searchRadius = 1, 
  spots,
  isTracking = false,
  onStartTracking,
  onStopTracking,
  onCenterUser,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<ParkingSpot | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Mapbox token can be provided via VITE_MAPBOX_ACCESS_TOKEN (preferred) or entered once and stored locally.
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return MAPBOX_TOKEN || localStorage.getItem('mapbox_access_token') || '';
  });
  const [tokenDraft, setTokenDraft] = useState('');

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

  // Filter spots by distance
  const getSpotsInRange = useCallback(() => {
    if (!userLocation) return spots;
    return spots.filter(spot => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.lat,
        spot.lng
      );
      return distance <= searchRadius;
    });
  }, [userLocation, spots, searchRadius]);

  // Get availability color
  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return '#22c55e';
    if (ratio > 0.2) return '#eab308';
    return '#ef4444';
  };

  // Fetch and draw route using Mapbox Directions API
  const fetchRoute = useCallback(async (destination: ParkingSpot) => {
    if (!userLocation || !map.current || !mapboxToken) return;

    setIsLoadingRoute(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${mapboxToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        
        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
        });

        // Remove existing route layer if any
        if (map.current.getSource('route')) {
          map.current.removeLayer('route-line');
          map.current.removeSource('route');
        }

        // Add route to map
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#8b5cf6',
            'line-width': 5,
            'line-opacity': 0.8,
          },
        });

        // Fit map to show route
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
        bounds.extend([userLocation.longitude, userLocation.latitude]);
        bounds.extend([destination.lng, destination.lat]);
        
        map.current.fitBounds(bounds, {
          padding: { top: 100, bottom: 200, left: 50, right: 50 },
          duration: 1000,
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [userLocation, mapboxToken]);

  // Start navigation to a spot
  const startNavigation = useCallback((spot: ParkingSpot) => {
    setNavigationTarget(spot);
    if (onStartTracking) onStartTracking();
    fetchRoute(spot);
  }, [fetchRoute, onStartTracking]);

  // Stop navigation
  const stopNavigation = useCallback(() => {
    setNavigationTarget(null);
    setRouteInfo(null);
    if (onStopTracking) onStopTracking();
    
    // Remove route from map
    if (map.current) {
      if (map.current.getSource('route')) {
        map.current.removeLayer('route-line');
        map.current.removeSource('route');
      }
    }
  }, [onStopTracking]);

  // Update route when user location changes during navigation
  useEffect(() => {
    if (navigationTarget && userLocation && isTracking) {
      // Check if user is close to destination (within 50 meters)
      const distanceToTarget = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        navigationTarget.lat,
        navigationTarget.lng
      ) * 1609.34; // Convert miles to meters

      if (distanceToTarget < 50) {
        stopNavigation();
        return;
      }

      // Update route periodically
      const timeoutId = setTimeout(() => {
        fetchRoute(navigationTarget);
      }, 5000); // Update every 5 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [userLocation, navigationTarget, isTracking, fetchRoute, stopNavigation]);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken) return;
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    const initialCenter: [number, number] = userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : [-74.0060, 40.7128];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Update user location marker with heading indicator
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.longitude, userLocation.latitude]);
    } else {
      const userEl = document.createElement('div');
      userEl.className = 'user-location-marker';
      
      const heading = userLocation.heading;
      const hasHeading = heading !== null && heading !== undefined && !isNaN(heading);
      
      userEl.innerHTML = `
        <div style="position: relative; width: 48px; height: 48px;">
          <div style="
            position: absolute;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.3);
            animation: pulse 2s infinite;
          "></div>
          ${hasHeading ? `
          <div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%) rotate(${heading}deg);
            transform-origin: center bottom;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 16px solid #3b82f6;
          "></div>
          ` : ''}
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
          "></div>
        </div>
      `;

      userMarkerRef.current = new mapboxgl.Marker({ element: userEl })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current);
    }

    // Only fly to user on first location or when not navigating
    if (!navigationTarget) {
      map.current.easeTo({
        center: [userLocation.longitude, userLocation.latitude],
        duration: 500,
      });
    }
  }, [userLocation, mapLoaded, navigationTarget]);

  // Draw search radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation || navigationTarget) return;

    const sourceId = 'radius-circle';
    
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer('radius-circle-fill');
      map.current.removeLayer('radius-circle-stroke');
      map.current.removeSource(sourceId);
    }

    const radiusInKm = searchRadius * 1.60934;
    const points = 64;
    const coordinates: [number, number][] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * (2 * Math.PI);
      const dx = radiusInKm * Math.cos(angle);
      const dy = radiusInKm * Math.sin(angle);
      
      const lat = userLocation.latitude + (dy / 111.32);
      const lng = userLocation.longitude + (dx / (111.32 * Math.cos(userLocation.latitude * Math.PI / 180)));
      
      coordinates.push([lng, lat]);
    }
    coordinates.push(coordinates[0]);

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
        properties: {},
      },
    });

    map.current.addLayer({
      id: 'radius-circle-fill',
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.1,
      },
    });

    map.current.addLayer({
      id: 'radius-circle-stroke',
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-dasharray': [2, 2],
      },
    });
  }, [userLocation, searchRadius, mapLoaded, navigationTarget]);

  // Update parking spot markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const spotsInRange = getSpotsInRange();

    spotsInRange.forEach(spot => {
      const isSelected = spot.id === selectedSpotId;
      const isNavTarget = navigationTarget?.id === spot.id;
      const isFull = spot.available === 0;
      const availabilityColor = getAvailabilityColor(spot.available, spot.total);

      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.innerHTML = `
        <div style="
          position: relative;
          cursor: pointer;
          transform: ${isSelected || isNavTarget ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.2s ease;
          z-index: ${isSelected || isNavTarget ? '100' : '10'};
        ">
          <div style="
            background: ${isNavTarget ? 'linear-gradient(135deg, #22c55e, #4ade80)' : (isSelected ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' : (isFull ? '#374151' : '#1f2937'))};
            color: ${isFull ? '#9ca3af' : 'white'};
            padding: 8px 12px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
            box-shadow: ${isNavTarget ? '0 4px 20px rgba(34, 197, 94, 0.5)' : (isSelected ? '0 4px 20px rgba(139, 92, 246, 0.5)' : '0 2px 10px rgba(0,0,0,0.3)')};
            border: 2px solid ${isNavTarget ? '#4ade80' : (isSelected ? '#a78bfa' : 'transparent')};
            white-space: nowrap;
            ${isFull ? 'opacity: 0.7;' : ''}
          ">
            ${isNavTarget ? '🎯 Destination' : (isFull ? 'FULL' : `$${spot.price.toFixed(2)}/hr`)}
          </div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background: ${isNavTarget ? '#22c55e' : (isSelected ? '#8b5cf6' : (isFull ? '#374151' : '#1f2937'))};
          "></div>
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${availabilityColor};
            border: 2px solid ${isNavTarget ? '#22c55e' : (isSelected ? '#8b5cf6' : '#1f2937')};
          "></div>
          ${!isFull && !isNavTarget ? `<div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #9ca3af;
            white-space: nowrap;
          ">${spot.available} spots</div>` : ''}
        </div>
      `;

      el.addEventListener('click', () => {
        onSpotSelect(spot.id);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [spots, selectedSpotId, mapLoaded, getSpotsInRange, onSpotSelect, navigationTarget]);

  // Fly to selected spot
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedSpotId || navigationTarget) return;

    const spot = spots.find(s => s.id === selectedSpotId);
    if (spot) {
      map.current.flyTo({
        center: [spot.lng, spot.lat],
        zoom: 16,
        duration: 500,
      });
    }
  }, [selectedSpotId, mapLoaded, spots, navigationTarget]);

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  if (!mapboxToken) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden min-h-[300px] flex items-center justify-center bg-background border border-border p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">Map setup</h2>
            <p className="text-sm text-muted-foreground">
              Enter your Mapbox public access token to load the map.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              value={tokenDraft}
              onChange={(e) => setTokenDraft(e.target.value)}
              placeholder="pk.eyJ1Ijo..."
              autoComplete="off"
            />
            <Button
              type="button"
              onClick={() => {
                const next = tokenDraft.trim();
                if (!next) return;
                localStorage.setItem('mapbox_access_token', next);
                setMapboxToken(next);
              }}
            >
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Stored only in this browser (localStorage).
          </p>
        </div>
      </div>
    );
  }

  const selectedSpot = spots.find(s => s.id === selectedSpotId);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: '300px' }}
      />
      
      {/* Map controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {onCenterUser && (
          <Button
            variant="glass"
            size="icon"
            onClick={onCenterUser}
            className="rounded-xl"
          >
            <Locate className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation controls for selected spot (when not navigating) */}
      {selectedSpot && !navigationTarget && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{selectedSpot.name}</p>
              <p className="text-sm text-muted-foreground">{selectedSpot.address}</p>
            </div>
            <Button
              onClick={() => startNavigation(selectedSpot)}
              className="gap-2"
              disabled={isLoadingRoute}
            >
              <Navigation className="w-4 h-4" />
              {isLoadingRoute ? 'Loading...' : 'Navigate'}
            </Button>
          </div>
        </div>
      )}

      {/* Active navigation panel */}
      {navigationTarget && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-strong rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Navigating to</p>
                <p className="font-semibold text-foreground">{navigationTarget.name}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={stopNavigation}
                className="rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {routeInfo && (
              <div className="flex gap-4">
                <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{formatDuration(routeInfo.duration)}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-primary">{formatDistance(routeInfo.distance)}</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${navigationTarget.lat},${navigationTarget.lng}`, '_blank')}
              >
                Open in Google Maps
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live tracking indicator */}
      {isTracking && (
        <div className="absolute top-4 right-16 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Live
        </div>
      )}
    </div>
  );
};

export default MapView;
