import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  price: number;
  distance: string;
  rating: number;
  available: number;
  total: number;
  amenities: string[];
  lat: number;
  lng: number;
  image: string;
}

interface Booking {
  id: string;
  spot: ParkingSpot;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: 'active' | 'completed' | 'cancelled';
  vehicleNumber: string;
  bookingCode: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicles: { number: string; type: string; color: string }[];
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  parkingSpots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  activeBooking: Booking | null;
  setActiveBooking: (booking: Booking | null) => void;
}

const mockParkingSpots: ParkingSpot[] = [
  {
    id: '1',
    name: 'Downtown Central Parking',
    address: '123 Main Street, Downtown',
    price: 3.50,
    distance: '0.3 mi',
    rating: 4.8,
    available: 12,
    total: 50,
    amenities: ['EV Charging', 'Security', '24/7'],
    lat: 40.7128,
    lng: -74.0060,
    image: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'City Mall Parking',
    address: '456 Shopping Ave',
    price: 2.00,
    distance: '0.5 mi',
    rating: 4.5,
    available: 8,
    total: 120,
    amenities: ['Covered', 'Security'],
    lat: 40.7138,
    lng: -74.0080,
    image: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Metro Station Garage',
    address: '789 Transit Blvd',
    price: 4.00,
    distance: '0.2 mi',
    rating: 4.9,
    available: 25,
    total: 80,
    amenities: ['EV Charging', '24/7', 'Covered'],
    lat: 40.7118,
    lng: -74.0040,
    image: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Harbor View Parking',
    address: '321 Waterfront Dr',
    price: 5.00,
    distance: '0.8 mi',
    rating: 4.7,
    available: 4,
    total: 40,
    amenities: ['Valet', 'Security', 'Premium'],
    lat: 40.7148,
    lng: -74.0100,
    image: '/placeholder.svg'
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
    if (booking.status === 'active') {
      setActiveBooking(booking);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        hasSeenOnboarding,
        setHasSeenOnboarding,
        parkingSpots: mockParkingSpots,
        selectedSpot,
        setSelectedSpot,
        bookings,
        addBooking,
        activeBooking,
        setActiveBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
