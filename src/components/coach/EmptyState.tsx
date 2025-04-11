
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  searchQuery: string;
}

const EmptyState = ({ searchQuery }: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center text-gray-500">
          {searchQuery ? "No projects match your search" : "No projects found"}
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
