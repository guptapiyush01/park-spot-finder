import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  History,
  Heart,
  Car,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  Shield,
  Star,
  Gift,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  badge?: string;
}

const SideMenu = ({ isOpen, onClose }: SideMenuProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const { profile } = useProfile();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/auth');
  };

  const mainMenuItems: MenuItem[] = [
    {
      icon: <User className="w-5 h-5" />,
      label: 'My Profile',
      description: 'Manage your account',
      onClick: () => handleNavigation('/profile'),
    },
    {
      icon: <History className="w-5 h-5" />,
      label: 'Booking History',
      description: 'View past bookings',
      onClick: () => handleNavigation('/history'),
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Active Booking',
      description: 'Current parking session',
      onClick: () => handleNavigation('/active-booking'),
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: 'Saved Spots',
      description: 'Your favorite locations',
      onClick: () => handleNavigation('/dashboard'),
    },
    {
      icon: <Car className="w-5 h-5" />,
      label: 'My Vehicles',
      description: 'Manage your vehicles',
      onClick: () => handleNavigation('/profile'),
    },
  ];

  const secondaryMenuItems: MenuItem[] = [
    {
      icon: <Gift className="w-5 h-5" />,
      label: 'Offers & Rewards',
      description: 'Exclusive deals',
      onClick: () => handleNavigation('/dashboard'),
      badge: 'New',
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'Rate Us',
      description: 'Share your feedback',
      onClick: () => window.open('https://play.google.com', '_blank'),
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help & Support',
      description: 'FAQs and contact',
      onClick: () => handleNavigation('/dashboard'),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Privacy Policy',
      description: 'Your data security',
      onClick: () => handleNavigation('/dashboard'),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      description: 'App preferences',
      onClick: () => handleNavigation('/profile'),
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-sm p-0 overflow-y-auto">
        <div className="flex flex-col min-h-full">
          {/* Header */}
          <SheetHeader className="p-6 bg-gradient-to-br from-primary/20 to-primary/5">
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h2 className="font-bold text-lg text-foreground">
                    {profile?.name || 'Welcome!'}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {user?.email}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary text-sm"
                    onClick={() => handleNavigation('/profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-left"
              >
                <h2 className="font-bold text-xl text-foreground mb-2">Welcome to ParkEase</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to access all features
                </p>
                <Button onClick={() => handleNavigation('/auth')} className="rounded-xl">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </motion.div>
            )}
          </SheetHeader>

          {/* Dark Mode Toggle */}
          <div className="px-6 py-4 border-b border-border">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-warning" />
                )}
                <span className="font-medium text-foreground">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}>
                <motion.div
                  layout
                  className="w-5 h-5 bg-white rounded-full shadow-md m-0.5"
                  animate={{ x: isDarkMode ? 24 : 0 }}
                />
              </div>
            </button>
          </div>

          {/* Main Menu */}
          {isAuthenticated && (
            <div className="p-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Account
              </h3>
              <div className="space-y-1">
                {mainMenuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Secondary Menu */}
          <div className="p-6 flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              More
            </h3>
            <div className="space-y-1">
              {secondaryMenuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.label}</p>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          {isAuthenticated && (
            <div className="p-6 pt-0">
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}

          {/* App Version */}
          <div className="p-6 pt-0 text-center">
            <p className="text-xs text-muted-foreground">ParkEase v1.0.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;
