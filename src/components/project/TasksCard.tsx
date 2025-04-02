
import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TasksCard = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle className="text-xl">Your Tasks</CardTitle>
        <Button variant="link" className="text-[#1e5c78] p-0 font-normal">See All</Button>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Approve milestone 1 completion</h3>
          <p className="text-sm text-gray-600 mb-4">
            Joe has marked milestone 1 for the tile job as complete. Please confirm for the
            work to continue.
          </p>
          <div className="flex justify-end">
            <Button 
              className="bg-[#1e5c78] hover:bg-[#1e5c78]/90 text-xs"
              size="sm"
            >
              VIEW MILESTONE <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksCard;
