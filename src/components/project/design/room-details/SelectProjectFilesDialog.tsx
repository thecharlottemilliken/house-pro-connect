
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SelectProjectFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  propertyId?: string; // Added propertyId prop
  onSelect: (files: string[]) => void;
}

const SelectProjectFilesDialog: React.FC<SelectProjectFilesDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  propertyId,
  onSelect
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Load both property photos and files from the property-files bucket
  useEffect(() => {
    const fetchProjectFiles = async () => {
      if (!open || !projectId || !propertyId) return;
      
      setLoading(true);
      let allPhotos: string[] = [];
      
      try {
        // First, fetch property photos from home_photos array
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('home_photos')
          .eq('id', propertyId)
          .single();
        
        if (propertyError) {
          console.error("Error fetching property photos:", propertyError);
          throw propertyError;
        }
        
        // Add property photos to our collection if they exist
        if (propertyData?.home_photos && Array.isArray(propertyData.home_photos)) {
          allPhotos = [...propertyData.home_photos];
          console.log("Loaded property photos:", allPhotos.length);
        }
        
        // Next, fetch files from property-files bucket
        const { data: storageFiles, error: storageError } = await supabase
          .storage
          .from('property-files')
          .list(`${propertyId}`, {
            sortBy: { column: 'created_at', order: 'desc' }
          });
        
        if (storageError) {
          console.error("Error fetching storage files:", storageError);
          throw storageError;
        }
        
        // Process and add storage files to our collection
        if (storageFiles && storageFiles.length > 0) {
          const storageUrls = storageFiles
            .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) // Only include images
            .map(file => {
              const url = supabase.storage.from('property-files').getPublicUrl(`${propertyId}/${file.name}`).data.publicUrl;
              return url;
            });
            
          console.log("Loaded storage files:", storageUrls.length);
          
          // Combine with existing photos, removing duplicates
          allPhotos = [...allPhotos, ...storageUrls];
        }
        
        // Remove any temporary blob URLs and duplicates
        allPhotos = [...new Set(allPhotos.filter(url => 
          url && 
          typeof url === 'string' && 
          !url.startsWith('blob:')
        ))];
        
        console.log("Total unique valid photos:", allPhotos.length);
        setPhotos(allPhotos);
      } catch (error) {
        console.error("Error loading project files:", error);
        toast({
          title: "Error",
          description: "Failed to load files. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectFiles();
  }, [open, projectId, propertyId]);

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
    setSelectedPhotos([]); // Clear selection after selecting
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Files</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading files...</div>
          </div>
        ) : photos.length > 0 ? (
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
                    alt={`Project file ${index + 1}`} 
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
                {selectedPhotos.length} file{selectedPhotos.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSelectPhotos} 
                  disabled={selectedPhotos.length === 0}
                >
                  Select Files
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-8">
            <p>No files available.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectProjectFilesDialog;
