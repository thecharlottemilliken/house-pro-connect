
import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RenovationArea {
  area: string;
  location: string;
}

interface PropertyCardProps {
  propertyDetails: {
    id: string;
    property_name: string;
    image_url: string;
    address_line1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  renovationAreas: RenovationArea[];
}

const PropertyCard = ({ propertyDetails, renovationAreas }: PropertyCardProps) => {
  return (
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0 flex flex-col md:flex-row h-auto">
      {/* Left side - Property Image */}
      <div className="w-full md:w-1/2">
        <img 
          src={propertyDetails.image_url} 
          alt="Property"
          className="w-full h-64 md:h-full object-cover" 
        />
      </div>
      
      {/* Right side - Property Details */}
      <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Family Home</h2>
          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 break-words">
            {propertyDetails.address_line1}, {propertyDetails.city}, {propertyDetails.state} {propertyDetails.zip_code}
          </p>
          
          <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 uppercase">RENOVATION AREAS</h3>
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-10">
            {renovationAreas && renovationAreas.length > 0 ? (
              renovationAreas.map((area, index) => (
                <div key={index} className="flex items-center text-base sm:text-lg">
                  <span className="text-orange-500 mr-2 sm:mr-3 text-xl sm:text-2xl">★</span> {area.area}
                </div>
              ))
            ) : (
              <div className="flex items-center text-base sm:text-lg">
                <span className="text-orange-500 mr-2 sm:mr-3 text-xl sm:text-2xl">★</span> Kitchen
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="mt-2 sm:mt-auto justify-between text-[#15425F] border-[#15425F] hover:bg-[#15425F]/5 font-semibold tracking-wide text-base sm:text-lg group w-full"
        >
          PROPERTY DETAILS <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default PropertyCard;
