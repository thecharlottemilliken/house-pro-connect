
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MessagesCardProps {
  projectId?: string;
}

const MessagesCard = ({ projectId }: MessagesCardProps) => {
  const navigate = useNavigate();
  
  const handleViewAll = () => {
    if (projectId) {
      navigate(`/project-messages/${projectId}`);
    }
  };

  const handleViewBidsProposals = () => {
    if (projectId) {
      navigate(`/project-bids-proposals/${projectId}`);
    }
  };
  
  return (
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-6">
        <h2 className="text-2xl font-semibold">Recent Messages</h2>
        <Button variant="link" className="text-[#0f3a4d] p-0 font-medium" onClick={handleViewAll}>See All</Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-gray-600 mb-4">No recent conversations</p>
        <Button 
          variant="outline" 
          className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full"
          onClick={handleViewBidsProposals}
        >
          View Bids & Proposals
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessagesCard;
