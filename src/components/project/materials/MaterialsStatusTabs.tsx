
import React from "react";
import { Clock, Package, Star } from "lucide-react";

interface MaterialsStatusTabsProps {
  activeStatus: "scheduled" | "delivered" | "wishlist";
  onStatusChange: (status: "scheduled" | "delivered" | "wishlist") => void;
}

const MaterialsStatusTabs = ({ activeStatus, onStatusChange }: MaterialsStatusTabsProps) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        className={`flex items-center px-4 py-3 border-b-2 ${
          activeStatus === "scheduled" 
            ? "border-[#0f566c] text-[#0f566c] font-medium" 
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => onStatusChange("scheduled")}
      >
        <Clock className="h-5 w-5 mr-2" />
        Scheduled
      </button>
      
      <button
        className={`flex items-center px-4 py-3 border-b-2 ${
          activeStatus === "delivered" 
            ? "border-[#0f566c] text-[#0f566c] font-medium" 
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => onStatusChange("delivered")}
      >
        <Package className="h-5 w-5 mr-2" />
        Delivered
      </button>
      
      <button
        className={`flex items-center px-4 py-3 border-b-2 ${
          activeStatus === "wishlist" 
            ? "border-[#0f566c] text-[#0f566c] font-medium" 
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => onStatusChange("wishlist")}
      >
        <Star className="h-5 w-5 mr-2" />
        Wishlist
      </button>
    </div>
  );
};

export default MaterialsStatusTabs;
