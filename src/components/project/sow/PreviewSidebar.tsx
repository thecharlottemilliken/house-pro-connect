import React, { useEffect, useState } from 'react';
import { FileImage, Download, Eye, Loader, Info, Building, MapPin, Tool } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
}

type AssetType = 'inspiration' | 'before-photos' | 'drawings' | 'renderings' | 'blueprints';

interface RoomAsset {
  roomName: string;
  url: string;
}

export function PreviewSidebar({ projectData, propertyDetails }: PreviewSidebarProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<AssetType>('inspiration');
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [roomRenderingsWithNames, setRoomRenderingsWithNames] = useState<RoomAsset[]>([]);
  const [roomDrawingsWithNames, setRoomDrawingsWithNames] = useState<RoomAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const designPreferences = projectData?.design_preferences || {};
  
  const beforePhotos = designPreferences.beforePhotos || {};
  const blueprintUrl = propertyDetails?.blueprint_url;
  const inspirationImages = designPreferences.inspirationImages || [];

  console.info("Design Preferences:", designPreferences);
  console.info("Before Photos:", beforePhotos);
  console.info("Inspiration Images:", inspirationImages);
  console.info("Blueprint URL:", blueprintUrl);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!propertyDetails?.id) {
        console.info("No property ID available");
        return;
      }

      setIsLoading(true);
      try {
        const { data: rooms, error: roomsError } = await supabase
          .from('property_rooms')
          .select('id, name')
          .eq('property_id', propertyDetails.id);

        if (roomsError) {
          console.error("Error fetching rooms:", roomsError);
          setIsLoading(false);
          return;
        }

        console.info("Rooms for property:", rooms);

        if (!rooms || rooms.length === 0) {
          console.info("No rooms found for this property");
          setIsLoading(false);
          return;
        }

        const roomIds = rooms.map(room => room.id);
        const { data: designPrefs, error: prefsError } = await supabase
          .from('room_design_preferences')
          .select('room_id, renderings, drawings')
          .in('room_id', roomIds);

        if (prefsError) {
          console.error("Error fetching room design preferences:", prefsError);
          setIsLoading(false);
          return;
        }

        let allRenderingsWithNames: RoomAsset[] = [];
        let allDrawingsWithNames: RoomAsset[] = [];

        designPrefs?.forEach(pref => {
          const room = rooms.find(r => r.id === pref.room_id);
          const roomName = room?.name || 'Unknown Room';

          if (pref.renderings && Array.isArray(pref.renderings)) {
            const renderingsWithRoom = pref.renderings.map(url => ({
              roomName,
              url
            }));
            allRenderingsWithNames = [...allRenderingsWithNames, ...renderingsWithRoom];
          }
          
          if (pref.drawings && Array.isArray(pref.drawings)) {
            const drawingsWithRoom = pref.drawings.map(url => ({
              roomName,
              url
            }));
            allDrawingsWithNames = [...allDrawingsWithNames, ...drawingsWithRoom];
          }
        });

        console.info("All room renderings with names:", allRenderingsWithNames);
        console.info("All room drawings with names:", allDrawingsWithNames);

        setRoomRenderingsWithNames(allRenderingsWithNames);
        setRoomDrawingsWithNames(allDrawingsWithNames);
      } catch (error) {
        console.error("Error in fetchRoomData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [propertyDetails?.id]);

  const handlePreview = (url: string) => {
    setIsPreviewLoading(true);
    setPreviewUrl(url);
  };

  const handleImageLoad = () => {
    setIsPreviewLoading(false);
  };

  const handleImageError = () => {
    setIsPreviewLoading(false);
    console.error("Error loading image:", previewUrl);
  };

  const getFilteredAssets = () => {
    switch (selectedType) {
      case 'inspiration':
        return Array.isArray(inspirationImages) ? inspirationImages.map((url: string, index: number) => ({
          name: `Inspiration ${index + 1}`,
          room: 'Design',
          url
        })) : [];
      case 'before-photos':
        return Object.entries(beforePhotos || {}).flatMap(([room, photos]) => 
          Array.isArray(photos) ? photos.map((url, index) => ({
            name: `Photo ${index + 1}`,
            room,
            url
          })) : []
        );
      case 'drawings':
        console.info("Processing drawings with room names:", roomDrawingsWithNames);
        return roomDrawingsWithNames.map((item, index) => ({
          name: `Drawing ${index + 1}`,
          room: item.roomName,
          url: item.url
        }));
      case 'renderings':
        console.info("Processing renderings with room names:", roomRenderingsWithNames);
        return roomRenderingsWithNames.map((item, index) => ({
          name: `Rendering ${index + 1}`,
          room: item.roomName,
          url: item.url
        }));
      case 'blueprints':
        return blueprintUrl ? [{
          name: 'Blueprint',
          room: 'Property',
          url: blueprintUrl
        }] : [];
      default:
        return [];
    }
  };

  const FileListItem = ({ name, room, url }: { name: string; room: string; url: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <FileImage className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{room}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={url}
          download
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="w-4 h-4" />
        </a>
        <button
          onClick={() => handlePreview(url)}
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const filteredAssets = getFilteredAssets();

  // Loading skeleton UI for assets
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-7 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // Project information blurbs
  const ProjectInfo = () => (
    <div className="px-4 py-3 border-b">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Project Description</h3>
            <p className="text-sm text-gray-500">{projectData?.description || 'No description provided'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Property</h3>
            <p className="text-sm text-gray-500">{propertyDetails?.property_name}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Location</h3>
            <p className="text-sm text-gray-500">{propertyDetails?.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Tool className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Renovation Areas</h3>
            <div className="text-sm text-gray-500">
              {projectData?.renovation_areas?.map((area: any, index: number) => (
                <span key={index} className="inline-block mr-2 mb-1">
                  {area.area}{index < (projectData?.renovation_areas?.length - 1) ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-[320px] border-r bg-background h-[calc(100vh-56px)] flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold mb-2">Build the SOW</h1>
          <p className="text-gray-500 mb-6">Create a detailed statement of work.</p>
          
          <ProjectInfo />
          
          <h2 className="text-lg font-semibold mb-4 mt-6">Project Assets</h2>
          <Select value={selectedType} onValueChange={(value: AssetType) => setSelectedType(value)}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select asset type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="inspiration">Inspiration</SelectItem>
              <SelectItem value="before-photos">Before Photos</SelectItem>
              <SelectItem value="drawings">Drawings</SelectItem>
              <SelectItem value="renderings">Renderings</SelectItem>
              <SelectItem value="blueprints">Blueprints</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Files {selectedType === 'renderings' && '(Renderings)'} {selectedType === 'drawings' && '(Drawings)'}
            </h3>
            
            {isLoading && (selectedType === 'renderings' || selectedType === 'drawings') ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-1">
                {filteredAssets.map((asset, index) => (
                  <FileListItem
                    key={`${asset.name}-${index}`}
                    name={asset.name}
                    room={asset.room}
                    url={asset.url}
                  />
                ))}
                {filteredAssets.length === 0 && !isLoading && (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No {selectedType.replace('-', ' ')} available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            {isPreviewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Loader className="w-10 h-10 text-gray-400 animate-spin" />
              </div>
            )}
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain bg-black/5"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
