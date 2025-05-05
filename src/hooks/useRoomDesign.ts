
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { type PinterestBoard } from "@/types/pinterest";
import { toast } from "@/hooks/use-toast";

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
  const [defaultTab, setDefaultTab] = useState<string>("kitchen");

  const fetchRoomDesignPreferences = useCallback(async (roomId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('room_design_preferences').select('pinterest_boards, inspiration_images').eq('room_id', roomId).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', error);
        return;
      }
      if (data) {
        setRoomPreferences(prev => ({
          ...prev,
          [roomId]: {
            inspirationImages: data.inspiration_images || [],
            pinterestBoards: data.pinterest_boards as unknown as PinterestBoard[] || []
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
      const {
        data: rooms,
        error
      } = await supabase.from('property_rooms').select('id, name').eq('property_id', propertyId);
      if (error) throw error;
      if (rooms) {
        setPropertyRooms(rooms);
        for (const room of rooms) {
          fetchRoomDesignPreferences(room.id);
        }
      }
    } catch (error) {
      console.error('Error fetching property rooms:', error);
    }
  }, [fetchRoomDesignPreferences]);

  const setupRooms = useCallback(async (propertyId: string, renovationAreas: any[]) => {
    if (!propertyId || !renovationAreas) return;
    if (renovationAreas.length === 0) return;
    for (const area of renovationAreas) {
      await createRoomIfNeeded(propertyId, area.area);
    }
  }, [createRoomIfNeeded]);

  const getRoomIdByName = useCallback((roomName: string) => {
    const room = propertyRooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());
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
    createRoomIfNeeded
  };
};
