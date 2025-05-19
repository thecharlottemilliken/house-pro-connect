
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomSelectorProps {
  selectedRoom: string;
  setSelectedRoom: (room: string) => void;
  roomOptions: string[];
}

export function RoomSelector({ selectedRoom, setSelectedRoom, roomOptions }: RoomSelectorProps) {
  return (
    <Select 
      value={selectedRoom} 
      onValueChange={(value) => {
        console.log(`Room selected: ${value}`);
        setSelectedRoom(value);
      }}
    >
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Select room" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="all">All Rooms</SelectItem>
        {roomOptions.map((room) => (
          <SelectItem 
            key={room} 
            value={room.toLowerCase()}
          >
            {room}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
