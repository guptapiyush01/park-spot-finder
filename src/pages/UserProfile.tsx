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
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, setUser, setIsAuthenticated } = useApp();

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    navigate('/auth');
  };

  const menuItems = [
    { icon: User, label: 'Personal Information', action: () => {} },
    { icon: Car, label: 'My Vehicles', action: () => {}, badge: user?.vehicles?.length },
    { icon: CreditCard, label: 'Payment Methods', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Shield, label: 'Privacy & Security', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
  ];

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
        className="flex-1 px-4"
      >
        {/* Profile card */}
        <div className="glass rounded-3xl p-6 shadow-glow mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
                <Edit2 className="w-4 h-4 text-accent-foreground" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name || 'John Doe'}</h2>
              <p className="text-muted-foreground">{user?.email || 'john@example.com'}</p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Bookings</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-foreground">48h</p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">$156</p>
              <p className="text-sm text-muted-foreground">Saved</p>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="glass rounded-2xl p-4 mb-4 shadow-card">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Mail className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user?.email || 'john@example.com'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Phone className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{user?.phone || '+1 234 567 8900'}</p>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="glass rounded-2xl p-4 mb-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              My Vehicles
            </h3>
            <Button variant="ghost" size="sm" className="text-primary">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {(user?.vehicles || [{ number: 'ABC 1234', type: 'Sedan', color: 'Black' }]).map((vehicle, index) => (
              <div key={index} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{vehicle.number}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.color} {vehicle.type}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="glass rounded-2xl overflow-hidden shadow-card mb-4">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="lg"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default UserProfile;
