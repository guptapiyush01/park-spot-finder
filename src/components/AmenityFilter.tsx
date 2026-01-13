import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Shield, Clock, Warehouse, Car, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AmenityFilterProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

const AMENITIES = [
  { id: 'EV Charging', label: 'EV Charging', icon: Zap },
  { id: 'Security', label: 'Security', icon: Shield },
  { id: '24/7', label: '24/7 Access', icon: Clock },
  { id: 'Covered', label: 'Covered', icon: Warehouse },
  { id: 'Valet', label: 'Valet', icon: Car },
  { id: 'Premium', label: 'Premium', icon: Car },
  { id: 'Shuttle', label: 'Shuttle', icon: Plane },
];

const AmenityFilter = ({ isOpen, onClose, selectedAmenities, onAmenitiesChange }: AmenityFilterProps) => {
  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter(a => a !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  const clearAll = () => {
    onAmenitiesChange([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Filter Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 z-50 max-h-[70vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Filter by Amenities</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {AMENITIES.map(({ id, label, icon: Icon }) => {
                const isSelected = selectedAmenities.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleAmenity(id)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-glow'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={clearAll}
                disabled={selectedAmenities.length === 0}
              >
                Clear All
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Apply ({selectedAmenities.length})
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AmenityFilter;
