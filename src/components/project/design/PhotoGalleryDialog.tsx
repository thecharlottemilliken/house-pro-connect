
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface PhotoGalleryDialogProps {
  photos: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

const PhotoGalleryDialog: React.FC<PhotoGalleryDialogProps> = ({
  photos,
  open,
  onOpenChange,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Handle when the dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset to initial index when closing
      setCurrentIndex(initialIndex);
    }
    onOpenChange(newOpen);
  };
  
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black/95 text-white border-gray-800">
        <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white">
              Photo Gallery ({currentIndex + 1}/{photos.length})
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="h-full flex items-center justify-center py-16">
          <Carousel 
            className="w-full max-h-[80vh]"
            defaultSlide={initialIndex}
            opts={{
              loop: true,
              startIndex: initialIndex
            }}
            setApi={(api) => {
              if (api) {
                api.on('select', () => {
                  setCurrentIndex(api.selectedScrollSnap());
                });
                // Initialize the index
                setCurrentIndex(api.selectedScrollSnap());
              }
            }}
          >
            <CarouselContent>
              {photos.map((photo, index) => (
                <CarouselItem key={`gallery-${photo}-${index}`} className="flex items-center justify-center">
                  <div className="flex items-center justify-center h-full p-4">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`} 
                      className="max-h-[70vh] max-w-full object-contain rounded-md"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="left-4 text-white border-white/30 hover:bg-white/20 hover:text-white" />
            <CarouselNext className="right-4 text-white border-white/30 hover:bg-white/20 hover:text-white" />
          </Carousel>
        </div>
        
        {/* Photo count indicator at the bottom */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-sm text-white/70">
            {currentIndex + 1} of {photos.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoGalleryDialog;
