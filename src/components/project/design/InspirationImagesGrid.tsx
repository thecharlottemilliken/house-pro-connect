
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
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No inspiration images added yet.
      </div>
    );
  }

  // Add debugging for image display issues
  console.log(`Rendering InspirationImagesGrid with ${images.length} images`);
  if (images.length > 0) {
    console.log(`First few image URLs:`, images.slice(0, 3));
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {images.map((img, idx) => (
        <div key={`${img}-${idx}`} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={img} 
            alt={`Inspiration ${idx + 1}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Failed to load inspiration image:", img);
              e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
            }}
            onLoad={() => console.log(`Successfully loaded image: ${img.slice(0, 20)}...`)}
          />
          {onDeleteImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Deleting image: ${img.slice(0, 20)}...`);
                  onDeleteImage(img);
                }}
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
