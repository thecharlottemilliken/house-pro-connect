
import React from "react";

const ProjectMilestones = () => {
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
    <div className="w-full md:w-80 bg-[#f0f4f6]">
      <div className="bg-[#0e475d] text-white p-4 rounded-t-md">
        <h2 className="text-sm font-medium mb-2">Total Project Cost</h2>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${totalProjectCost.toFixed(2)}</span>
          <span className="text-sm">${totalPaid.toFixed(2)} Paid</span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {milestones.map((milestone) => (
          <div key={milestone.name} className="bg-[#dce7ec] p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium">{milestone.name}</h3>
              <span className="font-medium">
                {milestone.status === "paid" ? 
                  `Paid: ${milestone.date}` : 
                  `Due: ${milestone.date}`}
              </span>
            </div>
            <span className="text-gray-700 font-medium">${milestone.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectMilestones;
