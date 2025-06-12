
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useSeatImages } from '@/hooks/useSeatImages';
import { useSeats } from '@/hooks/useSeats';
import { Upload, Image, ArrowLeft } from 'lucide-react';

interface SeatImageUploadProps {
  onBack: () => void;
}

const SeatImageUpload: React.FC<SeatImageUploadProps> = ({ onBack }) => {
  const { seats } = useSeats();
  const { seatImages, uploadSeatImage, getSeatImage } = useSeatImages();
  const [uploading, setUploading] = useState<string | null>(null);

  const handleImageUpload = async (seatId: string, file: File) => {
    if (!file) return;

    setUploading(seatId);
    try {
      const { error } = await uploadSeatImage(seatId, file);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Seat image uploaded successfully"
        });
      }
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="header-gradient shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Seat Image Management</h1>
              <p className="text-slate-400">Upload images for each seat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {seats.map((seat) => {
            const existingImage = getSeatImage(seat.id);
            
            return (
              <Card key={seat.id} className="dashboard-card">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="text-lg text-white">
                    Seat {seat.seat_number}
                  </CardTitle>
                  <p className="text-sm text-slate-400">
                    Section {seat.section} - Row {seat.row_number}
                  </p>
                </CardHeader>
                <CardContent className="p-4">
                  {existingImage ? (
                    <div className="space-y-4">
                      <img 
                        src={existingImage} 
                        alt={`Seat ${seat.seat_number}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-600"
                      />
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <Image className="w-4 h-4" />
                        Image uploaded
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(seat.id, file);
                      }}
                      className="hidden"
                      id={`upload-${seat.id}`}
                    />
                    <label htmlFor={`upload-${seat.id}`}>
                      <Button 
                        asChild
                        className="w-full bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg border border-slate-600"
                        disabled={uploading === seat.id}
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading === seat.id ? 'Uploading...' : existingImage ? 'Replace Image' : 'Upload Image'}
                        </span>
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatImageUpload;
