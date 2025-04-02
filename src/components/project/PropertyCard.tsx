
import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Family Home</CardTitle>
        <p className="text-sm text-gray-600">
          {propertyDetails.address_line1}, {propertyDetails.city}, {propertyDetails.state} {propertyDetails.zip_code}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <img 
            src={propertyDetails.image_url} 
            alt={propertyDetails.property_name} 
            className="w-full h-48 object-cover rounded-md" 
          />
        </div>
        
        <div className="mb-4">
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
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full justify-between text-[#1e5c78] border-[#1e5c78] hover:bg-[#1e5c78]/5"
          >
            PROPERTY DETAILS <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
