
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
      const tagMatch = asset.tags && asset.tags.some(tag => tag.toLowerCase() === selectedRoomLower);
      
      // More flexible matching to include partial matches
      const partialRoomNameMatch = asset.roomName.toLowerCase().includes(selectedRoomLower) || 
                                 selectedRoomLower.includes(asset.roomName.toLowerCase());

      return roomNameMatch || roomIdMatch || tagMatch || partialRoomNameMatch;
    });
  }, [allAssets, selectedRoom]);

  // Get inspiration assets for the current room selection
  const inspirationAssets = useMemo(() => {
    return filteredAssets.filter(asset => asset.type === 'inspiration');
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
