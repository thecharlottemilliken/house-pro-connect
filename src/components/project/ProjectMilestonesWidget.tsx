
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ProjectMilestonesWidgetProps {
  projectId: string;
  className?: string;
}

const ProjectMilestonesWidget = ({ projectId, className }: ProjectMilestonesWidgetProps) => {
  const [completionPercentage, setCompletionPercentage] = useState<number>(30);
  
  // Mock milestone data - this would typically come from API
  const milestones = [
    {
      name: "Milestone 1",
      amount: 250.00,
      status: "paid",
      date: "2/20/25"
    },
    {
      name: "Milestone 2",
      amount: 500.00,
      status: "due",
      date: "3/29/25"
    },
    {
      name: "Milestone 3",
      amount: 250.00,
      status: "due",
      date: "4/12/25"
    }
  ];

  const totalProjectCost = 1000.00;
  const totalPaid = 250.00;

  return (
    <Card className={`overflow-hidden shadow-md border-0 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-4 bg-white border-b">
        <h3 className="text-lg font-semibold">Project Milestones</h3>
        <div className="text-orange-500 font-medium">
          {completionPercentage}% Complete
        </div>
      </CardHeader>
      <CardContent className="p-4 bg-gray-50">
        <div className="bg-[#0e475d] text-white p-4 rounded-md mb-4">
          <h2 className="text-sm font-medium mb-2">Total Project Cost</h2>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">${totalProjectCost.toFixed(2)}</span>
            <span className="text-sm">${totalPaid.toFixed(2)} Paid</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div key={milestone.name} className="bg-white p-3 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">{milestone.name}</h3>
                <span className="text-sm text-gray-600">
                  {milestone.status === "paid" ? 
                    `Paid: ${milestone.date}` : 
                    `Due: ${milestone.date}`}
                </span>
              </div>
              <span className="text-gray-700 font-medium">${milestone.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectMilestonesWidget;
