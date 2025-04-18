
import React from "react";
import { X, FileText, Image, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectData, PropertyDetails } from "@/hooks/useProjectData";

interface ResourcesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  propertyDetails: PropertyDetails;
  projectData: ProjectData | null;
}

const ResourcesSidebar: React.FC<ResourcesSidebarProps> = ({
  isOpen,
  onToggle,
  propertyDetails,
  projectData
}) => {
  const renderBlueprintSection = () => {
    return (
      <div className="mt-4">
        {propertyDetails.blueprint_url ? (
          <div>
            <a 
              href={propertyDetails.blueprint_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="border rounded-md p-4 flex items-center gap-3 hover:bg-gray-50">
                <FileText className="text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">Property Blueprint</p>
                  <p className="text-sm text-gray-500">Click to view</p>
                </div>
              </div>
            </a>
          </div>
        ) : (
          <div className="text-gray-500 italic text-sm">
            No blueprints available
          </div>
        )}
      </div>
    );
  };

  const renderPhotosSection = () => {
    const photos = propertyDetails.home_photos || [];
    const imageUrl = propertyDetails.image_url;
    
    const allPhotos = [...photos];
    if (imageUrl && !allPhotos.includes(imageUrl)) {
      allPhotos.push(imageUrl);
    }
    
    return (
      <div className="mt-4">
        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {allPhotos.map((photo, index) => (
              <div 
                key={index}
                className="aspect-square rounded-md overflow-hidden border"
              >
                <img 
                  src={photo} 
                  alt={`Property ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic text-sm">
            No property photos available
          </div>
        )}
      </div>
    );
  };

  const renderRoomPhotosSection = () => {
    const designPrefs = projectData?.design_preferences || null;
    const beforePhotos = designPrefs?.beforePhotos || {};
    const roomKeys = Object.keys(beforePhotos);
    
    return (
      <div className="mt-4">
        {roomKeys.length > 0 ? (
          <div className="space-y-4">
            {roomKeys.map((room) => (
              <div key={room}>
                <h3 className="font-medium mb-2">{room}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {beforePhotos[room].map((photo, index) => (
                    <div 
                      key={index}
                      className="aspect-square rounded-md overflow-hidden border"
                    >
                      <img 
                        src={photo} 
                        alt={`${room} ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic text-sm">
            No room photos available
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border-l border-gray-200 bg-white ${isOpen ? 'lg:w-80 w-full' : 'w-0 hidden'} transition-all`}>
      <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
        <h3 className="font-medium">Project Resources</h3>
        <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
          <X className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggle} 
          className="hidden lg:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-166px)]">
        <div className="p-4">
          <Tabs defaultValue="blueprints">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="blueprints">
                <FileText className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Blueprints</span>
              </TabsTrigger>
              <TabsTrigger value="photos">
                <Image className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Photos</span>
              </TabsTrigger>
              <TabsTrigger value="rooms">
                <Layers className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Rooms</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="blueprints">
              <h3 className="text-sm font-semibold mb-2">Property Blueprint</h3>
              {renderBlueprintSection()}
            </TabsContent>
            
            <TabsContent value="photos">
              <h3 className="text-sm font-semibold mb-2">Property Photos</h3>
              {renderPhotosSection()}
            </TabsContent>
            
            <TabsContent value="rooms">
              <h3 className="text-sm font-semibold mb-2">Room Photos</h3>
              {renderRoomPhotosSection()}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      
      <div className="hidden lg:flex absolute -left-10 top-1/2 -translate-y-1/2">
        <Button 
          variant="secondary"
          size="icon"
          onClick={onToggle}
          className={`rounded-full shadow-md ${isOpen ? 'hidden' : ''}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ResourcesSidebar;
