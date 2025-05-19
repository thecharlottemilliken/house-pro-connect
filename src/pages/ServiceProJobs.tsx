import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ServiceProRoute from "@/components/auth/ServiceProRoute";

const ServiceProJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <ServiceProRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-2">
              Find opportunities and manage your job proposals.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Filter</Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">Search</Button>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="available" className="w-full">
              <div className="px-6 pt-4 border-b border-gray-200">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="available" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Available Jobs
                  </TabsTrigger>
                  <TabsTrigger value="my-bids" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    My Bids
                  </TabsTrigger>
                  <TabsTrigger value="awarded" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Awarded Jobs
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Completed
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="available">
                  <div className="py-10 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Jobs Found</h3>
                    <p className="text-gray-500">
                      No jobs matching your search criteria were found.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try adjusting your search terms or check back later for new opportunities.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="my-bids">
                  <div className="py-10 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Bids</h3>
                    <p className="text-gray-500">
                      You haven't submitted any bids yet.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="awarded">
                  <div className="py-10 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Awarded Jobs</h3>
                    <p className="text-gray-500">
                      You don't have any awarded jobs at the moment.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="completed">
                  <div className="py-10 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Jobs</h3>
                    <p className="text-gray-500">
                      You don't have any completed jobs yet.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </ServiceProRoute>
  );
};

export default ServiceProJobs;
