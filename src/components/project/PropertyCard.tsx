import React from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenovationArea } from "@/hooks/useProjectData";
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
const PropertyCard = ({
  propertyDetails,
  renovationAreas = []
}: PropertyCardProps) => {
  // Get the first available image
  const imageUrl = propertyDetails.home_photos?.length ? propertyDetails.home_photos[0] : propertyDetails.image_url || '/placeholder.svg';
  return <Card className="overflow-hidden rounded-xl shadow-lg border-0">
      {/* Property Image */}
      <div className="w-full h-[180px]">
        <img src={imageUrl} alt={propertyDetails.property_name} className="w-full h-full object-cover" />
      </div>
      
      {/* Property Details */}
      <div className="p-8 px-[16px] py-[16px]">
        <h3 className="text-lg font-semibold">
          {propertyDetails.property_name}
        </h3>
        <p className="text-lg text-gray-700 mb-6">
          {propertyDetails.address_line1}, {propertyDetails.city}, {propertyDetails.state} {propertyDetails.zip_code}
        </p>
        
        <h3 className="text-sm font-semibold ">RENOVATION AREAS</h3>
        <div className="space-y-3 mb-8">
          {Array.isArray(renovationAreas) && renovationAreas.length > 0 ? renovationAreas.map((area, index) => <div key={index} className="flex items-center text-lg">
                <span className="text-orange-500 mr-3 text-2xl">★</span> {area.area}
                {area.location && <span className="text-gray-500 ml-2">({area.location})</span>}
              </div>) : <div className="text-gray-500">No renovation areas specified</div>}
        </div>
        
        <Button variant="outline" className="mt-4 justify-between text-[#15425F] border-[#15425F] hover:bg-[#15425F]/5 font-semibold tracking-wide text-lg group w-auto">
          PROPERTY DETAILS <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>;
};
export default PropertyCard;