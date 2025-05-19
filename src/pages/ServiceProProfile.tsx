
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceProNavbar from "@/components/service-pro/ServiceProNavbar";
import BasicInfoForm from "@/components/service-pro/BasicInfoForm";
import ServicesForm from "@/components/service-pro/ServicesForm";
import LicensesForm from "@/components/service-pro/LicensesForm";

const ServiceProProfile = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("basic");
  
  useEffect(() => {
    // Check URL parameters for section
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section && ["basic", "services", "licenses", "insurance", "portfolio", "team"].includes(section)) {
      setActiveTab(section);
    }
  }, [location]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL params without reloading page
    const url = new URL(window.location.href);
    url.searchParams.set("section", value);
    window.history.pushState({}, "", url);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceProNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Pro Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your professional profile and credentials.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b border-gray-200">
              <div className="px-6 py-2 overflow-x-auto">
                <TabsList className="bg-transparent h-12">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="services" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Services
                  </TabsTrigger>
                  <TabsTrigger value="licenses" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Licenses
                  </TabsTrigger>
                  <TabsTrigger value="insurance" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Insurance
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Portfolio
                  </TabsTrigger>
                  <TabsTrigger value="team" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-800">
                    Team
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <div className="p-6">
              <TabsContent value="basic">
                <BasicInfoForm />
              </TabsContent>
              
              <TabsContent value="services">
                <ServicesForm />
              </TabsContent>
              
              <TabsContent value="licenses">
                <LicensesForm />
              </TabsContent>
              
              <TabsContent value="insurance">
                <div className="py-10 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Insurance Information</h3>
                  <p className="text-gray-500">
                    This section is coming soon. You'll be able to add your business insurance details here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="portfolio">
                <div className="py-10 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Projects</h3>
                  <p className="text-gray-500">
                    This section is coming soon. You'll be able to showcase your past projects here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="team">
                <div className="py-10 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Team Members</h3>
                  <p className="text-gray-500">
                    This section is coming soon. You'll be able to add your team members here.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ServiceProProfile;
