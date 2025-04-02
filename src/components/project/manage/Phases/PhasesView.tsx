
import { useState } from "react";
import { ChevronUp, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import WorkDateItem from "./WorkDateItem";
import TeamMemberItem from "./TeamMemberItem";
import MaterialItem from "./MaterialItem";

const PhasesView = () => {
  const [openMilestones, setOpenMilestones] = useState<number[]>([1]);
  
  const toggleMilestone = (id: number) => {
    if (openMilestones.includes(id)) {
      setOpenMilestones(openMilestones.filter(m => m !== id));
    } else {
      setOpenMilestones([...openMilestones, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase Header and Tab Navigation */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Project Phases</h2>

        {/* Tabs - Phase Selection */}
        <div className="bg-gray-100 p-1 rounded-md mb-6">
          <div className="flex">
            <button className="bg-white text-gray-900 font-medium px-4 py-2 rounded shadow flex items-center">
              <span className="inline-block w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
              Tile Job
            </button>
            <button className="text-gray-700 px-4 py-2 rounded flex items-center hover:bg-gray-200">
              <span className="inline-block w-3 h-3 bg-cyan-400 rounded-full mr-2"></span>
              Drywall Install
            </button>
          </div>
        </div>
        
        {/* Phase Overview Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">T</span>
              </span>
              <h3 className="text-lg font-bold text-gray-900">Tile Job</h3>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>Est. Completion: 3/20/2025</span>
              <span className="mx-4">|</span>
              <span>25% complete</span>
            </div>
          </div>
        </div>

        {/* Description of Work */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Description of Work</h4>
          <p className="text-gray-700">
            The tile job involves carefully removing the old flooring to prepare for a fresh installation. We will ensure that the 
            surface is level and clean before laying down the new tiles, which will enhance the aesthetic of the space. Finally, 
            grout will be applied meticulously to secure the tiles and provide a polished finish.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Work Dates Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Work Dates</h4>
            <div className="space-y-2">
              <WorkDateItem 
                title="Start Tile Work" 
                date="12/15/2024" 
                timeRange="8:00am - 5:00pm" 
              />
              <WorkDateItem 
                title="Start Tile Work" 
                date="12/15/2024" 
                timeRange="8:00am - 5:00pm" 
              />
              <WorkDateItem 
                title="Start Tile Work" 
                date="12/15/2024" 
                timeRange="8:00am - 5:00pm" 
              />
              <WorkDateItem 
                title="Start Tile Work" 
                date="12/15/2024" 
                timeRange="8:00am - 5:00pm" 
              />
            </div>
          </div>

          {/* Project Cost Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Project Cost Overview</h4>
            
            {/* Total Project Cost Card */}
            <Card className="mb-3 border border-gray-200">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Project Cost</p>
                  <p className="text-2xl font-bold">$1,000.00</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">$250 Paid</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Milestone 1 Card */}
            <Card className="mb-3 bg-orange-50 border border-orange-100">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">Milestone 1</p>
                  <p className="text-xl font-semibold">$250.00</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Paid: 2/20/25</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Milestone 2 Card */}
            <Card className="bg-orange-50 border border-orange-100">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">Milestone 2</p>
                  <p className="text-xl font-semibold">$500.00</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Due: 3/29/25</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Milestones Accordion */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Milestones</h4>
          
          <Collapsible 
            open={openMilestones.includes(1)} 
            onOpenChange={() => toggleMilestone(1)}
            className="border border-gray-200 rounded-md overflow-hidden mb-3"
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer bg-white">
                <div className="flex items-center">
                  <h5 className="text-base font-medium">Milestone 1</h5>
                  <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">Completed</span>
                </div>
                <div className="flex items-center space-x-8">
                  <span className="text-sm text-gray-500">Est. Completion: 3/20/2025</span>
                  <span className="text-sm text-gray-500">100% complete</span>
                  <span className="text-sm text-gray-500">Amount Paid: $1,500</span>
                  <ChevronUp className={`h-5 w-5 transition-transform ${openMilestones.includes(1) ? '' : 'transform rotate-180'}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-gray-200">
              <div className="p-4 bg-gray-50">
                {/* Milestone Content */}
                <div className="space-y-6">
                  {/* Work Dates with Edit */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h6 className="text-sm font-semibold text-gray-700">Key Work Dates</h6>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <WorkDateItem 
                        title="Start Tile Work" 
                        date="12/15/2024" 
                        timeRange="8:00am - 5:00pm" 
                      />
                      <WorkDateItem 
                        title="Start Tile Work" 
                        date="12/15/2024" 
                        timeRange="8:00am - 5:00pm" 
                      />
                      <WorkDateItem 
                        title="Start Tile Work" 
                        date="12/15/2024" 
                        timeRange="8:00am - 5:00pm" 
                      />
                    </div>
                  </div>

                  {/* Description of Work */}
                  <div>
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Description of work</h6>
                    <p className="text-gray-700">
                      In the first quarter of the tile work project, we will focus on site 
                      preparation, including the removal of existing flooring and 
                      ensuring a level substrate. Additionally, we will begin the layout 
                      planning to optimize tile placement and design aesthetics.
                    </p>
                  </div>

                  {/* Team Members */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h6 className="text-sm font-semibold text-gray-700">Team Members Assigned</h6>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <TeamMemberItem name="Don Smith" />
                      <TeamMemberItem name="Don Smith" />
                    </div>
                  </div>

                  {/* Materials List */}
                  <div>
                    <h6 className="text-sm font-semibold text-gray-700 mb-3">Materials List</h6>
                    <div>
                      <MaterialItem 
                        title="RELIABILT Fairplay 18-in W x 84-in H x 24-in D White Pantry Ready To Assemble Plywood Cabinet"
                        id="00039209293482930"
                        status="Ordered"
                        delivery="Est. Delivery 12/23 9:00am - 5:00pm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Request Changes Button */}
        <div className="text-right mt-8">
          <Button className="bg-[#0f566c] hover:bg-[#0d4a5d]">
            REQUEST CHANGES
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhasesView;
