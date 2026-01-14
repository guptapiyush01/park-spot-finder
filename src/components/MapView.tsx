import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ParkingSpot } from '@/hooks/useParkingSpots';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapViewProps {
  userLocation: { latitude: number; longitude: number } | null;
  onSpotSelect: (spotId: string) => void;
  selectedSpotId: string | null;
  searchRadius?: number;
  spots: ParkingSpot[];
}

const MapView = ({ userLocation, onSpotSelect, selectedSpotId, searchRadius = 1, spots }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
  }, [mapboxToken, userLocation]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userEl = document.createElement('div');
    userEl.className = 'user-location-marker';
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

    map.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 15,
      duration: 1000,
    });
  }, [userLocation, mapLoaded]);

  // Draw search radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

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
  }, [userLocation, searchRadius, mapLoaded]);

  // Update parking spot markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const spotsInRange = getSpotsInRange();

    spotsInRange.forEach(spot => {
      const isSelected = spot.id === selectedSpotId;
      const isFull = spot.available === 0;
      const availabilityColor = getAvailabilityColor(spot.available, spot.total);

      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.innerHTML = `
        <div style="
          position: relative;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.2s ease;
          z-index: ${isSelected ? '100' : '10'};
        ">
          <div style="
            background: ${isSelected ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' : (isFull ? '#374151' : '#1f2937')};
            color: ${isFull ? '#9ca3af' : 'white'};
            padding: 8px 12px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
            box-shadow: ${isSelected ? '0 4px 20px rgba(139, 92, 246, 0.5)' : '0 2px 10px rgba(0,0,0,0.3)'};
            border: 2px solid ${isSelected ? '#a78bfa' : 'transparent'};
            white-space: nowrap;
            ${isFull ? 'opacity: 0.7;' : ''}
          ">
            ${isFull ? 'FULL' : `$${spot.price.toFixed(2)}/hr`}
          </div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background: ${isSelected ? '#8b5cf6' : (isFull ? '#374151' : '#1f2937')};
          "></div>
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${availabilityColor};
            border: 2px solid ${isSelected ? '#8b5cf6' : '#1f2937'};
          "></div>
          ${!isFull ? `<div style="
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
  }, [spots, selectedSpotId, mapLoaded, getSpotsInRange, onSpotSelect]);

  // Fly to selected spot
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedSpotId) return;

    const spot = spots.find(s => s.id === selectedSpotId);
    if (spot) {
      map.current.flyTo({
        center: [spot.lng, spot.lat],
        zoom: 16,
        duration: 500,
      });
    }
  }, [selectedSpotId, mapLoaded, spots]);

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

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '300px' }}
    />
  );
};

export default MapView;
