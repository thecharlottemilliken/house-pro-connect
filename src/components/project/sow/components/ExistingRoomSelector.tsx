
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Room {
  id: string;
  name: string;
}

interface ExistingRoomSelectorProps {
  rooms: Room[];
  onRoomSelect: (roomId: string) => void;
  hasSelectedRoom: boolean;
}

export function ExistingRoomSelector({ rooms, onRoomSelect, hasSelectedRoom }: ExistingRoomSelectorProps) {
  return (
    <div className="space-y-4 my-4">
      <div className="space-y-2">
        <Label htmlFor="room-select">Select an existing room</Label>
        <Select onValueChange={onRoomSelect}>
          <SelectTrigger id="room-select">
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map(room => (
              <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasSelectedRoom && (
          <p className="text-sm text-muted-foreground mt-1">
            Room data and measurements will be imported
          </p>
        )}
      </div>
    </div>
  );
}
