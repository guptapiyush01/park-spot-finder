import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NewParkingSpot {
  name: string;
  address: string;
  city: string;
  description?: string;
  price: number;
  total: number;
  available: number;
  lat: number;
  lng: number;
  amenities: string[];
}

export const useAddParkingSpot = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('parking-spots')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('parking-spots')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addParkingSpot = async (spot: NewParkingSpot, imageFile?: File) => {
    if (!user) {
      toast.error('Please sign in to add a parking spot');
      return null;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase
        .from('parking_spots')
        .insert({
          name: spot.name,
          address: spot.address,
          city: spot.city,
          description: spot.description || null,
          price: spot.price,
          total: spot.total,
          available: spot.available,
          lat: spot.lat,
          lng: spot.lng,
          amenities: spot.amenities,
          image_url: imageUrl,
          user_id: user.id,
          status: 'approved',
          rating: 4.0,
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      toast.success('Parking spot added successfully!');
      return data;
    } catch (error: any) {
      console.error('Error adding parking spot:', error);
      toast.error(error.message || 'Failed to add parking spot');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addParkingSpot,
    uploadImage,
    isLoading,
  };
};
