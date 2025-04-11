
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const LoadingState = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
