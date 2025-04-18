
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

interface SelectPropertyPhotosDialogProps {
  photos: string[];
  onSelect: (selectedPhotos: string[]) => void;
}

const SelectPropertyPhotosDialog = ({
  photos,
  onSelect,
}: SelectPropertyPhotosDialogProps) => {
  const [selectedPhotos, setSelectedPhotos] = React.useState<string[]>([]);

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
  };

  return (
    <Dialog>
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
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSelectedPhotos([])}>
            Clear Selection
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPropertyPhotosDialog;
