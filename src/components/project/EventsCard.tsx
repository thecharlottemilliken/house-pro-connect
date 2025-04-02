
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EventsCard = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Upcoming Events</CardTitle>
          <Button variant="link" className="text-[#174c65] p-0">See All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">No upcoming events</p>
      </CardContent>
    </Card>
  );
};

export default EventsCard;
