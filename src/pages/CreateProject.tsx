
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import AddPropertyDialog from "@/components/projects/AddPropertyDialog";

const CreateProject = () => {
  const navigate = useNavigate();
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [propertyData, setPropertyData] = useState([
    {
      id: 1,
      type: "Family Home",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      address: "1143 S 1200 W #W, Salt Lake City, UT 84104",
    },
    {
      id: 2,
      type: "Vacation Home",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2558&q=80",
      address: "1143 S 1200 W #W, Salt Lake City, UT 84104",
    }
  ]);

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const addProperty = (property: any) => {
    setPropertyData(prev => [...prev, property]);
  };

  const selectProperty = (id: number) => {
    setSelectedPropertyId(id);
  };

  const steps = [
    { number: 1, title: "Select a Property", current: true },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
  ];

  const goToNextStep = () => {
    // This would update the current step and navigate to the next page
    // For now, it just logs the selected property
    console.log("Selected property:", propertyData.find(p => p.id === selectedPropertyId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-80 bg-[#EFF3F7] p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create a Project</h1>
          <p className="text-gray-600 mb-8">
            Lorem ipsum dolor sit amet consectetur.
          </p>
          
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  step.current ? "bg-[#174c65] text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step.number}
                </div>
                <div>
                  <h3 className={`font-medium ${
                    step.current ? "text-[#174c65]" : "text-gray-500"
                  }`}>
                    Step {step.number}
                  </h3>
                  <p className={`${
                    step.current ? "text-black" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Select a Property</h2>
          <p className="text-gray-700 mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Your Properties <span className="text-gray-500">{propertyData.length}</span></h3>
            <Button 
              variant="outline" 
              className="border-[#174c65] text-[#174c65] hover:bg-[#174c65] hover:text-white"
              onClick={() => setIsAddPropertyDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> ADD PROPERTY
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {propertyData.map((property) => (
              <div 
                key={property.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                  selectedPropertyId === property.id 
                    ? "border-[#174c65] ring-2 ring-[#174c65]/20" 
                    : "border-gray-200"
                }`}
              >
                <div className="h-52 overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.type} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2">{property.type}</h4>
                  <p className="text-gray-600 mb-4">{property.address}</p>
                  <Button 
                    variant={selectedPropertyId === property.id ? "default" : "outline"}
                    className={selectedPropertyId === property.id 
                      ? "w-full bg-[#174c65] text-white" 
                      : "w-full border-[#174c65] text-[#174c65] hover:bg-[#174c65] hover:text-white"}
                    onClick={() => selectProperty(property.id)}
                  >
                    {selectedPropertyId === property.id ? "SELECTED" : "SELECT"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="flex items-center text-[#174c65]"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="text-[#174c65] border-[#174c65]"
              >
                SAVE & EXIT
              </Button>
              <Button
                className={`flex items-center ${
                  selectedPropertyId ? "bg-[#174c65] hover:bg-[#174c65]/90" : "bg-gray-300 hover:bg-gray-400"
                } text-white`}
                disabled={!selectedPropertyId}
                onClick={selectedPropertyId ? goToNextStep : undefined}
              >
                NEXT <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Property Dialog */}
          <AddPropertyDialog 
            open={isAddPropertyDialogOpen} 
            onClose={() => setIsAddPropertyDialogOpen(false)}
            onAddProperty={addProperty}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
