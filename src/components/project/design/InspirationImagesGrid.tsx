
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InspirationImagesGridProps {
  images: string[];
  onDeleteImage?: (imageUrl: string) => void;
}

const InspirationImagesGrid: React.FC<InspirationImagesGridProps> = ({ 
  images,
  onDeleteImage
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img, idx) => (
        <div key={idx} className="group relative aspect-video bg-gray-100 rounded overflow-hidden">
          <img 
            src={img} 
            alt={`Inspiration ${idx + 1}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Failed to load inspiration image:", img);
              e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
            }}
          />
          {onDeleteImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => onDeleteImage(img)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InspirationImagesGrid;
