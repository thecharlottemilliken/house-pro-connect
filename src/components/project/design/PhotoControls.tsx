
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import PhotoUploadButton from './PhotoUploadButton';

interface PhotoControlsProps {
  area?: string;
  propertyPhotos: string[];
  propertyId?: string; // Added propertyId prop
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
  className?: string;
}

const PhotoControls: React.FC<PhotoControlsProps> = ({
  area = '',
  propertyPhotos,
  propertyId, // Pass propertyId to child components
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  className
}) => {
  const [isSelectDialogOpen, setIsSelectDialogOpen] = React.useState(false);

  return (
    <div className={`grid grid-cols-2 gap-4 ${className || ''}`}>
      <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
        <Button
          variant="outline"
          onClick={() => setIsSelectDialogOpen(true)}
          className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
        >
          Select from files
        </Button>
        
        <SelectPropertyPhotosDialog
          photos={propertyPhotos}
          propertyId={propertyId}
          onSelect={onSelectBeforePhotos}
          open={isSelectDialogOpen}
          onOpenChange={setIsSelectDialogOpen}
        />
      </Dialog>
      
      <PhotoUploadButton 
        onUploadComplete={onUploadBeforePhotos} 
        propertyId={propertyId}
      />
    </div>
  );
};

export default React.memo(PhotoControls);
