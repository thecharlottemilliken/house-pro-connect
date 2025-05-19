
import { useMemo } from 'react';
import { RoomAssetWithType } from './useRoomAssets';

export function useRoomOptions(
  projectData: any,
  propertyDetails: any,
  allAssets: RoomAssetWithType[]
) {
  // Get the list of unique room names from renovation areas and existing rooms
  const roomOptions = useMemo(() => {
    const renovationAreas = projectData?.renovation_areas || [];
    const blueprintUrl = propertyDetails?.blueprint_url;
    
    // Start with renovation areas
    const renovationRooms = renovationAreas
      .map((area: any) => area.area)
      .filter(Boolean)
      .map((name: string) => {
        if (!name) return '';
        
        // Convert to title case
        return name.trim()
          .split('_').join(' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      });
    
    // Extract unique room names from assets
    const assetRoomNames = [...new Set(allAssets.map(asset => asset.roomName))];
    
    // Always include Property if blueprint exists
    const specialRooms = blueprintUrl ? ['Property'] : [];
    
    // Combine all unique room names
    const uniqueRooms = [...new Set([
      ...renovationRooms,
      ...assetRoomNames,
      ...specialRooms
    ])];
    
    // Sort alphabetically and filter out empty/undefined values
    return uniqueRooms
      .filter(Boolean)
      .sort();
  }, [projectData?.renovation_areas, allAssets, propertyDetails?.blueprint_url]);

  return { roomOptions };
}
