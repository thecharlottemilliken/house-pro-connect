
import React from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSOW } from "@/components/project/sow/SOWContext";
import { ProjectData, PropertyDetails } from "@/hooks/useProjectData";

interface ReviewSOWProps {
  projectData: ProjectData | null;
  propertyDetails: PropertyDetails;
}

const ReviewSOW: React.FC<ReviewSOWProps> = ({ projectData, propertyDetails }) => {
  const { sowData, saveSOW } = useSOW();

  const handleSave = () => {
    saveSOW();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const currentDate = formatDate(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Review Statement of Work</h2>
        <p className="mb-4 text-gray-600">
          Review all details of your Statement of Work before finalizing it.
        </p>
      </div>

      <div className="print:block">
        <Card className="mb-6 shadow-sm print:shadow-none">
          <CardHeader className="print:py-4">
            <CardTitle>Statement of Work</CardTitle>
            <div className="flex flex-col text-sm text-gray-600">
              <span>Project: {projectData?.title}</span>
              <span>Property: {propertyDetails.property_name}</span>
              <span>Address: {propertyDetails.address}</span>
              <span>Date: {currentDate}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="work-areas" className="print:hidden">
              <TabsList>
                <TabsTrigger value="work-areas">Work Areas</TabsTrigger>
                <TabsTrigger value="labor">Labor</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="work-areas">
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Defined Work Areas</h3>
                  <Separator className="mb-4" />
                  
                  {sowData.workAreas.length === 0 ? (
                    <p className="text-gray-600 italic">No work areas defined</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Primary Work Areas</h4>
                          <ul className="list-disc pl-5">
                            {sowData.workAreas
                              .filter(area => area.type === 'primary')
                              .map(area => (
                                <li key={area.id} className="mb-2">
                                  <span className="font-medium">{area.name}</span>
                                  {area.notes && (
                                    <p className="text-sm text-gray-600 mt-1">{area.notes}</p>
                                  )}
                                </li>
                              ))
                            }
                          </ul>
                          {sowData.workAreas.filter(area => area.type === 'primary').length === 0 && (
                            <p className="text-sm text-gray-500 italic">No primary work areas defined</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Secondary/Impacted Areas</h4>
                          <ul className="list-disc pl-5">
                            {sowData.workAreas
                              .filter(area => area.type === 'secondary')
                              .map(area => (
                                <li key={area.id} className="mb-2">
                                  <span className="font-medium">{area.name}</span>
                                  {area.notes && (
                                    <p className="text-sm text-gray-600 mt-1">{area.notes}</p>
                                  )}
                                </li>
                              ))
                            }
                          </ul>
                          {sowData.workAreas.filter(area => area.type === 'secondary').length === 0 && (
                            <p className="text-sm text-gray-500 italic">No secondary work areas defined</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="labor">
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Labor Requirements</h3>
                  <Separator className="mb-4" />
                  
                  {sowData.laborItems.length === 0 ? (
                    <p className="text-gray-600 italic">No labor requirements defined</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(
                        sowData.laborItems.reduce((acc, item) => {
                          if (!acc[item.category]) acc[item.category] = [];
                          acc[item.category].push(item);
                          return acc;
                        }, {} as Record<string, typeof sowData.laborItems>)
                      ).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>
                          <ul className="list-disc pl-5">
                            {items.map(item => (
                              <li key={item.id} className="mb-2">
                                <span className="font-medium">{item.subcategory}</span>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Areas: </span>
                                  {item.affectedAreas.join(', ')}
                                </p>
                                {item.notes && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Notes: </span>
                                    {item.notes}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="materials">
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Materials List</h3>
                  <Separator className="mb-4" />
                  
                  {sowData.materialItems.length === 0 ? (
                    <p className="text-gray-600 italic">No materials defined</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(
                        sowData.materialItems.reduce((acc, item) => {
                          if (!acc[item.category]) acc[item.category] = [];
                          acc[item.category].push(item);
                          return acc;
                        }, {} as Record<string, typeof sowData.materialItems>)
                      ).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>
                          <ul className="list-disc pl-5">
                            {items.map(item => (
                              <li key={item.id} className="mb-2">
                                <span className="font-medium">{item.subcategory}</span> - 
                                <span className="ml-1">{item.quantity} {item.unit}</span>
                                
                                {Object.entries(item.details).length > 0 && (
                                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                                    {Object.entries(item.details).map(([key, value]) => (
                                      <li key={key}><span className="font-medium">{key}:</span> {value}</li>
                                    ))}
                                  </ul>
                                )}
                                
                                {item.notes && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Notes: </span>
                                    {item.notes}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Print version - visible only when printing */}
            <div className="hidden print:block mt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Defined Work Areas</h3>
                <Separator className="mb-4" />
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Primary Work Areas</h4>
                    <ul className="list-disc pl-5">
                      {sowData.workAreas
                        .filter(area => area.type === 'primary')
                        .map(area => (
                          <li key={area.id} className="mb-2">
                            <span className="font-medium">{area.name}</span>
                            {area.notes && (
                              <p className="text-sm text-gray-600 mt-1">{area.notes}</p>
                            )}
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Secondary/Impacted Areas</h4>
                    <ul className="list-disc pl-5">
                      {sowData.workAreas
                        .filter(area => area.type === 'secondary')
                        .map(area => (
                          <li key={area.id} className="mb-2">
                            <span className="font-medium">{area.name}</span>
                            {area.notes && (
                              <p className="text-sm text-gray-600 mt-1">{area.notes}</p>
                            )}
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 pt-4">Labor Requirements</h3>
                <Separator className="mb-4" />
                
                <div className="space-y-4">
                  {Object.entries(
                    sowData.laborItems.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, typeof sowData.laborItems>)
                  ).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>
                      <ul className="list-disc pl-5">
                        {items.map(item => (
                          <li key={item.id} className="mb-2">
                            <span className="font-medium">{item.subcategory}</span>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Areas: </span>
                              {item.affectedAreas.join(', ')}
                            </p>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Notes: </span>
                                {item.notes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 pt-4">Materials List</h3>
                <Separator className="mb-4" />
                
                <div className="space-y-4">
                  {Object.entries(
                    sowData.materialItems.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, typeof sowData.materialItems>)
                  ).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>
                      <ul className="list-disc pl-5">
                        {items.map(item => (
                          <li key={item.id} className="mb-2">
                            <span className="font-medium">{item.subcategory}</span> - 
                            <span className="ml-1">{item.quantity} {item.unit}</span>
                            
                            {Object.entries(item.details).length > 0 && (
                              <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                                {Object.entries(item.details).map(([key, value]) => (
                                  <li key={key}><span className="font-medium">{key}:</span> {value}</li>
                                ))}
                              </ul>
                            )}
                            
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Notes: </span>
                                {item.notes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between print:hidden">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
          
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#0f566c]"
          >
            <Download className="h-4 w-4" /> Save SOW
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSOW;
