import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Clock, History, User } from 'lucide-react';

const navItems = [
  { icon: Map, label: 'Explore', path: '/dashboard' },
  { icon: Clock, label: 'Active', path: '/active-booking' },
  { icon: History, label: 'History', path: '/history' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border px-4 py-2 z-50"
    >
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center py-2 px-4 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                />
              )}
              <item.icon
                className={`w-6 h-6 relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs mt-1 relative z-10 font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNav;
