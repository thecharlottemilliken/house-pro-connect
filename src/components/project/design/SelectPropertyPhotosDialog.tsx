
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogTitle, 
  DialogHeader, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SelectPropertyPhotosDialogProps {
  photos: string[];
  onSelect: (selectedPhotos: string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  customButton?: React.ReactNode;
  propertyId?: string; // Add propertyId prop to fetch files from storage
}

const SelectPropertyPhotosDialog = ({ 
  photos, 
  onSelect, 
  open: controlledOpen, 
  onOpenChange,
  customButton,
  propertyId
}: SelectPropertyPhotosDialogProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allPhotos, setAllPhotos] = useState<string[]>([]);

  // Handle controlled/uncontrolled component pattern
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  // Load both property photos and files from storage when dialog opens
  useEffect(() => {
    const fetchPropertyFiles = async () => {
      if (!isOpen || !propertyId) return;

      setIsLoading(true);
      try {
        // Start with existing photos from the property
        let combinedPhotos = [...photos].filter(url => 
          url && typeof url === 'string' && !url.startsWith('blob:')
        );

        // Fetch files from property-files bucket
        const { data: storageFiles, error: storageError } = await supabase
          .storage
          .from('property-files')
          .list(`${propertyId}/`, {
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (storageError) {
          console.error("Error fetching property files:", storageError);
          throw storageError;
        }

        // If we have files from storage, get their public URLs and add them
        if (storageFiles && storageFiles.length > 0) {
          // Filter for image files only
          const imageFiles = storageFiles.filter(file => 
            file.metadata && 
            file.metadata.mimetype && 
            file.metadata.mimetype.startsWith('image/')
          );

          // Get public URLs for all image files
          for (const file of imageFiles) {
            const { data: publicUrl } = supabase
              .storage
              .from('property-files')
              .getPublicUrl(`${propertyId}/${file.name}`);
              
            if (publicUrl && publicUrl.publicUrl) {
              // Add to the combined photos array if not already included
              if (!combinedPhotos.includes(publicUrl.publicUrl)) {
                combinedPhotos.push(publicUrl.publicUrl);
              }
            }
          }
        }

        // Update state with combined unique photos
        setAllPhotos([...new Set(combinedPhotos)]);

      } catch (error) {
        console.error("Failed to fetch property files:", error);
        toast({
          title: "Error",
          description: "Failed to load property photos",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyFiles();
  }, [isOpen, photos, propertyId]);

  // Reset selection when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPhotos([]);
    }
  }, [isOpen]);

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
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Photos</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-gray-500">Loading photos...</p>
          </div>
        ) : allPhotos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {allPhotos.map((photo, index) => (
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
                      // Handle broken image
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Image+Error';
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
        ) : (
          <div className="text-center py-8">
            <p>No property photos available.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectPropertyPhotosDialog;
