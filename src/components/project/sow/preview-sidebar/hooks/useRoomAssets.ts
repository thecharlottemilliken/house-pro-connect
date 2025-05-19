
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

  // Helper to convert a room to standardized tag format
  const getRoomAsTags = (roomName: string, roomId?: string): string[] => {
    if (!roomName) return [];
    
    const normalizedName = roomName.toLowerCase().trim().replace(/\s+/g, '-');
    return [`room:${normalizedName}`];
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
          .select('room_id, renderings, drawings, inspiration_images, design_assets, tags_metadata')
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
          const roomTags = getRoomAsTags(roomName, room?.id);

          // If the room has design_assets, process them first using the new unified system
          if (pref.design_assets && Array.isArray(pref.design_assets) && pref.design_assets.length > 0) {
            pref.design_assets.forEach((asset: any) => {
              // Determine the asset type from the tags, defaulting to 'design'
              const typeTag = asset.tags?.find((tag: string) => tag.startsWith('type:'));
              const type = typeTag 
                ? typeTag.replace('type:', '') as 'design' | 'before-photo' | 'inspiration'
                : 'design';
              
              allRoomAssets.push({
                roomName,
                roomId: room?.id,
                name: asset.name || `Asset - ${asset.url.split('/').pop()?.split('?')[0] || 'Unnamed'}`,
                url: asset.url,
                type,
                tags: [...(asset.tags || []), ...roomTags]
              });
            });
          }

          // Add renderings as design assets
          if (pref.renderings && Array.isArray(pref.renderings)) {
            const renderings = pref.renderings.map(url => ({
              roomName,
              roomId: room?.id,
              name: `Rendering - ${url.split('/').pop()?.split('?')[0] || 'Unnamed'}`,
              url,
              type: 'design' as const,
              tags: [...getTagsForAsset(url, designPreferences), 'type:design', ...roomTags]
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
              tags: [...getTagsForAsset(url, designPreferences), 'type:design', ...roomTags]
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
              tags: [...getTagsForAsset(url, designPreferences), 'type:inspiration', ...roomTags]
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
            const roomTags = getRoomAsTags(finalRoomName, matchingRoom?.id);
            
            const beforePhotoAssets = (photos as string[]).map((url, index) => ({
              roomName: finalRoomName,
              roomId: matchingRoom?.id || room.toLowerCase(),
              name: `Before Photo ${index + 1}`,
              url,
              type: 'before-photo' as const,
              tags: [...getTagsForAsset(url, designPreferences), 'type:before-photo', ...roomTags]
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
            tags: [...getTagsForAsset(url, designPreferences), 'type:inspiration']
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
              if (matchingRoom) roomName = matchingRoom.name;
            }
            
            // If we have tags with room names, try to extract the room name
            const roomTag = asset.tags?.find((tag: string) => tag.startsWith('room:'));
            if (roomTag) {
              const roomSlug = roomTag.split(':')[1];
              const matchingRoom = normalizedRooms.find(r => 
                r.name.toLowerCase().replace(/\s+/g, '-') === roomSlug
              );
              if (matchingRoom) roomName = matchingRoom.name;
            }
            
            // Determine asset type from tags
            let assetType: 'design' | 'before-photo' | 'inspiration' = 'design';
            const typeTag = asset.tags?.find((tag: string) => tag.startsWith('type:'));
            if (typeTag) {
              const tagType = typeTag.split(':')[1];
              if (tagType === 'inspiration') assetType = 'inspiration';
              if (tagType === 'before-photo') assetType = 'before-photo';
            }
            
            return {
              roomName: normalizeRoomName(roomName),
              roomId: asset.roomId,
              name: asset.name || `Asset ${asset.url.split('/').pop()}`,
              url: asset.url,
              type: assetType,
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
            tags: [...getTagsForAsset(blueprintUrl, designPreferences), 'type:blueprint']
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
