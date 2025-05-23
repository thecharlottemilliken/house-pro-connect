
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface RoomAssetWithType {
  name: string;
  roomName: string;
  url: string;
  type: 'design' | 'before-photo' | 'inspiration';
  tags?: string[];
  roomId?: string;
}

export function useRoomAssets(projectData: any, propertyDetails: any) {
  const [allAssets, setAllAssets] = useState<RoomAssetWithType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);

  // Helper to normalize room names consistently
  const normalizeRoomName = (name: string): string => {
    if (!name) return 'Unknown';
    
    // Convert to title case and trim any extra spaces
    return name.trim()
      .split('_').join(' ') // Replace underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  // Find the best matching room in the database
  const findBestMatchingRoom = (roomName: string, dbRooms: any[]): any | null => {
    if (!roomName) return null;
    
    // Normalize for comparison
    const normalizedName = roomName.toLowerCase().trim();
    
    // Try exact match first (case insensitive)
    const exactMatch = dbRooms.find(r => r.name.toLowerCase() === normalizedName);
    if (exactMatch) return exactMatch;
    
    // Try partial match
    return dbRooms.find(r => 
      r.name.toLowerCase().includes(normalizedName) || 
      normalizedName.includes(r.name.toLowerCase())
    ) || null;
  };

  // Helper to get tags for an asset URL from design preferences
  const getTagsForAsset = (url: string, designPreferences: any): string[] => {
    if (!designPreferences?.designAssets) return [];
    
    const asset = designPreferences.designAssets.find((a: any) => a.url === url);
    return asset?.tags || [];
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
        const designPreferences = projectData?.design_preferences || {};
        const beforePhotos = designPreferences.beforePhotos || {};
        const blueprintUrl = propertyDetails?.blueprint_url;
        const inspirationImages = designPreferences.inspirationImages || [];
        const renovationAreas = projectData?.renovation_areas || [];
        
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

        // Normalize room names
        const normalizedRooms = roomsData?.map(room => ({
          ...room,
          name: normalizeRoomName(room.name)
        })) || [];
        
        setRooms(normalizedRooms);

        // Fetch room design preferences
        const roomIds = normalizedRooms.map(room => room.id);
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
              tags: getTagsForAsset(url, designPreferences)
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
              tags: getTagsForAsset(url, designPreferences)
            }));
            allRoomAssets = [...allRoomAssets, ...drawings];
          }

          // Add room-specific inspiration images
          if (pref.inspiration_images && Array.isArray(pref.inspiration_images)) {
            const inspirations = pref.inspiration_images.map((url: string, index: number) => ({
              roomName,
              roomId: room?.id,
              name: `Inspiration ${index + 1}`,
              url,
              type: 'inspiration' as const,
              tags: getTagsForAsset(url, designPreferences)
            }));
            allRoomAssets = [...allRoomAssets, ...inspirations];
          }
        });

        // Process before photos from design preferences
        Object.entries(beforePhotos).forEach(([room, photos]) => {
          if (Array.isArray(photos)) {
            const normalizedRoomName = normalizeRoomName(room);
            const matchingRoom = findBestMatchingRoom(normalizedRoomName, normalizedRooms);
            const finalRoomName = matchingRoom?.name || normalizedRoomName || "Other";
            
            const beforePhotoAssets = (photos as string[]).map((url, index) => ({
              roomName: finalRoomName,
              roomId: matchingRoom?.id || room.toLowerCase(),
              name: `Before Photo ${index + 1}`,
              url,
              type: 'before-photo' as const,
              tags: getTagsForAsset(url, designPreferences)
            }));
            allRoomAssets = [...allRoomAssets, ...beforePhotoAssets];
          }
        });

        // Process global inspiration images - Changed from 'General' to 'Uncategorized'
        if (Array.isArray(inspirationImages)) {
          const globalInspirations = inspirationImages.map((url, index) => ({
            roomName: 'Uncategorized',
            roomId: 'general',
            name: `Inspiration ${index + 1}`,
            url,
            type: 'inspiration' as const,
            tags: getTagsForAsset(url, designPreferences)
          }));
          allRoomAssets = [...allRoomAssets, ...globalInspirations];
        }

        // Process design assets from design_preferences
        if (designPreferences.designAssets && Array.isArray(designPreferences.designAssets)) {
          const designAssets = designPreferences.designAssets.map((asset: any) => {
            let roomName = asset.roomId || 'Uncategorized'; // Changed from 'General' to 'Uncategorized'
            
            // If we have room ID, get proper name from database rooms
            if (asset.roomId) {
              const matchingRoom = normalizedRooms.find(r => 
                r.id.toLowerCase() === asset.roomId.toLowerCase() ||
                r.name.toLowerCase() === asset.roomId.toLowerCase()
              );
              if (matchingRoom) roomName = matchingRoom.name;
            }
            
            // If we have tags with room names, try to extract the room name
            if (!roomName && asset.tags && asset.tags.length > 0) {
              const roomTag = asset.tags.find((tag: string) => 
                normalizedRooms.some(room => tag.toLowerCase() === room.name.toLowerCase())
              );
              if (roomTag) roomName = roomTag;
            }
            
            return {
              roomName: normalizeRoomName(roomName),
              roomId: asset.roomId,
              name: asset.name || `Asset ${asset.url.split('/').pop()}`,
              url: asset.url,
              type: 'design' as const,
              tags: asset.tags || []
            };
          });
          
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
            tags: getTagsForAsset(blueprintUrl, designPreferences)
          });
        }

        setAllAssets(allRoomAssets);
      } catch (error) {
        console.error("Error in fetchRoomData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [projectData, propertyDetails]);

  return {
    allAssets,
    isLoading,
    rooms
  };
}
