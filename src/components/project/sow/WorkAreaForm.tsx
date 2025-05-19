
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Square, Ruler, Bookmark, MoveRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkAreaTable } from "./WorkAreaTable";
import { useRoomDesign } from "@/hooks/useRoomDesign";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WorkArea {
  name: string;
  notes: string;
  measurements: {
    length: string;
    width: string;
    height: string;
    totalSqft: string;
  };
  affectsOtherAreas: boolean;
  additionalAreas: Array<{
    name: string;
    notes: string;
  }>;
  sourceRoomId?: string;
}

interface WorkAreaFormProps {
  onSave: (areas: WorkArea[]) => void;
  workAreas?: WorkArea[];
  initialData?: WorkArea[];
  projectData?: any;
  propertyDetails?: any;
}

const convertMeasurements = (roomMeasurements: any) => {
  if (!roomMeasurements) return null;
  
  // Handle cases where measurements might be in ft or m
  const multiplier = roomMeasurements.unit === 'ft' ? 12 : 39.37; // Convert to inches
  
  return {
    length: roomMeasurements.length ? String(Math.round(roomMeasurements.length * multiplier)) : '',
    width: roomMeasurements.width ? String(Math.round(roomMeasurements.width * multiplier)) : '',
    height: roomMeasurements.height ? String(Math.round(roomMeasurements.height * multiplier)) : '',
    totalSqft: roomMeasurements.length && roomMeasurements.width 
      ? String(Math.round(roomMeasurements.length * roomMeasurements.width)) 
      : ''
  };
};

