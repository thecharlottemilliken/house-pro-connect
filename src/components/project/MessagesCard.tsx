
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MessagesCard = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle className="text-xl">Recent Messages</CardTitle>
        <Button variant="link" className="text-[#1e5c78] p-0 font-normal">See All</Button>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">No recent conversations</p>
      </CardContent>
    </Card>
  );
};

export default MessagesCard;
