import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  MapPin,
  IndianRupee,
  Car,
  Star,
  Edit2,
  Trash2,
  Loader2,
  ParkingCircle,
} from 'lucide-react';
import { useMySpots } from '@/hooks/useMySpots';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

type ParkingSpot = Tables<'parking_spots'>;

const MySpots = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { spots, isLoading, deleteSpot, updateSpot } = useMySpots();
  
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | null>(null);
  const [deletingSpotId, setDeletingSpotId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    description: '',
    price: '',
    total: '',
    available: '',
  });

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate('/auth');
    return null;
  }

  const openEditDialog = (spot: ParkingSpot) => {
    setEditingSpot(spot);
    setEditForm({
      name: spot.name,
      address: spot.address,
      description: (spot as any).description || '',
      price: spot.price.toString(),
      total: spot.total.toString(),
      available: spot.available.toString(),
    });
  };

  const handleUpdate = async () => {
    if (!editingSpot) return;

    setIsUpdating(true);
    const result = await updateSpot(editingSpot.id, {
      name: editForm.name,
      address: editForm.address,
      price: parseFloat(editForm.price),
      total: parseInt(editForm.total, 10),
      available: parseInt(editForm.available, 10),
    });

    setIsUpdating(false);
    if (result) {
      setEditingSpot(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingSpotId) return;
    await deleteSpot(deletingSpotId);
    setDeletingSpotId(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">My Parking Spots</h1>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/add-spot')}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {spots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ParkingCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No Parking Spots Yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Start earning by listing your parking space for others to use
            </p>
            <Button onClick={() => navigate('/add-spot')} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Spot
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {spots.length} parking spot{spots.length !== 1 ? 's' : ''} listed
            </p>

            <AnimatePresence mode="popLayout">
              {spots.map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  {/* Spot Image */}
                  <div className="relative h-32 bg-secondary">
                    {spot.image_url ? (
                      <img
                        src={spot.image_url}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ParkingCircle className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (spot as any).status === 'approved' 
                          ? 'bg-success/20 text-success' 
                          : (spot as any).status === 'pending'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {(spot as any).status || 'approved'}
                      </span>
                    </div>
                  </div>

                  {/* Spot Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{spot.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{spot.address}</span>
                        </div>
                      </div>
                      {spot.rating && (
                        <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span className="text-sm font-medium">{spot.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 mb-4">
                      <div className="flex items-center gap-1 text-sm">
                        <IndianRupee className="w-3 h-3 text-primary" />
                        <span className="font-semibold text-primary">₹{spot.price}/hr</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Car className="w-3 h-3" />
                        <span>{spot.available}/{spot.total} available</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 rounded-xl"
                        onClick={() => openEditDialog(spot)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setDeletingSpotId(spot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSpot} onOpenChange={() => setEditingSpot(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Parking Spot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Spot Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="h-12 bg-secondary border-0 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                className="h-12 bg-secondary border-0 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹/hr)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                  className="h-12 bg-secondary border-0 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-total">Total Slots</Label>
                <Input
                  id="edit-total"
                  type="number"
                  value={editForm.total}
                  onChange={(e) => setEditForm(prev => ({ ...prev, total: e.target.value }))}
                  className="h-12 bg-secondary border-0 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-available">Available Slots</Label>
              <Input
                id="edit-available"
                type="number"
                value={editForm.available}
                onChange={(e) => setEditForm(prev => ({ ...prev, available: e.target.value }))}
                className="h-12 bg-secondary border-0 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingSpot(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSpotId} onOpenChange={() => setDeletingSpotId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parking Spot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your parking spot listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MySpots;
