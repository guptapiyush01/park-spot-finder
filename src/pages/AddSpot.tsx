import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  X, 
  IndianRupee, 
  Car, 
  Loader2,
  CheckCircle2,
  Wifi,
  Shield,
  Zap,
  Umbrella
} from 'lucide-react';
import { useAddParkingSpot, NewParkingSpot } from '@/hooks/useAddParkingSpot';
import { useAuth } from '@/hooks/useAuth';
import { searchLocations, getLocationByCity } from '@/data/indianLocations';
import { toast } from 'sonner';

const amenityOptions = [
  { id: 'cctv', label: 'CCTV', icon: Shield },
  { id: 'covered', label: 'Covered', icon: Umbrella },
  { id: 'ev_charging', label: 'EV Charging', icon: Zap },
  { id: 'security', label: '24/7 Security', icon: Shield },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
];

const AddSpot = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { addParkingSpot, isLoading } = useAddParkingSpot();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    description: '',
    price: '',
    total: '',
    available: '',
    lat: '',
    lng: '',
  });

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    navigate('/auth');
    return null;
  }

  const citySuggestions = searchLocations(citySearch);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCitySelect = (city: string) => {
    const location = getLocationByCity(city);
    if (location) {
      setFormData(prev => ({
        ...prev,
        city: location.city,
        lat: location.lat.toString(),
        lng: location.lng.toString(),
      }));
      setCitySearch(location.city);
    }
    setShowCitySuggestions(false);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.city || !formData.price || !formData.total) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.lat || !formData.lng) {
      toast.error('Please select a city from the suggestions');
      return;
    }

    const spotData: NewParkingSpot = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      total: parseInt(formData.total, 10),
      available: parseInt(formData.available || formData.total, 10),
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      amenities: selectedAmenities,
    };

    const result = await addParkingSpot(spotData, imageFile || undefined);
    
    if (result) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Add Parking Spot</h1>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-4 space-y-6"
        onSubmit={handleSubmit}
      >
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Spot Photo</Label>
          <div 
            className="relative w-full h-48 rounded-2xl bg-secondary border-2 border-dashed border-muted-foreground/30 overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Camera className="w-10 h-10 mb-2" />
                <p className="text-sm">Tap to add photo</p>
                <p className="text-xs mt-1">Max 5MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Spot Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Central Mall Parking"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-12 bg-secondary border-0 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="address"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="h-12 bg-secondary border-0 rounded-xl pl-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="Search city..."
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCitySuggestions(true);
              }}
              onFocus={() => setShowCitySuggestions(true)}
              className="h-12 bg-secondary border-0 rounded-xl"
              required
            />
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {citySuggestions.map((loc) => (
                  <button
                    key={`${loc.city}-${loc.state}`}
                    type="button"
                    onClick={() => handleCitySelect(loc.city)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <p className="font-medium">{loc.city}</p>
                    <p className="text-sm text-muted-foreground">{loc.state}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your parking spot..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-secondary border-0 rounded-xl resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Pricing & Capacity */}
        <div className="space-y-4">
          <h3 className="font-semibold">Pricing & Capacity</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Hour (₹) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="50"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="h-12 bg-secondary border-0 rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total Slots *</Label>
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="total"
                  type="number"
                  min="1"
                  placeholder="50"
                  value={formData.total}
                  onChange={(e) => setFormData(prev => ({ ...prev, total: e.target.value }))}
                  className="h-12 bg-secondary border-0 rounded-xl pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="available">Available Slots (Optional)</Label>
            <Input
              id="available"
              type="number"
              min="0"
              placeholder="Same as total if not specified"
              value={formData.available}
              onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.value }))}
              className="h-12 bg-secondary border-0 rounded-xl"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="font-semibold">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="text-sm">{amenity.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Adding Spot...
            </>
          ) : (
            'Add Parking Spot'
          )}
        </Button>
      </motion.form>
    </div>
  );
};

export default AddSpot;
