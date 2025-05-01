
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, CheckCircle } from "lucide-react";

interface SelectPropertyPhotosDialogProps {
  photos: string[];
  onSelect: (selectedPhotos: string[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const SelectPropertyPhotosDialog = ({
  photos,
  onSelect,
  isOpen: controlledIsOpen,
  onClose
}: SelectPropertyPhotosDialogProps) => {
  const [selectedPhotos, setSelectedPhotos] = React.useState<string[]>([]);
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  
  // Handle controlled vs. uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onClose ? (open: boolean) => {
    if (!open) onClose();
    setInternalIsOpen(open);
  } : setInternalIsOpen;

  const handlePhotoClick = (photo: string) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev.includes(photo);
      if (isSelected) {
        return prev.filter((p) => p !== photo);
      }
      return [...prev, photo];
    });
  };

  const handleConfirm = () => {
    onSelect(selectedPhotos);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedPhotos([]);
    }
    setIsOpen(open);
  };

  // If we have onClose but no trigger (when used as a controlled component)
  if (controlledIsOpen !== undefined && onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {photos.map((photo, idx) => (
              <div 
                key={idx} 
                className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 ${
                  selectedPhotos.includes(photo) ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => handlePhotoClick(photo)}
              >
                <img 
                  src={photo} 
                  alt={`Property photo ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
                {selectedPhotos.includes(photo) && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-xs">{selectedPhotos.includes(photo) ? 
                    selectedPhotos.findIndex(p => p === photo) + 1 : ""}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPhotos([])}>
                Clear Selection
              </Button>
              <Button onClick={handleConfirm} disabled={selectedPhotos.length === 0}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
        >
          <Image className="h-4 w-4" />
          Select from Property Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Photos</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
          {photos.map((photo, idx) => (
            <div 
              key={idx} 
              className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedPhotos.includes(photo) ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => handlePhotoClick(photo)}
            >
              <img 
                src={photo} 
                alt={`Property photo ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
              {selectedPhotos.includes(photo) && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <span className="text-xs">{selectedPhotos.includes(photo) ? 
                  selectedPhotos.findIndex(p => p === photo) + 1 : ""}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedPhotos([])}>
              Clear Selection
            </Button>
            <Button onClick={handleConfirm} disabled={selectedPhotos.length === 0}>
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPropertyPhotosDialog;
