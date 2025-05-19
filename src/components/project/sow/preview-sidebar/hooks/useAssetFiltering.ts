
import { useMemo } from 'react';
import { RoomAssetWithType } from './useRoomAssets';

export function useAssetFiltering(
  allAssets: RoomAssetWithType[], 
  selectedRoom: string
) {
  // Improved filter assets based on the selected room
  const filteredAssets = useMemo(() => {
    if (selectedRoom === "all") {
      return allAssets;
    }
    
    const selectedRoomLower = selectedRoom.toLowerCase();
    
    return allAssets.filter(asset => {
      const roomNameMatch = asset.roomName.toLowerCase() === selectedRoomLower;
      const roomIdMatch = asset.roomId && asset.roomId.toLowerCase() === selectedRoomLower;
      
      // Check for room tag match with the new tagging system
      const roomTagMatch = asset.tags && asset.tags.some(tag => 
        tag === `room:${selectedRoomLower}` || 
        tag === `room:${selectedRoomLower.replace(/\s+/g, '-')}`
      );
      
      // More flexible matching to include partial matches
      const partialRoomNameMatch = asset.roomName.toLowerCase().includes(selectedRoomLower) || 
                                 selectedRoomLower.includes(asset.roomName.toLowerCase());

      return roomNameMatch || roomIdMatch || roomTagMatch || partialRoomNameMatch;
    });
  }, [allAssets, selectedRoom]);

  // Get inspiration assets for the current room selection
  const inspirationAssets = useMemo(() => {
    // Use tag-based filtering for inspiration assets
    return filteredAssets.filter(asset => 
      asset.type === 'inspiration' || 
      (asset.tags && asset.tags.includes('type:inspiration'))
    );
  }, [filteredAssets]);

  // Group assets by type for display
  const assetGroups = useMemo(() => {
    // Initialize the groups with empty arrays to ensure they always exist
    const groups: {
      design: RoomAssetWithType[];
      'before-photo': RoomAssetWithType[];
      inspiration: RoomAssetWithType[];
    } = {
      design: [],
      'before-photo': [],
      inspiration: []
    };

    // Populate the groups with filtered assets
    filteredAssets.forEach(asset => {
      // Use tags to determine the type if available
      if (asset.tags) {
        if (asset.tags.includes('type:design')) {
          groups.design.push(asset);
          return;
        }
        if (asset.tags.includes('type:before-photo')) {
          groups['before-photo'].push(asset);
          return;
        }
        if (asset.tags.includes('type:inspiration')) {
          groups.inspiration.push(asset);
          return;
        }
      }
      
      // Fall back to the type property if no type tag is found
      if (asset.type === 'design' || asset.type === 'before-photo' || asset.type === 'inspiration') {
        groups[asset.type].push(asset);
      }
    });

    return groups;
  }, [filteredAssets]);

  return {
    filteredAssets,
    assetGroups,
    inspirationAssets
  };
}
