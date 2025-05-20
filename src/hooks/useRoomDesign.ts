import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { type PinterestBoard } from "@/types/pinterest";
import { toast } from "@/hooks/use-toast";
import { normalizeAreaName } from "@/lib/utils";

export interface RoomPreference {
  inspirationImages: string[];
  pinterestBoards: PinterestBoard[];
}

export const useRoomDesign = (propertyId?: string) => {
  const [propertyRooms, setPropertyRooms] = useState<{
    id: string;
    name: string;
  }[]>([]);
  const [roomPreferences, setRoomPreferences] = useState<Record<string, RoomPreference>>({});
  const [defaultTab, setDefaultTab] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchRoomDesignPreferences = useCallback(async (roomId: string) => {
    try {
      console.log(`Fetching room design preferences for room ID: ${roomId}`);
      
      const {
        data,
        error
      } = await supabase.from('room_design_preferences').select('pinterest_boards, inspiration_images').eq('room_id', roomId).single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', error);
        return;
      }
      
      if (data) {
        console.log(`Found room design preferences for room ID: ${roomId}`, data);
        
        // Ensure data properties are correctly formatted
        const inspirationImages = Array.isArray(data.inspiration_images) ? data.inspiration_images : [];
        
        // Ensure pinterest_boards is properly transformed to PinterestBoard[]
        const pinterestBoards: PinterestBoard[] = Array.isArray(data.pinterest_boards) 
          ? data.pinterest_boards.map((board: any) => {
              // Make sure each board has the required fields of PinterestBoard
              if (typeof board === 'object' && board !== null) {
                return {
                  id: String(board.id || ''),
                  name: String(board.name || ''),
                  url: String(board.url || ''),
                  imageUrl: typeof board.imageUrl === 'string' ? board.imageUrl : undefined,
                  pins: Array.isArray(board.pins) 
                    ? board.pins.map((pin: any) => ({
                        id: String(pin.id || ''),
                        imageUrl: String(pin.imageUrl || ''),
                        description: typeof pin.description === 'string' ? pin.description : undefined
                      }))
                    : undefined
                };
              }
              // Fallback for unexpected data
              return {
                id: '',
                name: '',
                url: ''
              };
            })
          : [];
        
        console.log(`Room ${roomId} has ${inspirationImages.length} inspiration images and ${pinterestBoards.length} Pinterest boards`);
        
        setRoomPreferences(prev => ({
          ...prev,
          [roomId]: {
            inspirationImages: inspirationImages,
            pinterestBoards: pinterestBoards
          }
        }));
      } else {
        console.log(`No room design preferences found for room ID: ${roomId}`);
        
        // Set empty arrays as defaults
        setRoomPreferences(prev => ({
          ...prev,
          [roomId]: {
            inspirationImages: [],
            pinterestBoards: []
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching room design preferences:', error);
    }
  }, []);

  const createRoomIfNeeded = useCallback(async (propertyId: string, roomName: string) => {
    if (!propertyId || !roomName) return null;
    try {
      const {
        data: existingRooms,
        error: fetchError
      } = await supabase.from('property_rooms').select('id, name').eq('property_id', propertyId).eq('name', roomName);
      if (fetchError) throw fetchError;
      if (existingRooms && existingRooms.length > 0) {
        return existingRooms[0];
      }
      const {
        data: newRoom,
        error: createError
      } = await supabase.from('property_rooms').insert({
        property_id: propertyId,
        name: roomName
      }).select().single();
      if (createError) throw createError;
      setPropertyRooms(prev => [...prev, {
        id: newRoom.id,
        name: newRoom.name
      }]);
      return newRoom;
    } catch (error) {
      console.error('Error creating/fetching room:', error);
      return null;
    }
  }, []);

  const fetchPropertyRooms = useCallback(async (propertyId: string) => {
    try {
      console.log(`Fetching property rooms for property ID: ${propertyId}`);
      
      const {
        data: rooms,
        error
      } = await supabase.from('property_rooms').select('id, name').eq('property_id', propertyId);
      
      if (error) throw error;
      
      if (rooms && rooms.length > 0) {
        console.log(`Found ${rooms.length} rooms for property ID: ${propertyId}`);
        setPropertyRooms(rooms);
        
        // Fetch preferences for each room
        for (const room of rooms) {
          await fetchRoomDesignPreferences(room.id);
        }
      } else {
        console.log(`No rooms found for property ID: ${propertyId}`);
      }
    } catch (error) {
      console.error('Error fetching property rooms:', error);
    }
  }, [fetchRoomDesignPreferences]);

  const refreshRoomPreferences = useCallback(async (roomId?: string) => {
    if (!roomId) return;
    
    setIsRefreshing(true);
    try {
      await fetchRoomDesignPreferences(roomId);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchRoomDesignPreferences]);

  const setupRooms = useCallback(async (propertyId: string, renovationAreas: any[]) => {
    if (!propertyId || !renovationAreas) return;
    if (renovationAreas.length === 0) return;
    
    console.log(`Setting up rooms for property ID: ${propertyId} with ${renovationAreas.length} renovation areas`);
    
    for (const area of renovationAreas) {
      await createRoomIfNeeded(propertyId, area.area);
    }
    
    // Refresh rooms after setup
    await fetchPropertyRooms(propertyId);
  }, [createRoomIfNeeded, fetchPropertyRooms]);

  const getRoomIdByName = useCallback((roomName: string) => {
    if (!roomName) return undefined;
    
    // First try an exact match
    let room = propertyRooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());
    
    // If no exact match, try matching with normalized names
    if (!room) {
      const normalizedName = normalizeAreaName(roomName);
      room = propertyRooms.find(r => normalizeAreaName(r.name) === normalizedName);
    }
    
    console.log(`Looking up room ID for "${roomName}" - Found: ${room?.id || 'none'}`);
    return room?.id;
  }, [propertyRooms]);

  return {
    propertyRooms,
    roomPreferences,
    defaultTab,
    setDefaultTab,
    fetchPropertyRooms,
    setupRooms,
    getRoomIdByName,
    createRoomIfNeeded,
    refreshRoomPreferences,
    isRefreshing
  };
};
