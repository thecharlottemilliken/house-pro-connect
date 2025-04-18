
import React from "react";

interface InspirationImagesGridProps {
  images: string[];
}

const InspirationImagesGrid: React.FC<InspirationImagesGridProps> = ({ images }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img, idx) => (
        <div key={idx} className="aspect-video bg-gray-100 rounded overflow-hidden">
          <img 
            src={img} 
            alt={`Inspiration ${idx + 1}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Failed to load inspiration image:", img);
              e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default InspirationImagesGrid;
