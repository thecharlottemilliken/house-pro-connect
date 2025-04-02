
import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TasksCard = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Your Tasks</CardTitle>
          <Button variant="link" className="text-[#174c65] p-0">See All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Add your design inspiration</h3>
          <p className="text-sm text-gray-600 mb-4">
            While you're waiting on your project coach to reach out, you can get a head
            start by adding your renovation inspiration to the 'Design' section.
          </p>
          <Button className="w-full md:w-auto bg-[#174c65] hover:bg-[#174c65]/90 justify-between">
            ADD DESIGN INSPO <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksCard;
