
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Home, Grid2X2, LayoutList, Plus, Heart, MapPin, Bath, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PropertiesFilterBar from "@/components/properties/PropertiesFilterBar";
import MapboxMap from "@/components/properties/PropertyMapView";
import { formatCurrency } from "@/utils/formatters";

interface Property {
  id: string;
  property_name: string;
  image_url: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  bathrooms?: string | null;
  bedrooms?: string | null;
  sqft?: string | null;
  price?: number;
  status?: string;
  lat?: number;
  lng?: number;
}

const Properties = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"active" | "sold">("active");
  const [mapboxToken, setMapboxToken] = useState<string>("");

  useEffect(() => {
    async function loadMapboxToken() {
      try {
        const { data, error } = await supabase.functions.invoke("get-mapbox-token");
        
        if (error) {
          console.error("Failed to load the Mapbox token:", error);
          toast.error("Could not load the map configuration");
        } else if (data?.token) {
          setMapboxToken(data.token);
        } else {
          console.warn("No token received from get-mapbox-token");
          toast.error("Map configuration error");
        }
      } catch (err) {
        console.error("Error invoking get-mapbox-token function:", err);
        toast.error("Could not connect to the map service");
      }
    }
    
    loadMapboxToken();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Enhance data with sample prices and other properties for demo
      const enhancedProperties = data.map(property => ({
        ...property,
        price: Math.floor(Math.random() * 800000) + 200000, // Random price between 200k and 1M
        status: Math.random() > 0.2 ? 'active' : 'sold',
        lat: 40.7608 + (Math.random() * 0.02 - 0.01), // Default to SLC coordinates with slight randomness
        lng: -111.8910 + (Math.random() * 0.02 - 0.01)
      }));
      
      setProperties(enhancedProperties);
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load your properties");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProperty = () => {
    navigate('/add-property');
  };

  const handlePinClick = (propertyId: string) => {
    setActivePropertyId(propertyId);
    const propertyCard = document.getElementById(`property-card-${propertyId}`);
    if (propertyCard) {
      propertyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardHover = (propertyId: string) => {
    setActivePropertyId(propertyId);
  };

  const handleCardClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  // Apply filters to the properties
  const filteredProperties = properties.filter(property => {
    // Filter by search query
    if (searchQuery && !property.property_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !property.address_line1.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by status tab
    if (activeTab === "active" && property.status !== "active") return false;
    if (activeTab === "sold" && property.status !== "sold") return false;
    
    return true;
  });

  // For map display, we transform the properties to include required lat/lng
  const mapProperties = filteredProperties.map(property => ({
    id: property.id,
    lat: property.lat || 40.7608,
    lng: property.lng || -111.8910,
    price: property.price
  }));

  return (
    <div className="relative w-full min-h-screen bg-[#F5F8FA] flex flex-col">
      <DashboardNavbar />

      {/* Page Header */}
      <div className="bg-[#15425F] text-white py-8 px-4 md:px-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Properties</h1>
          <div className="flex gap-2 items-center">
            <Button 
              variant="default" 
              className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white flex items-center gap-2"
              onClick={handleAddProperty}
            >
              <Plus size={16} />
              LIST A PROPERTY
            </Button>
            <div className="border border-white/30 rounded-md flex p-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className={`text-white ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid2X2 size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`text-white ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={() => setViewMode('list')}
              >
                <LayoutList size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "active" | "sold")}
            className="w-full"
          >
            <div className="px-4 md:px-10">
              <TabsList className="h-14 w-auto gap-4">
                <TabsTrigger 
                  value="active"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#1EAEDB] rounded-none h-full px-2 text-base"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Active
                </TabsTrigger>
                <TabsTrigger 
                  value="sold"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#1EAEDB] rounded-none h-full px-2 text-base"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Sold
                </TabsTrigger>
              </TabsList>
            </div>

            <PropertiesFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <div className="relative flex-1 min-h-0 flex max-w-screen">
              {/* Map */}
              <div className="relative flex-1 h-[calc(100vh-180px)] min-h-0">
                <div className="absolute inset-0 z-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-3"></div>
                        <p className="text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  ) : (
                    <MapboxMap
                      properties={mapProperties}
                      activePropertyId={activePropertyId}
                      onPinClick={handlePinClick}
                      mapboxToken={mapboxToken}
                    />
                  )}
                </div>
              </div>
              
              {/* Side rail */}
              <aside
                className="
                  relative h-auto w-full md:w-[400px] xl:w-[430px] z-20
                  bg-gradient-to-l from-white/98 via-white/80 to-white/10
                  shadow-2xl border-l border-gray-200
                  flex flex-col transition-all duration-300
                  pointer-events-auto
                "
                style={{ backdropFilter: "blur(8px)" }}
              >
                <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar mt-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredProperties.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="font-medium text-gray-700">No properties found</p>
                      <p className="text-sm text-gray-600 mt-2">Try adjusting your filters or add a new property</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {filteredProperties.map((property) => (
                        <li
                          key={property.id}
                          id={`property-card-${property.id}`}
                          onMouseEnter={() => handleCardHover(property.id)}
                          onMouseLeave={() => setActivePropertyId(null)}
                          className="relative"
                        >
                          <Card
                            className={`flex flex-row p-2 bg-white rounded-lg ${
                              activePropertyId === property.id
                                ? "ring-2 ring-[#9b87f5] shadow-lg"
                                : "shadow-sm border-none hover:ring-2 hover:ring-[#9b87f5]/50"
                            } overflow-hidden transition-all duration-200 cursor-pointer`}
                            onClick={() => handleCardClick(property.id)}
                          >
                            <div className="relative">
                              <img
                                src={property.image_url || "/placeholder.svg"}
                                alt={property.property_name}
                                className="h-[140px] w-[180px] object-cover object-center rounded-[8px] shadow"
                              />
                              
                              {/* Price Tag */}
                              <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-md shadow font-semibold text-[#15425F]">
                                {formatCurrency(property.price || 0)}
                              </div>
                            </div>
                            <div className="flex-1 pl-3 pr-2 flex flex-col justify-between">
                              <div className="flex items-center mb-1 gap-2">
                                <span className="inline-block rounded px-2 py-0.5 bg-[#FEF7CD] text-xs text-[#c8763b] font-semibold">
                                  {property.status === 'active' ? 'Active' : 'Sold'}
                                </span>
                              </div>
                              <div className="text-[17px] text-[#1A1F2C] font-semibold leading-tight mb-1">
                                {property.property_name}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <MapPin size={14} className="mr-1 text-gray-400" />
                                {property.address_line1}, {property.city}, {property.state}
                              </div>
                              <div className="flex gap-6 mt-2 text-sm text-gray-600 items-center">
                                <span className="flex items-center gap-1">
                                  <Bed className="w-4 h-4 mr-1 text-gray-500" />
                                  {property.bedrooms || '0'} bd
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bath className="w-4 h-4 mr-1 text-gray-500" />
                                  {property.bathrooms || '0'} ba
                                </span>
                                <span className="text-gray-500">
                                  {property.sqft || '0'} sqft
                                </span>
                              </div>
                            </div>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Properties;
