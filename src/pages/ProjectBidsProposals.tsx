
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Search, Filter, Star } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

// Sample data for proposals
const proposals = [
  {
    id: 1,
    title: "Tile Transformations",
    description: "Stunning mosaic tile design to elevate your space.",
    rating: 4.7,
    price: 100.00,
    recommended: true,
  }
];

// Sample data for phases
const phases = [
  { id: 1, name: "Tile" },
  { id: 2, name: "Electric" },
  { id: 3, name: "Paint" },
  { id: 4, name: "Plumbing" },
];

const ProjectBidsProposals = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState("proposals");
  const [activePhase, setActivePhase] = useState<number>(1);
  
  const { projectData, propertyDetails, isLoading } = useProjectData(
    params.projectId,
    location.state
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Unknown Project";

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="document"
          />
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-56 min-w-56 border-r border-gray-200 bg-gray-50">
              <div className="p-4 font-medium text-gray-700">Phases</div>
              <div className="flex flex-col">
                {phases.map(phase => (
                  <button
                    key={phase.id}
                    className={`text-left p-4 hover:bg-gray-100 ${
                      activePhase === phase.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => setActivePhase(phase.id)}
                  >
                    {phase.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <h1 className="text-3xl font-bold mb-6">Bids & Proposals</h1>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="border-b border-gray-200 w-full flex">
                  <TabsTrigger 
                    value="bids" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-800 px-8"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-gray-600">$</span> Bids (4)
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="proposals" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-800 px-8"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-gray-600">📄</span> Proposals (1)
                    </span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="bids" className="pt-6">
                  <div className="text-center py-12 text-gray-500">
                    No bids available for this phase
                  </div>
                </TabsContent>
                
                <TabsContent value="proposals" className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      Tile Proposals <span className="text-gray-500">1</span>
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="w-full sm:w-auto">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Search proposals..."
                            className="pl-10 w-full sm:w-80"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="icon" className="h-10 w-10">
                          <Filter className="h-4 w-4" />
                        </Button>
                        <Select defaultValue="recommended">
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recommended">Recommended</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {proposals.map(proposal => (
                    <Card key={proposal.id} className="p-4 mb-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="mb-2 sm:mb-0">
                          {proposal.recommended && (
                            <div className="bg-orange-500 text-white rounded-md px-3 py-1 text-sm font-medium inline-block mb-2">
                              Recommended
                            </div>
                          )}
                          <div className="flex items-center mb-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                            <span className="font-semibold mr-2">{proposal.rating}</span>
                            <span className="font-medium text-gray-800">{proposal.title}</span>
                          </div>
                          <p className="text-gray-600">{proposal.description}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                          <span className="text-xl font-bold">${proposal.price.toFixed(2)}</span>
                          <Button className="bg-[#0f566c] hover:bg-[#0d4a5d] whitespace-nowrap">
                            VIEW PROPOSAL
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectBidsProposals;
