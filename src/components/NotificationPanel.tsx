import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, Tag, Calendar, Loader2 } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <Check className="w-5 h-5 text-success" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case 'booking':
      return <Calendar className="w-5 h-5 text-primary" />;
    case 'promo':
      return <Tag className="w-5 h-5 text-accent" />;
    default:
      return <Info className="w-5 h-5 text-muted-foreground" />;
  }
};

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // Navigate if notification has a link
    if (notification.data?.link) {
      navigate(notification.data.link as string);
      onClose();
    }
  };

  const handleAuthClick = () => {
    navigate('/auth');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </SheetTitle>
              {notifications.length > 0 && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="text-primary"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Sign in to view notifications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get updates about your bookings, offers, and more.
                </p>
                <Button onClick={handleAuthClick}>Sign In</Button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive updates about your bookings and special offers here.
                </p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="p-4 space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`relative p-4 rounded-xl cursor-pointer transition-colors ${
                        notification.is_read
                          ? 'bg-secondary/50'
                          : 'bg-primary/5 border border-primary/20'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-foreground truncate">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 hover:bg-destructive/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="absolute top-4 right-12 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
