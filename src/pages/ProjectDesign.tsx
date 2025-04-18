
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData, DesignPreferences, RenovationArea } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyDesignState from "@/components/project/design/EmptyDesignState";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import RoomDetails from "@/components/project/design/RoomDetails";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

import DesignAssetsCard from "@/components/project/design/DesignAssetsCard";
import PinterestInspirationSection from "@/components/project/design/PinterestInspirationSection";
import PinterestConnector from "@/components/project/design/PinterestConnector";
import { type PinterestBoard } from "@/types/pinterest";
import { useEffect, useState } from "react";

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { projectData, propertyDetails, isLoading } = useProjectData(params.projectId, location.state);
  const [propertyRooms, setPropertyRooms] = useState<{id: string, name: string}[]>([]);
  const [roomPreferences, setRoomPreferences] = useState<Record<string, {
    inspirationImages: string[];
    pinterestBoards: PinterestBoard[];
  }>>({});
  
  useEffect(() => {
    if (propertyDetails?.id) {
      fetchPropertyRooms(propertyDetails.id);
    }
  }, [propertyDetails?.id]);
  
  const fetchPropertyRooms = async (propertyId: string) => {
    try {
      const { data: rooms, error } = await supabase
        .from('property_rooms')
        .select('id, name')
        .eq('property_id', propertyId);
        
      if (error) throw error;
      
      if (rooms) {
        setPropertyRooms(rooms);
        // Once we have the rooms, fetch preferences for each room
        for (const room of rooms) {
          fetchRoomDesignPreferences(room.id);
        }
      }
    } catch (error) {
      console.error('Error fetching property rooms:', error);
    }
  };

  const fetchRoomDesignPreferences = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_design_preferences')
        .select('pinterest_boards, inspiration_images')
        .eq('room_id', roomId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', error);
        return;
      }
      
      if (data) {
        setRoomPreferences(prev => ({
          ...prev,
          [roomId]: {
            inspirationImages: data.inspiration_images || [],
            pinterestBoards: (data.pinterest_boards as any as PinterestBoard[]) || []
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching room design preferences:', error);
    }
  };
  
  if (isLoading || !projectData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  console.log("Property details:", propertyDetails);
  console.log("Blueprint URL:", propertyDetails?.blueprint_url);

  const designPreferences = (projectData.design_preferences as unknown as DesignPreferences) || {
    hasDesigns: false,
    designers: [],
    designAssets: [],
    renderingImages: [],
    inspirationImages: [],
    pinterestBoards: {},
    beforePhotos: {},
    roomMeasurements: {}
  };

  const hasDesigns = designPreferences.hasDesigns;
  const hasRenderings = designPreferences.renderingImages && designPreferences.renderingImages.length > 0;
  const hasInspiration = designPreferences.inspirationImages && designPreferences.inspirationImages.length > 0;
  const pinterestBoards = designPreferences.pinterestBoards || {};
  
  const renovationAreas = (projectData.renovation_areas as unknown as RenovationArea[]) || [];
  const defaultTab = renovationAreas[0]?.area?.toLowerCase() || "kitchen";
  
  const propertyPhotos = propertyDetails?.home_photos || [];

  const handleAddDesignPlans = () => console.log("Add design plans clicked");
  const handleAddDesigner = () => console.log("Add designer clicked");
  const handleAddRenderings = () => console.log("Add renderings clicked");
  const handleAddDrawings = () => console.log("Add drawings clicked");
  const handleAddBlueprints = () => console.log("Add blueprints clicked");
  const handleAddInspiration = () => console.log("Add inspiration clicked");

  const handleAddInspirationImages = async (images: string[], roomId?: string) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required to add inspiration images");
      }
      
      const { error } = await supabase
        .from('room_design_preferences')
        .update({ 
          inspiration_images: images,
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomId);
      
      if (error) throw error;
      
      setRoomPreferences(prev => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          inspirationImages: images
        }
      }));
      
      toast({
        title: "Success",
        description: `Added ${images.length} inspiration images`,
      });
      
    } catch (error: any) {
      console.error('Error adding inspiration images:', error);
      toast({
        title: "Error",
        description: "Failed to add inspiration images",
        variant: "destructive"
      });
    }
  };

  const handleAddPinterestBoards = async (boards: PinterestBoard[], roomName: string, roomId?: string) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required to add Pinterest boards");
      }
      
      // Convert PinterestBoard[] to a format compatible with Supabase's Json type
      const boardsForStorage = boards.map(board => ({
        id: board.id,
        name: board.name,
        url: board.url,
        imageUrl: board.imageUrl,
        pins: board.pins ? board.pins.map(pin => ({
          id: pin.id,
          imageUrl: pin.imageUrl,
          description: pin.description
        })) : undefined
      }));
      
      const { error } = await supabase
        .from('room_design_preferences')
        .update({ 
          pinterest_boards: boardsForStorage as Json,
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomId);
      
      if (error) throw error;
      
      setRoomPreferences(prev => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          pinterestBoards: boards
        }
      }));
      
      toast({
        title: "Success",
        description: `Added Pinterest boards to ${roomName}`,
      });
      
    } catch (error: any) {
      console.error('Error adding Pinterest boards:', error);
      toast({
        title: "Error",
        description: "Failed to add Pinterest boards",
        variant: "destructive"
      });
    }
  };

  const handleSelectBeforePhotos = async (area: string, selectedPhotos: string[]) => {
    try {
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      
      const updatedBeforePhotos = { 
        ...(designPreferences.beforePhotos || {}),
        [areaKey]: selectedPhotos
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        beforePhotos: updatedBeforePhotos
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Selected photos added to ${area}`,
      });
      
    } catch (error: any) {
      console.error('Error updating before photos:', error);
      toast({
        title: "Error",
        description: "Failed to save selected photos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUploadBeforePhotos = async (area: string, uploadedPhotos: string[]) => {
    try {
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      
      const existingPhotos = designPreferences.beforePhotos?.[areaKey] || [];
      
      const updatedBeforePhotos = { 
        ...(designPreferences.beforePhotos || {}),
        [areaKey]: [...existingPhotos, ...uploadedPhotos]
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        beforePhotos: updatedBeforePhotos
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Uploaded photos added to ${area}`,
      });
      
    } catch (error: any) {
      console.error('Error updating before photos:', error);
      toast({
        title: "Error",
        description: "Failed to save uploaded photos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveMeasurements = async (area: string, measurements: any) => {
    try {
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      
      const updatedMeasurements = { 
        ...(designPreferences.roomMeasurements || {}),
        [areaKey]: measurements
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        roomMeasurements: updatedMeasurements
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Measurements saved for ${area}`,
      });
      
    } catch (error: any) {
      console.error('Error updating room measurements:', error);
      toast({
        title: "Error",
        description: "Failed to save measurements. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createRoomIfNeeded = async (propertyId: string, roomName: string) => {
    try {
      // Check if room exists
      const { data: existingRooms, error: fetchError } = await supabase
        .from('property_rooms')
        .select('id, name')
        .eq('property_id', propertyId)
        .eq('name', roomName);
      
      if (fetchError) throw fetchError;
      
      // If room exists, return it
      if (existingRooms && existingRooms.length > 0) {
        return existingRooms[0];
      }
      
      // If room doesn't exist, create it
      const { data: newRoom, error: createError } = await supabase
        .from('property_rooms')
        .insert({
          property_id: propertyId,
          name: roomName
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Add the new room to our local state
      setPropertyRooms(prev => [...prev, { id: newRoom.id, name: newRoom.name }]);
      
      return newRoom;
    } catch (error) {
      console.error('Error creating/fetching room:', error);
      return null;
    }
  };

  const getRoomIdByName = (roomName: string) => {
    const room = propertyRooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());
    return room?.id;
  };

  // Setup rooms when the component first loads
  useEffect(() => {
    const setupRooms = async () => {
      if (propertyDetails?.id && renovationAreas.length > 0) {
        for (const area of renovationAreas) {
          await createRoomIfNeeded(propertyDetails.id, area.area);
        }
      }
    };
    
    setupRooms();
  }, [propertyDetails?.id, renovationAreas]);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectData.id} 
            projectTitle={projectData.title}
            activePage="design"
          />
          
          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Project Design
              </h1>
              
              {propertyDetails?.blueprint_url && (
                <div className="p-2 mb-4 bg-gray-100 rounded text-xs">
                  <p>Debug: Blueprint URL: {propertyDetails.blueprint_url}</p>
                </div>
              )}
              
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-3">Select a room</h2>
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="mb-4">
                    {renovationAreas.map((area, index) => (
                      <TabsTrigger 
                        key={area.area} 
                        value={area.area.toLowerCase()}
                        className="flex items-center gap-2"
                      >
                        <span className={`w-5 h-5 flex items-center justify-center ${index === 0 ? 'bg-[#174c65] text-white' : 'bg-gray-300 text-gray-600'} rounded-full text-xs`}>
                          {index + 1}
                        </span>
                        {area.area}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {renovationAreas.map((area) => {
                    const areaKey = area.area.toLowerCase().replace(/\s+/g, '_');
                    const beforePhotos = designPreferences.beforePhotos?.[areaKey] || [];
                    const measurements = designPreferences.roomMeasurements?.[areaKey];
                    const roomId = getRoomIdByName(area.area);
                    const roomPrefs = roomId ? roomPreferences[roomId] : null;
                    
                    return (
                      <TabsContent key={area.area} value={area.area.toLowerCase()} className="w-full">
                        {hasDesigns ? (
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
                            <div className="col-span-1 lg:col-span-2 w-full">
                              <RoomDetails
                                area={area.area}
                                location={area.location}
                                designers={designPreferences.designers}
                                designAssets={designPreferences.designAssets}
                                measurements={measurements}
                                onAddDesigner={() => console.log("Add designer clicked")}
                                onUploadAssets={() => console.log("Upload assets clicked")}
                                onSaveMeasurements={(newMeasurements) => handleSaveMeasurements(area.area, newMeasurements)}
                                propertyPhotos={propertyPhotos}
                                onSelectBeforePhotos={(photos) => handleSelectBeforePhotos(area.area, photos)}
                                onUploadBeforePhotos={(photos) => handleUploadBeforePhotos(area.area, photos)}
                                beforePhotos={beforePhotos}
                              />
                            </div>
                            
                            <div className="col-span-1 lg:col-span-3 w-full">
                              <DesignAssetsCard
                                hasRenderings={hasRenderings}
                                renderingImages={designPreferences.renderingImages}
                                onAddRenderings={handleAddRenderings}
                                onAddDrawings={handleAddDrawings}
                                onAddBlueprints={handleAddBlueprints}
                                propertyBlueprint={propertyDetails?.blueprint_url || null}
                                propertyId={propertyDetails?.id}
                              />
                            </div>
                          </div>
                        ) : (
                          <EmptyDesignState 
                            type="no-designs" 
                            onAction={handleAddDesignPlans}
                          />
                        )}
                        
                        <div className="mt-8 w-full">
                          {roomId && (
                            <PinterestInspirationSection 
                              inspirationImages={roomPrefs?.inspirationImages || []}
                              pinterestBoards={roomPrefs?.pinterestBoards || []}
                              onAddInspiration={handleAddInspirationImages}
                              onAddPinterestBoards={handleAddPinterestBoards}
                              currentRoom={area.area}
                              roomId={roomId}
                            />
                          )}
                        </div>

                        <div className="mt-8 w-full">
                          <RecommendedContent />
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
              
              <div className="mt-8 w-full">
                <RecommendedContent />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDesign;
