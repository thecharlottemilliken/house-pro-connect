
import React, { useState } from 'react';
import { 
  DialogContent, 
  DialogTitle, 
  DialogHeader, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SelectPropertyPhotosDialogProps {
  photos: string[];
  onSelect: (selectedPhotos: string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  customButton?: React.ReactNode;
}

const SelectPropertyPhotosDialog = ({ 
  photos, 
  onSelect, 
  open: controlledOpen, 
  onOpenChange,
  customButton 
}: SelectPropertyPhotosDialogProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handleToggleSelect = (photo: string) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photo)) {
        return prev.filter(p => p !== photo);
      } else {
        return [...prev, photo];
      }
    });
  };

  const handleSelectPhotos = () => {
    onSelect(selectedPhotos);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Select Photos</DialogTitle>
      </DialogHeader>
      
      {photos.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {photos.map((photo, index) => (
              <div 
                key={index} 
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                  selectedPhotos.includes(photo) ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => handleToggleSelect(photo)}
              >
                <img 
                  src={photo} 
                  alt={`Property photo ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                {selectedPhotos.includes(photo) && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                    {selectedPhotos.indexOf(photo) + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <span className="text-sm text-gray-500">
              {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSelectPhotos} 
                disabled={selectedPhotos.length === 0}
              >
                Select Photos
              </Button>
            </div>
          </DialogFooter>
        </>
      ) : (
        <div className="text-center py-8">
          <p>No property photos available.</p>
        </div>
      )}
    </DialogContent>
  );
};

export default SelectPropertyPhotosDialog;