export function WorkAreaForm({ onSave, workAreas = [], initialData = [], projectData, propertyDetails }: WorkAreaFormProps) {
  const [activeTab, setActiveTab] = useState("interior");
  const [workAreasState, setWorkAreasState] = useState<WorkArea[]>([]);
  const [currentArea, setCurrentArea] = useState<WorkArea>({
    name: '',
    notes: '',
    measurements: {
      length: '',
      width: '',
      height: '',
      totalSqft: ''
    },
    affectsOtherAreas: false,
    additionalAreas: []
  });
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [createMode, setCreateMode] = useState<'new' | 'existing'>('new');
  const { toast } = useToast();
  
  const { fetchPropertyRooms, propertyRooms } = useRoomDesign(propertyDetails?.id);
  
  useEffect(() => {
    if (propertyDetails?.id) {
      fetchPropertyRooms(propertyDetails.id);
    }
  }, [propertyDetails?.id, fetchPropertyRooms]);

  useEffect(() => {
    if (workAreas && workAreas.length > 0) {
      setWorkAreasState(workAreas);
    } else if (initialData && initialData.length > 0) {
      setWorkAreasState(initialData);
    }
  }, [workAreas, initialData]);

  const handleAddWorkArea = () => {
    if (!currentArea.name.trim()) {
      toast({
        title: "Work Area Name Required",
        description: "Please provide a name for the work area before adding it.",
        variant: "destructive",
      });
      return;
    }
    setWorkAreasState([...workAreasState, currentArea]);
    setCurrentArea({
      name: '',
      notes: '',
      measurements: {
        length: '',
        width: '',
        height: '',
        totalSqft: ''
      },
      affectsOtherAreas: false,
      additionalAreas: []
    });
    setIsAddingArea(false);
    toast({
      title: "Work Area Added",
      description: "The work area has been added successfully.",
    });
  };

  const handleAddAdditionalArea = () => {
    setCurrentArea({
      ...currentArea,
      additionalAreas: [
        ...currentArea.additionalAreas,
        { name: '', notes: '' }
      ]
    });
  };

  const handleEdit = (area: WorkArea, index: number) => {
    setCurrentArea(area);
    setIsAddingArea(true);
    setCreateMode('new');
  };

  const handleDuplicate = (area: WorkArea) => {
    const duplicatedArea = {
      ...area,
      name: `${area.name} (Copy)`,
    };
    setWorkAreasState([...workAreasState, duplicatedArea]);
    toast({
      title: "Work Area Duplicated",
      description: "The work area has been duplicated successfully.",
    });
  };

  const handleDelete = (index: number) => {
    const updatedAreas = workAreasState.filter((_, i) => i !== index);
    setWorkAreasState(updatedAreas);
    toast({
      title: "Work Area Deleted",
      description: "The work area has been deleted successfully.",
    });
  };

  const handleSave = () => {
    if (workAreasState.length === 0) {
      toast({
        title: "No Work Areas",
        description: "Please add at least one work area before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    onSave(workAreasState);
    toast({
      title: "Work Areas Saved",
      description: `Successfully saved ${workAreasState.length} work area(s).`,
    });
  };
  
  const handleRoomSelect = (roomId: string) => {
    const selectedRoom = propertyRooms.find(room => room.id === roomId);
    if (!selectedRoom) return;
    
    // Get room measurements from design preferences
    const roomMeasurements = projectData?.design_preferences?.roomMeasurements?.[selectedRoom.name];
    const convertedMeasurements = convertMeasurements(roomMeasurements);
    
    setCurrentArea({
      name: selectedRoom.name,
      notes: '',
      measurements: convertedMeasurements || {
        length: '',
        width: '',
        height: '',
        totalSqft: ''
      },
      affectsOtherAreas: false,
      additionalAreas: [],
      sourceRoomId: selectedRoom.id
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="interior" className="w-[400px]">
          <TabsList>
            <TabsTrigger 
              value="interior" 
              className="flex-1"
              onClick={() => setActiveTab("interior")}
            >
              Interior
            </TabsTrigger>
            <TabsTrigger 
              value="exterior" 
              className="flex-1"
              onClick={() => setActiveTab("exterior")}
            >
              Exterior
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Dialog open={isAddingArea} onOpenChange={setIsAddingArea}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              ADD WORK AREA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Define Work Area</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-start gap-4 mb-4">
                    <Button
                      variant={createMode === 'new' ? "default" : "outline"}
                      onClick={() => setCreateMode('new')}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                    <Button
                      variant={createMode === 'existing' ? "default" : "outline"}
                      onClick={() => setCreateMode('existing')}
                      className="flex-1"
                      disabled={!propertyDetails?.id || propertyRooms.length === 0}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Use Existing Room
                    </Button>
                  </div>
                  
                  {createMode === 'existing' && (
                    <div className="space-y-4 my-4">
                      <div className="space-y-2">
                        <Label htmlFor="room-select">Select an existing room</Label>
                        <Select onValueChange={handleRoomSelect}>
                          <SelectTrigger id="room-select">
                            <SelectValue placeholder="Select a room" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyRooms.map(room => (
                              <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {currentArea.sourceRoomId && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Room data and measurements will be imported
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Work Area Details</h3>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="work-area-name">Work Area Name*</Label>
                      <Input
                        id="work-area-name"
                        placeholder="e.g., Kitchen, Master Bathroom, Living Room"
                        value={currentArea.name}
                        onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="work-area-notes">Description & Scope</Label>
                      <Textarea
                        id="work-area-notes"
                        placeholder="Describe the work to be done in this area..."
                        value={currentArea.notes}
                        onChange={(e) => setCurrentArea({ ...currentArea, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Room Measurements</h3>
                    {currentArea.sourceRoomId && (
                      <Badge variant="outline" className="ml-auto">
                        Imported from room data
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-sqft">Total SQFT</Label>
                      <Input
                        id="total-sqft"
                        type="number"
                        placeholder="0"
                        value={currentArea.measurements.totalSqft}
                        onChange={(e) => setCurrentArea({
                          ...currentArea,
                          measurements: { ...currentArea.measurements, totalSqft: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (inches)</Label>
                      <Input
                        id="length"
                        type="number"
                        placeholder="0"
                        value={currentArea.measurements.length}
                        onChange={(e) => setCurrentArea({
                          ...currentArea,
                          measurements: { ...currentArea.measurements, length: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (inches)</Label>
                      <Input
                        id="width"
                        type="number"
                        placeholder="0"
                        value={currentArea.measurements.width}
                        onChange={(e) => setCurrentArea({
                          ...currentArea,
                          measurements: { ...currentArea.measurements, width: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (inches)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="0"
                        value={currentArea.measurements.height}
                        onChange={(e) => setCurrentArea({
                          ...currentArea,
                          measurements: { ...currentArea.measurements, height: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="affects-other-areas"
                      checked={currentArea.affectsOtherAreas}
                      onCheckedChange={(checked) => 
                        setCurrentArea({ ...currentArea, affectsOtherAreas: checked as boolean })
                      }
                    />
                    <Label htmlFor="affects-other-areas">This work will affect other areas of the property</Label>
                  </div>

                  {currentArea.affectsOtherAreas && (
                    <div className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground">List any other areas that will be impacted by this work</p>
                      {currentArea.additionalAreas.map((area, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Affected Area Name</Label>
                              <Input
                                placeholder="e.g., Hallway, Adjacent Room"
                                value={area.name}
                                onChange={(e) => {
                                  const updatedAreas = [...currentArea.additionalAreas];
                                  updatedAreas[index].name = e.target.value;
                                  setCurrentArea({ ...currentArea, additionalAreas: updatedAreas });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Impact Description</Label>
                              <Textarea
                                placeholder="Describe how this area will be affected..."
                                value={area.notes}
                                onChange={(e) => {
                                  const updatedAreas = [...currentArea.additionalAreas];
                                  updatedAreas[index].notes = e.target.value;
                                  setCurrentArea({ ...currentArea, additionalAreas: updatedAreas });
                                }}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddAdditionalArea}
                        className="w-full mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Affected Area
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setIsAddingArea(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWorkArea}>
                  Add Work Area
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {workAreasState.length > 0 ? (
        <WorkAreaTable 
          workAreas={workAreasState}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ) : null}

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          BACK
        </Button>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={handleSave}
          >
            SAVE & EXIT
          </Button>
          <Button
            onClick={handleSave}
          >
            NEXT
          </Button>
        </div>
      </div>
    </div>
  );
}
