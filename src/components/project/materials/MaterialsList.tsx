
import React from "react";
import { MoreVertical } from "lucide-react";
import MaterialItem from "./MaterialItem";

interface MaterialsListProps {
  activeSpecialty: string;
  activeStatus: "scheduled" | "delivered" | "wishlist";
  searchQuery: string;
}

// Sample materials data
const materialsList = [
  {
    id: "37293482894212",
    name: "Eco-Friendly Paint",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
    specialty: "Paint",
    status: "scheduled",
    arrivalDate: "Feb 12th",
    units: 10,
    unitPrice: 10.00,
    totalPrice: 100.00
  },
  {
    id: "37293482894212",
    name: "Reclaimed Wood Flooring",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
    specialty: "Flooring",
    status: "scheduled",
    arrivalDate: "March 5th",
    units: 10,
    unitPrice: 10.00,
    totalPrice: 100.00
  },
  {
    id: "37293482894212",
    name: "Energy-Efficient Windows",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
    specialty: "Windows",
    status: "scheduled",
    arrivalDate: "March 10th",
    units: 10,
    unitPrice: 10.00,
    totalPrice: 100.00
  },
  {
    id: "37293482894212",
    name: "Sustainable Insulation",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
    specialty: "Insulation",
    status: "scheduled",
    arrivalDate: "March 17th",
    units: 10,
    unitPrice: 10.00,
    totalPrice: 100.00
  },
  {
    id: "37293482894219",
    name: "Ceramic Floor Tile",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
    specialty: "Tile",
    status: "scheduled",
    arrivalDate: "Feb 15th",
    units: 15,
    unitPrice: 8.50,
    totalPrice: 127.50
  },
  {
    id: "37293482894220",
    name: "Subway Wall Tile",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
    specialty: "Tile",
    status: "scheduled",
    arrivalDate: "Feb 18th",
    units: 20,
    unitPrice: 7.25,
    totalPrice: 145.00
  }
];

const MaterialsList = ({ activeSpecialty, activeStatus, searchQuery }: MaterialsListProps) => {
  // Filter materials by specialty, status, and search query
  const filteredMaterials = materialsList.filter(material => {
    return (
      material.specialty === activeSpecialty &&
      material.status === activeStatus &&
      (searchQuery === "" || 
       material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       material.id.includes(searchQuery))
    );
  });

  if (filteredMaterials.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No materials found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMaterials.map((material) => (
        <div key={`${material.id}-${material.name}`} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start">
            <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
              <img 
                src={material.image} 
                alt={material.name} 
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">Arriving {material.arrivalDate}</p>
                    <span className="ml-2 text-gray-500 text-sm">{material.id}</span>
                  </div>
                  <h3 className="text-lg font-medium mt-1">{material.name}</h3>
                  <p className="text-gray-600 mt-1">{material.units} Units</p>
                </div>
                
                <div className="flex flex-col items-end">
                  <button className="p-1">
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>
                  <p className="font-bold text-lg mt-2">${material.totalPrice.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm">${material.unitPrice.toFixed(2)} / Unit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialsList;
