
import React, { useEffect, useState } from 'react';
import { FileImage, Download, Eye, Loader, Info, Building, MapPin, Settings, Tag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
}

interface RoomAssetWithType {
  name: string;
  roomName: string;
  url: string;
  type: 'design' | 'before-photo' | 'inspiration';
  tags?: string[];
  roomId?: string;
}

interface Room {
  id: string;
  name: string;
}

export function PreviewSidebar({ projectData, propertyDetails }: PreviewSidebarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allAssets, setAllAssets] = useState<RoomAssetWithType[]>([]);

  const designPreferences = projectData?.design_preferences || {};
  const beforePhotos = designPreferences.beforePhotos || {};
  const blueprintUrl = propertyDetails?.blueprint_url;
  const inspirationImages = designPreferences.inspirationImages || [];

  // Normalize room name for consistent formatting
  const normalizeRoomName = (name: string): string => {
    if (!name) return 'Unknown';
    
    // Convert to title case and trim any extra spaces
    const formattedName = name.trim()
      .split('_').join(' ') // Replace underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
    
    return formattedName;
  };

  // Find the best matching room in the database
  const findBestMatchingRoom = (roomName: string, dbRooms: Room[]): Room | null => {
    if (!roomName) return null;
    
    // Try exact match first (case insensitive)
    const normalizedName = normalizeRoomName(roomName).toLowerCase();
    const exactMatch = dbRooms.find(r => r.name.toLowerCase() === normalizedName);
    if (exactMatch) return exactMatch;

    // No match found
    return null;
  };

  // Load all room and asset data
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!propertyDetails?.id) {
        console.info("No property ID available");
        return;
      }

      setIsLoading(true);
      try {
        // Fetch rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from('property_rooms')
          .select('id, name')
          .eq('property_id', propertyDetails.id);

        if (roomsError) {
          console.error("Error fetching rooms:", roomsError);
          setIsLoading(false);
          return;
        }

        if (!roomsData || roomsData.length === 0) {
          console.info("No rooms found for this property");
          setIsLoading(false);
          return;
        }

        // Normalize room names for consistent display
        const normalizedRooms = roomsData.map(room => ({
          ...room,
          name: normalizeRoomName(room.name)
        }));
        
        setRooms(normalizedRooms);

        // Fetch all room assets
        const roomIds = roomsData.map(room => room.id);
        const { data: designPrefs, error: prefsError } = await supabase
          .from('room_design_preferences')
          .select('room_id, renderings, drawings, inspiration_images')
          .in('room_id', roomIds);

        if (prefsError) {
          console.error("Error fetching room design preferences:", prefsError);
          setIsLoading(false);
          return;
        }

        // Process all assets with their types
        let allRoomAssets: RoomAssetWithType[] = [];

        // Process room-specific assets
        designPrefs?.forEach(pref => {
          const room = normalizedRooms.find(r => r.id === pref.room_id);
          const roomName = room?.name || 'Unknown Room';

          // Add renderings as design assets
          if (pref.renderings && Array.isArray(pref.renderings)) {
            const renderings = pref.renderings.map(url => ({
              roomName,
              roomId: room?.id,
              name: `Rendering - ${url.split('/').pop()?.split('?')[0] || 'Unnamed'}`,
              url,
              type: 'design' as const,
              tags: getTagsForAsset(url)
            }));
            allRoomAssets = [...allRoomAssets, ...renderings];
          }
          
          // Add drawings as design assets
          if (pref.drawings && Array.isArray(pref.drawings)) {
            const drawings = pref.drawings.map(url => ({
              roomName,
              roomId: room?.id,
              name: `Drawing - ${url.split('/').pop()?.split('?')[0] || 'Unnamed'}`,
              url,
              type: 'design' as const,
              tags: getTagsForAsset(url)
            }));
            allRoomAssets = [...allRoomAssets, ...drawings];
          }

          // Add room-specific inspiration images
          if (pref.inspiration_images && Array.isArray(pref.inspiration_images)) {
            const inspirations = pref.inspiration_images.map((url, index) => ({
              roomName,
              roomId: room?.id,
              name: `Inspiration ${index + 1}`,
              url,
              type: 'inspiration' as const,
              tags: getTagsForAsset(url)
            }));
            allRoomAssets = [...allRoomAssets, ...inspirations];
          }
        });

        // Process before photos from design preferences
        Object.entries(beforePhotos || {}).forEach(([room, photos]) => {
          if (Array.isArray(photos)) {
            // Find matching room in database or use "Other" category
            const normalizedRoomName = normalizeRoomName(room);
            const matchingRoom = findBestMatchingRoom(normalizedRoomName, normalizedRooms);
            const finalRoomName = matchingRoom?.name || "Other";
            
            const beforePhotoAssets = photos.map((url, index) => ({
              roomName: finalRoomName,
              roomId: matchingRoom?.id || room.toLowerCase(), // Use original room key as fallback
              name: `Before Photo ${index + 1}`,
              url,
              type: 'before-photo' as const,
              tags: getTagsForAsset(url)
            }));
            allRoomAssets = [...allRoomAssets, ...beforePhotoAssets];
          }
        });

        // Process global inspiration images
        if (Array.isArray(inspirationImages)) {
          const globalInspirations = inspirationImages.map((url, index) => ({
            roomName: 'General',
            roomId: 'general',
            name: `Inspiration ${index + 1}`,
            url,
            type: 'inspiration' as const,
            tags: getTagsForAsset(url)
          }));
          allRoomAssets = [...allRoomAssets, ...globalInspirations];
        }

        // Process design assets from design_preferences
        if (designPreferences.designAssets && Array.isArray(designPreferences.designAssets)) {
          const designAssets = designPreferences.designAssets.map((asset: any) => {
            let roomName = asset.roomId || 'General';
            
            // If we have room ID, get proper name from database rooms
            if (asset.roomId) {
              const matchingRoom = normalizedRooms.find(r => 
                r.id.toLowerCase() === asset.roomId.toLowerCase() ||
                r.name.toLowerCase() === asset.roomId.toLowerCase()
              );
              if (matchingRoom) {
                roomName = matchingRoom.name;
              }
            }
            
            // If we have tags with room names, try to extract the room name
            if (!roomName && asset.tags && asset.tags.length > 0) {
              // Look for tags that might contain room names
              const roomTag = asset.tags.find((tag: string) => 
                normalizedRooms.some(room => tag === room.name)
              );
              if (roomTag) {
                roomName = roomTag;
              }
            }
            
            return {
              roomName: normalizeRoomName(roomName),
              roomId: asset.roomId, // Keep the original roomId for filtering
              name: asset.name || `Asset ${asset.url.split('/').pop()}`,
              url: asset.url,
              type: 'design' as const,
              tags: asset.tags || []
            };
          });
          
          console.log("Design assets from preferences:", designAssets);
          allRoomAssets = [...allRoomAssets, ...designAssets];
        }

        // Add blueprint as a design asset if available
        if (blueprintUrl) {
          allRoomAssets.push({
            roomName: 'Property',
            roomId: 'property',
            name: 'Blueprint',
            url: blueprintUrl,
            type: 'design',
            tags: getTagsForAsset(blueprintUrl)
          });
        }

        console.log("All room assets:", allRoomAssets);
        setAllAssets(allRoomAssets);
      } catch (error) {
        console.error("Error in fetchRoomData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [propertyDetails?.id, beforePhotos, inspirationImages, blueprintUrl, designPreferences]);

  // Helper to get tags for an asset URL from design preferences
  const getTagsForAsset = (url: string): string[] => {
    if (!designPreferences.designAssets) return [];
    
    const asset = designPreferences.designAssets.find((a: any) => a.url === url);
    return asset?.tags || [];
  };

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

  // Filter assets based on the selected room
  const getFilteredAssets = () => {
    if (selectedRoom === "all") {
      return allAssets;
    }
    
    const selectedRoomLower = selectedRoom.toLowerCase();
    console.log("Filtering for room:", selectedRoomLower);
    
    const filtered = allAssets.filter(asset => {
      const roomNameMatch = asset.roomName.toLowerCase() === selectedRoomLower;
      const roomIdMatch = asset.roomId && asset.roomId.toLowerCase() === selectedRoomLower;
      return roomNameMatch || roomIdMatch;
    });
    
    console.log("Filtered assets:", filtered);
    return filtered;
  };

  // Group assets by type for display
  const groupAssetsByType = (assets: RoomAssetWithType[]) => {
    const groups: {
      [key: string]: RoomAssetWithType[];
    } = {
      design: [],
      'before-photo': [],
      inspiration: []
    };

    assets.forEach(asset => {
      if (groups[asset.type]) {
        groups[asset.type].push(asset);
      }
    });

    return groups;
  };

  // Get the list of unique room names - ONLY from the database rooms
  const roomOptions = React.useMemo(() => {
    // Only use rooms from the database
    const dbRoomNames = rooms.map(room => room.name);

    // Add 'General' and 'Property' if they have assets
    const hasGeneralAssets = allAssets.some(asset => asset.roomName === 'General');
    const hasPropertyAssets = allAssets.some(asset => asset.roomName === 'Property');
    
    const uniqueRooms = new Set<string>(dbRoomNames);
    if (hasGeneralAssets) uniqueRooms.add('General');
    if (hasPropertyAssets) uniqueRooms.add('Property');
    
    // Sort rooms alphabetically
    return Array.from(uniqueRooms).sort();
  }, [rooms, allAssets]);

  // Component to display a file list item with tags
  const FileListItem = ({ asset }: { asset: RoomAssetWithType }) => (
    <div className="flex flex-col gap-1 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <FileImage className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{asset.name}</p>
            <p className="text-xs text-gray-500">{asset.roomName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={asset.url}
            download
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={() => handlePreview(asset.url)}
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Display tags if available */}
      {asset.tags && asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-12 mt-0.5">
          {asset.tags.map((tag, idx) => (
            <Badge 
              key={`${asset.url}-tag-${idx}`} 
              variant="secondary" 
              className="text-xs px-1.5 py-0 h-5 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  // Component for showing a section of assets by type
  const AssetTypeSection = ({ title, assets }: { title: string, assets: RoomAssetWithType[] }) => {
    if (assets.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2 px-4">
          {title} ({assets.length})
        </h3>
        
        <div className="space-y-1 px-4">
          {assets.map((asset, index) => (
            <FileListItem
              key={`${asset.type}-${asset.roomName}-${index}`}
              asset={asset}
            />
          ))}
        </div>
      </div>
    );
  };

  const filteredAssets = getFilteredAssets();
  const assetGroups = groupAssetsByType(filteredAssets);

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
          <Settings className="w-5 h-5 text-gray-500 mt-0.5" />
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
        <div className="p-0 border-b">
          <ProjectInfo />
          
          <h2 className="text-lg font-semibold mb-4 mt-6 px-4">Project Assets</h2>
          <div className="px-4">
            <Select value={selectedRoom} onValueChange={(value) => setSelectedRoom(value)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Rooms</SelectItem>
                {roomOptions.map((room) => (
                  <SelectItem key={room} value={room.toLowerCase()}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-4">
              <LoadingSkeleton />
            </div>
          ) : (
            <div className="p-0">
              {filteredAssets.length > 0 ? (
                <>
                  <AssetTypeSection title="Design Assets" assets={assetGroups.design} />
                  <AssetTypeSection title="Before Photos" assets={assetGroups['before-photo']} />
                  <AssetTypeSection title="Inspiration" assets={assetGroups.inspiration} />
                </>
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No assets available for {selectedRoom === 'all' ? 'any rooms' : selectedRoom}
                </p>
              )}
            </div>
          )}
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
