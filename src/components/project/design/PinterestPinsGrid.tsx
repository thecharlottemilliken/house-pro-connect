
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type PinterestPin } from "@/types/pinterest";

interface PinterestPinsGridProps {
  pins: PinterestPin[];
}

const PinterestPinsGrid: React.FC<PinterestPinsGridProps> = ({ pins }) => {
  if (pins.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
      {pins.map((pin) => (
        <div key={pin.id} className="relative group">
          <AspectRatio ratio={1}>
            <img
              src={pin.imageUrl}
              alt={pin.description || "Pinterest pin"}
              className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
              onError={(e) => {
                console.error("Failed to load image:", pin.imageUrl);
                e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
              }}
            />
          </AspectRatio>
          {pin.description && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p className="text-white text-xs line-clamp-2">{pin.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PinterestPinsGrid;
