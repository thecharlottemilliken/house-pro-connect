
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate('/properties')}
        >
          <ArrowLeft size={16} />
          Back to Properties
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">Property Details</h1>
        <p className="text-lg text-gray-600">Viewing property with ID: {id}</p>
        
        <div className="mt-6">
          <p className="text-gray-600">This is a placeholder for the property details page.</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
