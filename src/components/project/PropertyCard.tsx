
import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyImageCarousel } from "@/components/property/PropertyImageCarousel";

interface RenovationArea {
  area: string;
  location: string;
}

interface PropertyCardProps {
  propertyDetails: {
    id: string;
    property_name: string;
    image_url: string;
    home_photos?: string[];
    address_line1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  renovationAreas: RenovationArea[];
}

const PropertyCard = ({ propertyDetails, renovationAreas = [] }: PropertyCardProps) => {
  // Get all available images, including home_photos if they exist
  const images = propertyDetails.home_photos?.length 
    ? propertyDetails.home_photos 
    : propertyDetails.image_url 
      ? [propertyDetails.image_url]
      : [];

  return (
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0 flex flex-col sm:flex-row h-auto">
      {/* Left side - Property Images Carousel */}
      <div className="w-full sm:w-1/2">
        <PropertyImageCarousel images={images} />
      </div>
      
      {/* Right side - Property Details */}
      <div className="w-full sm:w-1/2 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{propertyDetails.property_name}</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6 md:mb-8 break-words">
            {propertyDetails.address_line1}, {propertyDetails.city}, {propertyDetails.state} {propertyDetails.zip_code}
          </p>
          
          <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4 uppercase">RENOVATION AREAS</h3>
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-4 sm:mb-6 md:mb-8">
            {Array.isArray(renovationAreas) && renovationAreas.length > 0 ? (
              renovationAreas.map((area, index) => (
                <div key={index} className="flex items-center text-sm sm:text-base md:text-lg">
                  <span className="text-orange-500 mr-2 sm:mr-3 text-lg sm:text-xl md:text-2xl">★</span> {area.area}
                  {area.location && <span className="text-gray-500 ml-2">({area.location})</span>}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm sm:text-base">No renovation areas specified</div>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="mt-2 sm:mt-auto justify-between text-[#15425F] border-[#15425F] hover:bg-[#15425F]/5 font-semibold tracking-wide text-sm sm:text-base md:text-lg group w-full"
        >
          PROPERTY DETAILS <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default PropertyCard;
