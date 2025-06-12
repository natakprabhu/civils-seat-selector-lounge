
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SeatImage {
  id: string;
  seat_id: string;
  image_url: string;
  uploaded_at: string;
  uploaded_by: string | null;
}

export const useSeatImages = () => {
  const [seatImages, setSeatImages] = useState<SeatImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeatImages = async () => {
    try {
      const { data, error } = await supabase
        .from('seat_images')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setSeatImages(data || []);
    } catch (error) {
      console.error('Error fetching seat images:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadSeatImage = async (seatId: string, file: File) => {
    try {
      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${seatId}.${fileExt}`;
      const filePath = `seat-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('seat-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('seat-images')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('seat_images')
        .upsert({
          seat_id: seatId,
          image_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      await fetchSeatImages();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getSeatImage = (seatId: string) => {
    return seatImages.find(img => img.seat_id === seatId)?.image_url;
  };

  useEffect(() => {
    fetchSeatImages();
  }, []);

  return {
    seatImages,
    loading,
    uploadSeatImage,
    getSeatImage,
    refetch: fetchSeatImages
  };
};
