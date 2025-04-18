
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventsCardProps {
  projectId: string;
}

const EventsCard = ({ projectId }: EventsCardProps) => {
  return (
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-6">
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        <Button variant="link" className="text-[#0f3a4d] p-0 font-medium">See All</Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-gray-600">No upcoming events</p>
      </CardContent>
    </Card>
  );
};

export default EventsCard;
