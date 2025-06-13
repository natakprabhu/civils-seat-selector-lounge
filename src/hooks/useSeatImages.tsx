
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
      console.log('Fetched seat images:', data);
      setSeatImages(data || []);
    } catch (error) {
      console.error('Error fetching seat images:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadSeatImage = async (seatId: string, file: File) => {
    try {
      console.log('Starting upload for seat:', seatId, 'file:', file.name);
      
      // Upload image to storage
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${seatId}-${Date.now()}.${fileExt}`;
      const filePath = `seat-images/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('seat-images')
        .upload(filePath, file, { 
          upsert: false,
          contentType: file.type 
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('seat-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Save to database (remove existing image for this seat first)
      await supabase
        .from('seat_images')
        .delete()
        .eq('seat_id', seatId);

      const { error: dbError } = await supabase
        .from('seat_images')
        .insert({
          seat_id: seatId,
          image_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Database insert successful');
      await fetchSeatImages();
      return { error: null };
    } catch (error) {
      console.error('Upload process error:', error);
      return { error };
    }
  };

  const getSeatImage = (seatId: string) => {
    const image = seatImages.find(img => img.seat_id === seatId);
    return image?.image_url;
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
