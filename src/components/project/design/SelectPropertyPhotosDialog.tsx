
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogTitle, 
  DialogHeader, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { loadPropertyPhotos } from '@/utils/BeforePhotosService';

interface SelectPropertyPhotosDialogProps {
  photos: string[];
  onSelect: (selectedPhotos: string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  customButton?: React.ReactNode;
}

const SelectPropertyPhotosDialog = ({ 
  photos: initialPhotos, 
  onSelect, 
  open: controlledOpen, 
  onOpenChange,
  customButton 
}: SelectPropertyPhotosDialogProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePhotos, setAvailablePhotos] = useState<string[]>([]);

  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  // Load combined property photos when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPhotos([]);
      
      // Start with the photos passed as props
      setAvailablePhotos(initialPhotos || []);
      
      // We could load additional photos from storage here if needed
      // This would require passing the propertyId as a prop
    }
  }, [isOpen, initialPhotos]);

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
    if (selectedPhotos.length > 0) {
      onSelect(selectedPhotos);
    }
    // Dialog will be closed by the parent component
  };

  if (availablePhotos.length === 0) {
    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Photos</DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-8">
          <p>No property photos available.</p>
          <p className="text-sm text-gray-500 mt-2">
            Upload some photos to your property to use them here.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Select Photos</DialogTitle>
      </DialogHeader>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse">Loading photos...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {availablePhotos.map((photo, index) => (
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
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                    console.error("Failed to load image:", photo);
                  }}
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
              <Button variant="outline" onClick={() => setIsOpen(false)}>
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
      )}
    </DialogContent>
  );
};

export default SelectPropertyPhotosDialog;
