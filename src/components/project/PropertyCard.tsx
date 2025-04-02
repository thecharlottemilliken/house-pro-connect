
import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0">
      <CardHeader className="pb-3 pt-6 px-6">
        <h2 className="text-2xl font-semibold">Family Home</h2>
        <p className="text-gray-600">
          {propertyDetails.address_line1}, {propertyDetails.city}, {propertyDetails.state} {propertyDetails.zip_code}
        </p>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <div>
          <img 
            src={propertyDetails.image_url} 
            alt={propertyDetails.property_name} 
            className="w-full h-48 object-cover" 
          />
        </div>
        
        <div className="px-6 py-4">
          <h3 className="font-medium mb-2 uppercase text-xs text-gray-600">RENOVATION AREAS</h3>
          <div className="space-y-2">
            {renovationAreas && renovationAreas.length > 0 ? (
              renovationAreas.map((area, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="text-orange-500 mr-2">★</span> {area.area} ({area.location})
                </div>
              ))
            ) : (
              <div className="flex items-center text-sm">
                <span className="text-orange-500 mr-2">★</span> Kitchen
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 pb-6 pt-2">
          <Button 
            variant="outline" 
            className="w-full justify-between text-[#0f3a4d] border-[#0f3a4d] hover:bg-[#0f3a4d]/5 font-medium"
          >
            PROPERTY DETAILS <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
