
import React, { useEffect, useState } from 'react';
import { FileImage, Download, Eye, Loader } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
}

type AssetType = 'inspiration' | 'before-photos' | 'drawings' | 'renderings' | 'blueprints';

export function PreviewSidebar({ projectData, propertyDetails }: PreviewSidebarProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<AssetType>('inspiration');
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [roomRenderings, setRoomRenderings] = useState<string[]>([]);
  const [roomDrawings, setRoomDrawings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const designPreferences = projectData?.design_preferences || {};
  
  // Extract data with better fallbacks and add more detailed logging
  const beforePhotos = designPreferences.beforePhotos || {};
  const blueprintUrl = propertyDetails?.blueprint_url;
  const inspirationImages = designPreferences.inspirationImages || [];

  // For debugging
  console.info("Design Preferences:", designPreferences);
  console.info("Before Photos:", beforePhotos);
  console.info("Inspiration Images:", inspirationImages);
  console.info("Blueprint URL:", blueprintUrl);

  // Fetch room-specific renderings and drawings when component mounts or property ID changes
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!propertyDetails?.id) {
        console.info("No property ID available");
        return;
      }

      setIsLoading(true);
      try {
        // First, get the rooms for this property
        const { data: rooms, error: roomsError } = await supabase
          .from('property_rooms')
          .select('id, name')
          .eq('property_id', propertyDetails.id);

        if (roomsError) {
          console.error("Error fetching rooms:", roomsError);
          return;
        }

        console.info("Rooms for property:", rooms);

        if (!rooms || rooms.length === 0) {
          console.info("No rooms found for this property");
          return;
        }

        // Get all the design preferences for all rooms
        const roomIds = rooms.map(room => room.id);
        const { data: designPrefs, error: prefsError } = await supabase
          .from('room_design_preferences')
          .select('room_id, renderings, drawings')
          .in('room_id', roomIds);

        if (prefsError) {
          console.error("Error fetching room design preferences:", prefsError);
          return;
        }

        console.info("Room design preferences:", designPrefs);

        // Collect all renderings and drawings from all rooms
        let allRenderings: string[] = [];
        let allDrawings: string[] = [];

        designPrefs?.forEach(pref => {
          if (pref.renderings && Array.isArray(pref.renderings)) {
            allRenderings = [...allRenderings, ...pref.renderings];
          }
          
          if (pref.drawings && Array.isArray(pref.drawings)) {
            allDrawings = [...allDrawings, ...pref.drawings];
          }
        });

        console.info("All room renderings:", allRenderings);
        console.info("All room drawings:", allDrawings);

        setRoomRenderings(allRenderings);
        setRoomDrawings(allDrawings);
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
        // Use the room drawings fetched from the database
        console.info("Processing drawings:", roomDrawings);
        return Array.isArray(roomDrawings) ? roomDrawings.map((url: string, index: number) => {
          console.info(`Drawing ${index}:`, url);
          return {
            name: `Drawing ${index + 1}`,
            room: 'Design',
            url
          };
        }) : [];
      case 'renderings':
        // Use the room renderings fetched from the database
        console.info("Processing renderings:", roomRenderings);
        return Array.isArray(roomRenderings) ? roomRenderings.map((url: string, index: number) => {
          console.info(`Rendering ${index}:`, url);
          return {
            name: `Rendering ${index + 1}`,
            room: 'Design',
            url
          };
        }) : [];
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

  return (
    <>
      <div className="w-[320px] border-r bg-background h-[calc(100vh-56px)] flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold mb-2">Build the SOW</h1>
          <p className="text-gray-500 mb-6">Create a detailed statement of work.</p>
          
          <h2 className="text-lg font-semibold mb-4">Project Assets</h2>
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
            {isLoading && selectedType === 'renderings' || selectedType === 'drawings' ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 text-gray-400 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
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
                {filteredAssets.length === 0 && (
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
