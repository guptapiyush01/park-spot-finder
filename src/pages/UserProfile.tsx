import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Car, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Edit2,
  Plus,
  MapPin,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useBookings } from '@/hooks/useBookings';
import { useLocationPreferences } from '@/hooks/useLocationPreferences';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, vehicles, isLoading, deleteVehicle } = useProfile();
  const { bookings } = useBookings();
  const { selectedLocation } = useLocationPreferences();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteVehicle(vehicleId);
      toast.success('Vehicle removed');
    } catch (error) {
      toast.error('Failed to remove vehicle');
    }
  };

  // Calculate stats from real data
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalHours = completedBookings.reduce((acc, b) => acc + b.duration, 0);
  const totalSaved = completedBookings.reduce((acc, b) => acc + (b.total_price * 0.1), 0); // 10% savings estimate

  const menuItems = [
    { icon: CreditCard, label: 'Payment Methods', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Shield, label: 'Privacy & Security', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Get display name and email from profile or auth user
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || 'No email';
  const displayPhone = profile?.phone || user?.user_metadata?.phone || 'Not provided';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 px-4 overflow-y-auto"
      >
        {/* Profile card */}
        <div className="glass rounded-3xl p-5 shadow-glow mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg">
                <Edit2 className="w-3 h-3 text-accent-foreground" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">{displayName}</h2>
              <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
              {selectedLocation && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">{selectedLocation.city}, {selectedLocation.state}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{totalBookings}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xl font-bold text-foreground">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">₹{totalSaved.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="glass rounded-2xl p-4 mb-4 shadow-card">
          <h3 className="font-semibold text-foreground text-sm mb-3">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground truncate">{displayEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">{displayPhone}</p>
              </div>
            </div>
            {selectedLocation && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">{selectedLocation.city}, {selectedLocation.state}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicles */}
        <div className="glass rounded-2xl p-4 mb-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              My Vehicles ({vehicles.length})
            </h3>
            <Button variant="ghost" size="sm" className="text-primary h-8 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {vehicles.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Car className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No vehicles added yet</p>
                <p className="text-xs">Add a vehicle to speed up booking</p>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Car className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{vehicle.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.color && `${vehicle.color} `}{vehicle.type}
                      {vehicle.is_default && <span className="ml-1 text-primary">(Default)</span>}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menu items */}
        <div className="glass rounded-2xl overflow-hidden shadow-card mb-4">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <item.icon className="w-4 h-4 text-primary" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="lg"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground mb-4"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default UserProfile;
