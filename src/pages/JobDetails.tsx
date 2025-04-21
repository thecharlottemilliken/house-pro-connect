import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Eye, FileText, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
interface JobDetails {
  id: string;
  status: string;
  work_areas: any[];
  labor_items: any[];
  material_items: any[];
  bid_configuration: {
    bidDuration: string;
    projectDescription?: string;
    type?: string;
  };
  approved_at: string;
  project: {
    id: string;
    title: string;
    description?: string;
    property_id?: string;
  };
  property: {
    id: string;
    image: string;
    address?: string;
    city?: string;
    state?: string;
  };
}
interface BidItem {
  id: string;
  category: string;
  type: string;
  description: string;
  quantity: number;
  unitRate: number;
  area: string;
}
const JobDetails = () => {
  const {
    jobId
  } = useParams<{
    jobId: string;
  }>();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workDescription, setWorkDescription] = useState("");
  const [bidItems, setBidItems] = useState<BidItem[]>([]);
  const [newItem, setNewItem] = useState<{
    category: string;
    type: string;
    description: string;
    quantity: number;
    unitRate: number;
    area: string;
  }>({
    category: "labor",
    type: "Labor",
    description: "",
    quantity: 1,
    unitRate: 0,
    area: ""
  });
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      setIsLoading(true);
      try {
        const {
          data: sow,
          error: sowError
        } = await supabase.from('statement_of_work').select(`
            id,
            status,
            work_areas,
            labor_items,
            material_items,
            bid_configuration,
            updated_at,
            project_id
          `).eq('id', jobId).single();
        if (sowError) throw sowError;
        if (!sow) {
          toast({
            title: "Job not found",
            description: "The requested job details could not be found.",
            variant: "destructive"
          });
          return;
        }
        const {
          data: project,
          error: projectError
        } = await supabase.from('projects').select('id, title, property_id').eq('id', sow.project_id).single();
        if (projectError) throw projectError;
        const {
          data: property,
          error: propertyError
        } = await supabase.from('properties').select('id, home_photos, image_url, address_line1, city, state').eq('id', project.property_id).single();
        if (propertyError) throw propertyError;
        const jobDetailsObj: JobDetails = {
          id: sow.id,
          status: sow.status,
          work_areas: typeof sow.work_areas === 'string' ? JSON.parse(sow.work_areas) : sow.work_areas || [],
          labor_items: typeof sow.labor_items === 'string' ? JSON.parse(sow.labor_items) : sow.labor_items || [],
          material_items: typeof sow.material_items === 'string' ? JSON.parse(sow.material_items) : sow.material_items || [],
          bid_configuration: typeof sow.bid_configuration === 'string' ? JSON.parse(sow.bid_configuration) : sow.bid_configuration || {
            bidDuration: "7"
          },
          approved_at: sow.updated_at,
          project: {
            id: project.id,
            title: project.title,
            property_id: project.property_id
          },
          property: {
            id: property.id,
            image: property.home_photos?.[0] ?? property.image_url ?? "/placeholder.svg",
            address: property.address_line1,
            city: property.city,
            state: property.state
          }
        };
        setJobDetails(jobDetailsObj);
        if (jobDetailsObj.work_areas?.length > 0 && jobDetailsObj.work_areas[0].name) {
          setNewItem(prev => ({
            ...prev,
            area: jobDetailsObj.work_areas[0].name
          }));
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast({
          title: "Error loading job details",
          description: "There was a problem loading the job details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);
  const calculateTotal = () => {
    return bidItems.reduce((sum, item) => sum + item.quantity * item.unitRate, 0);
  };
  const addItemToBid = () => {
    if (!newItem.description || newItem.unitRate <= 0) {
      toast({
        title: "Invalid item",
        description: "Please provide a description and a valid unit rate.",
        variant: "destructive"
      });
      return;
    }
    const newBidItem: BidItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem
    };
    setBidItems([...bidItems, newBidItem]);
    setNewItem({
      ...newItem,
      description: "",
      quantity: 1,
      unitRate: 0
    });
  };
  const removeItem = (id: string) => {
    setBidItems(bidItems.filter(item => item.id !== id));
  };
  const handleSubmitBid = () => {
    if (!workDescription) {
      toast({
        title: "Missing information",
        description: "Please provide a description of the work to be completed.",
        variant: "destructive"
      });
      return;
    }
    if (bidItems.length === 0) {
      toast({
        title: "Empty bid",
        description: "Please add at least one item to your bid.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Bid submitted",
      description: "Your bid has been submitted successfully!",
      variant: "default"
    });
  };
  const getDeadlineDate = () => {
    if (!jobDetails?.approved_at || !jobDetails?.bid_configuration?.bidDuration) {
      return "No deadline set";
    }
    const approvedDate = new Date(jobDetails.approved_at);
    const durationDays = parseInt(jobDetails.bid_configuration.bidDuration, 10) || 7;
    const deadlineDate = new Date(approvedDate);
    deadlineDate.setDate(deadlineDate.getDate() + durationDays);
    return format(deadlineDate, "MMMM d, yyyy");
  };
  if (isLoading) {
    return <>
        <DashboardNavbar />
        <div className="min-h-screen bg-[#F5F8FA] flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-3"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </>;
  }
  if (!jobDetails) {
    return <>
        <DashboardNavbar />
        <div className="min-h-screen bg-[#F5F8FA] flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-700 mb-2">Job Not Found</p>
            <p className="text-gray-500 mb-6">The requested job details could not be found.</p>
            <Button asChild>
              <Link to="/jobs">Return to Jobs</Link>
            </Button>
          </div>
        </div>
      </>;
  }
  return <>
      <DashboardNavbar />
      <div className="min-h-screen bg-[#F5F8FA]">
        

        <div className="max-w-7xl mx-auto px-4 py-0">
          <div className="mb-8">
            <Button variant="ghost" className="flex items-center text-[#1A1F2C]" asChild>
              
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-7/12">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block rounded px-3 py-1 bg-[#FEF7CD] text-xs text-[#c8763b] font-semibold">
                      {jobDetails.status === "approved" ? "Partial Remodel" : jobDetails.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {jobDetails.bid_configuration?.bidDuration ? `${jobDetails.bid_configuration.bidDuration} days remaining` : "No deadline set"}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold text-[#1A1F2C] mb-1">
                    {jobDetails.project.title}
                  </h1>
                  <p className="text-gray-600 mb-2">
                    Project ID: #{jobDetails.project.id?.substring(0, 8)}
                  </p>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye size={16} />
                    VIEW DESIGNS
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText size={16} />
                    VIEW SPECS
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="p-4 bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={jobDetails.property.image} alt="Property" className="h-16 w-16 rounded object-cover" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-medium">
                        {jobDetails.property.city}, {jobDetails.property.state}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full text-[#1EAEDB] mt-2 text-xs" size="sm">
                    VIEW ON MAP
                  </Button>
                </Card>

                <Card className="p-4 bg-white shadow-sm">
                  <div className="mb-1">
                    <p className="text-sm text-gray-500">Desired Completion Date</p>
                    <p className="font-medium">{getDeadlineDate()}</p>
                  </div>
                </Card>

                <Card className="p-4 bg-white shadow-sm">
                  <div className="mb-1">
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-medium">Single Family</p>
                  </div>
                </Card>
              </div>

              <Card className="bg-white shadow-sm mb-8 p-6">
                <h2 className="text-xl font-semibold mb-4">SOW Description</h2>
                <p className="text-gray-700">
                  {jobDetails.bid_configuration?.projectDescription || "This Statement of Work outlines the goals and deliverables for the renovation project. It specifies the project scope, timeline, and roles to facilitate effective teamwork."}
                </p>
              </Card>

              <Card className="bg-white shadow-sm mb-8 overflow-hidden">
                <h2 className="text-xl font-semibold p-6 pb-4">Work Areas</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1A3A4A] text-white">
                        <TableHead className="text-white">Primary Area</TableHead>
                        <TableHead className="text-white">Primary SQFT</TableHead>
                        <TableHead className="text-white">Primary WxDxL</TableHead>
                        <TableHead className="text-white">Affected Areas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobDetails.work_areas && jobDetails.work_areas.length > 0 ? jobDetails.work_areas.map((area, index) => <TableRow key={index}>
                            <TableCell>{area.name || "N/A"}</TableCell>
                            <TableCell>{area.size || "2050"} SQFT</TableCell>
                            <TableCell>{area.dimensions || "50 X 13 X 20"}</TableCell>
                            <TableCell>{area.affected_areas?.join(", ") || "N/A"}</TableCell>
                          </TableRow>) : <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No work areas defined
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <div className="space-y-6">
                <Accordion type="single" collapsible className="bg-white rounded-md shadow-sm">
                  <AccordionItem value="labor">
                    <AccordionTrigger className="px-6 py-4 text-xl font-semibold">
                      Select Labor Items to Bid On
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      {jobDetails.labor_items && jobDetails.labor_items.length > 0 ? <div className="space-y-4">
                          {jobDetails.labor_items.map((item, index) => <Card key={index} className="p-4 border-l-4 border-blue-500">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-medium">{item.name || `Item ${index + 1}`}</h3>
                                  <p className="text-sm text-gray-500">{item.description || "No description provided"}</p>
                                  <div className="mt-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      Area: {item.area || "All"}
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => {
                            setNewItem({
                              ...newItem,
                              category: "labor",
                              type: "Labor",
                              description: item.name || `Labor Item ${index + 1}`,
                              area: item.area || "All"
                            });
                            window.scrollTo({
                              top: document.body.scrollHeight,
                              behavior: 'smooth'
                            });
                          }}>
                                  Add to Bid
                                </Button>
                              </div>
                            </Card>)}
                        </div> : <p className="text-gray-500 py-2">No labor items defined</p>}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="material">
                    <AccordionTrigger className="px-6 py-4 text-xl font-semibold">
                      Select Material Items to Bid On
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      {jobDetails.material_items && jobDetails.material_items.length > 0 ? <div className="space-y-4">
                          {jobDetails.material_items.map((item, index) => <Card key={index} className="p-4 border-l-4 border-green-500">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-medium">{item.name || `Material ${index + 1}`}</h3>
                                  <p className="text-sm text-gray-500">{item.description || "No description provided"}</p>
                                  <div className="mt-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      Type: {item.type || "Standard"}
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => {
                            setNewItem({
                              ...newItem,
                              category: "material",
                              type: "Material",
                              description: item.name || `Material Item ${index + 1}`,
                              area: item.area || "All"
                            });
                            window.scrollTo({
                              top: document.body.scrollHeight,
                              behavior: 'smooth'
                            });
                          }}>
                                  Add to Bid
                                </Button>
                              </div>
                            </Card>)}
                        </div> : <p className="text-gray-500 py-2">No material items defined</p>}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="w-full lg:w-5/12">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-3">Build Your Bid</h2>
                <p className="text-gray-600 mb-6">
                  To assemble your bid, start by clearly outlining your project scope and
                  objectives. Then, provide a detailed breakdown of costs and timelines to
                  ensure transparency and clarity.
                </p>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Description of Work to be Completed</h3>
                  <Textarea placeholder="Input Text" className="h-32" value={workDescription} onChange={e => setWorkDescription(e.target.value)} />
                </div>

                {jobDetails.work_areas && jobDetails.work_areas.length > 0 && <div className="mb-6">
                    {jobDetails.work_areas.map((area, index) => <div key={index} className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">{area.name || `Area ${index + 1}`}</h3>
                        
                        {bidItems.filter(item => item.area === (area.name || `Area ${index + 1}`)).map(item => <div key={item.id} className="bg-gray-50 rounded-lg p-4 mb-4 relative">
                            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => removeItem(item.id)}>
                              <Trash size={16} />
                            </button>
                            <h4 className="font-medium flex items-center justify-between">
                              {item.category === 'labor' ? 'Building' : 'Material'} - Item
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Item Type</p>
                                <div className="border rounded-md p-2 bg-white">
                                  {item.type}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Description</p>
                                <div className="border rounded-md p-2 bg-white overflow-hidden text-ellipsis">
                                  {item.description}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Unit Rate</p>
                                <div className="border rounded-md p-2 bg-white">
                                  ${item.unitRate.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">QTY</p>
                                <div className="border rounded-md p-2 bg-white">
                                  {item.quantity}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Cost</p>
                                <div className="border rounded-md p-2 bg-white font-medium">
                                  ${(item.quantity * item.unitRate).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>)}

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium flex items-center justify-between mb-3">
                            {newItem.category === 'labor' ? 'Building' : 'Material'} - New Item
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Item Type</p>
                              <Select value={newItem.type} onValueChange={value => setNewItem({
                          ...newItem,
                          type: value
                        })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Labor">Labor</SelectItem>
                                  <SelectItem value="Material">Material</SelectItem>
                                  <SelectItem value="Equipment">Equipment</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Description</p>
                              <Input placeholder="Input text" value={newItem.description} onChange={e => setNewItem({
                          ...newItem,
                          description: e.target.value
                        })} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Unit Rate</p>
                              <Select value={newItem.unitRate.toString()} onValueChange={value => setNewItem({
                          ...newItem,
                          unitRate: parseFloat(value) || 0
                        })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="50">$50</SelectItem>
                                  <SelectItem value="75">$75</SelectItem>
                                  <SelectItem value="100">$100</SelectItem>
                                  <SelectItem value="125">$125</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">QTY</p>
                              <Input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({
                          ...newItem,
                          quantity: parseInt(e.target.value) || 1
                        })} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Cost Per Unit</p>
                              <Input value={`$ ${newItem.unitRate.toFixed(2)}`} readOnly />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Area</p>
                              <Select value={newItem.area} onValueChange={value => setNewItem({
                          ...newItem,
                          area: value
                        })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select area" />
                                </SelectTrigger>
                                <SelectContent>
                                  {jobDetails.work_areas.map((area, i) => <SelectItem key={i} value={area.name || `Area ${i + 1}`}>
                                      {area.name || `Area ${i + 1}`}
                                    </SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={addItemToBid}>
                          <Plus size={16} />
                          ADD ITEM
                        </Button>
                      </div>)}
                  </div>}

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Total Job Cost:</h3>
                    <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                  </div>
                </div>

                <Button className="w-full bg-[#1A3A4A] hover:bg-[#0F2A3A] text-white py-3" onClick={handleSubmitBid}>
                  SUBMIT BID
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>;
};
export default JobDetails;