
import React from "react";
import { MoreVertical } from "lucide-react";

interface MaterialItemProps {
  id: string;
  name: string;
  image: string;
  arrivalDate: string;
  units: number;
  unitPrice: number;
  totalPrice: number;
}

const MaterialItem = ({
  id,
  name,
  image,
  arrivalDate,
  units,
  unitPrice,
  totalPrice
}: MaterialItemProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start">
        <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
          <img 
            src={image} 
            alt={name} 
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <p className="font-medium">Arriving {arrivalDate}</p>
                <span className="ml-2 text-gray-500 text-sm">{id}</span>
              </div>
              <h3 className="text-lg font-medium mt-1">{name}</h3>
              <p className="text-gray-600 mt-1">{units} Units</p>
            </div>
            
            <div className="flex flex-col items-end">
              <button className="p-1">
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>
              <p className="font-bold text-lg mt-2">${totalPrice.toFixed(2)}</p>
              <p className="text-gray-600 text-sm">${unitPrice.toFixed(2)} / Unit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialItem;
