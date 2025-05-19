
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

  // Group assets by type for display
  const assetGroups = useMemo(() => {
    const groups: {
      [key: string]: RoomAssetWithType[];
    } = {
      design: [],
      'before-photo': [],
      inspiration: []
    };

    filteredAssets.forEach(asset => {
      if (groups[asset.type]) {
        groups[asset.type].push(asset);
      }
    });

    return groups;
  }, [filteredAssets]);

  return {
    filteredAssets,
    assetGroups
  };
}
