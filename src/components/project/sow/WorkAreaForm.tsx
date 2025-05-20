
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkAreaTable } from "./WorkAreaTable";
import { useRoomDesign } from "@/hooks/useRoomDesign";
import { WorkAreaFormTabs } from "./components/WorkAreaFormTabs";
import { WorkAreaFormDialog } from "./components/WorkAreaFormDialog";
import { convertMeasurements } from "./utils/measurementUtils";
import { WorkAreaRevisionProps } from './components/RevisionAwareFormProps';
import { WorkAreaFormControls } from './components/WorkAreaFormControls';
import { WorkAreaEmptyState } from './components/WorkAreaEmptyState';

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

interface WorkAreaFormProps extends WorkAreaRevisionProps {
  onSave: (areas: WorkArea[]) => void;
  workAreas?: WorkArea[];
  initialData?: WorkArea[];
  projectData?: any;
  propertyDetails?: any;
}

export function WorkAreaForm({ 
  onSave, 
  workAreas = [], 
  initialData = [], 
  projectData, 
  propertyDetails,
  isRevision = false,
  changedWorkAreas = {}
}: WorkAreaFormProps) {
  const [activeTab, setActiveTab] = useState("interior");
  const [workAreasState, setWorkAreasState] = useState<WorkArea[]>([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const { toast } = useToast();
  
  const { fetchPropertyRooms, propertyRooms } = useRoomDesign(propertyDetails?.id);
  
  // Initialize default empty work area
  const defaultWorkArea: WorkArea = {
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
  };
  
  const [currentArea, setCurrentArea] = useState<WorkArea>(defaultWorkArea);
  const [createMode, setCreateMode] = useState<'new' | 'existing'>('new');
  
  // Load property rooms
  useEffect(() => {
    if (propertyDetails?.id) {
      fetchPropertyRooms(propertyDetails.id);
    }
  }, [propertyDetails?.id, fetchPropertyRooms]);

  // Set initial work areas
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
    setCurrentArea(defaultWorkArea);
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
    
    console.log(`Selected room for SOW: ${selectedRoom.name} (ID: ${selectedRoom.id})`);
    
    // First check if measurements exist directly in design_preferences.roomMeasurements
    let roomMeasurements = projectData?.design_preferences?.roomMeasurements?.[selectedRoom.name];
    
    // If not found with exact name, try with normalized name (e.g., "bathroom_1")
    if (!roomMeasurements) {
      const normalizedRoomName = selectedRoom.name.toLowerCase().replace(/\s+/g, '_');
      roomMeasurements = projectData?.design_preferences?.roomMeasurements?.[normalizedRoomName];
      
      if (roomMeasurements) {
        console.log(`Found measurements using normalized name: ${normalizedRoomName}`, roomMeasurements);
      }
    } else {
      console.log(`Found measurements using exact name: ${selectedRoom.name}`, roomMeasurements);
    }
    
    // Convert measurements if they exist
    const convertedMeasurements = roomMeasurements ? convertMeasurements(roomMeasurements) : null;
    
    // Debug measurements conversion
    console.log('Room measurements from design preferences:', roomMeasurements);
    console.log('Converted measurements for SOW:', convertedMeasurements);
    
    // Set the current area with room data and measurements
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
        <WorkAreaFormTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <Button onClick={() => setIsAddingArea(true)}>
          <Plus className="w-4 h-4 mr-2" />
          ADD WORK AREA
        </Button>
      </div>

      <WorkAreaFormDialog
        isOpen={isAddingArea}
        onOpenChange={setIsAddingArea}
        currentArea={currentArea}
        setCurrentArea={setCurrentArea}
        createMode={createMode}
        setCreateMode={setCreateMode}
        propertyRooms={propertyRooms}
        handleRoomSelect={handleRoomSelect}
        handleAddWorkArea={handleAddWorkArea}
        handleAddAdditionalArea={handleAddAdditionalArea}
      />

      {workAreasState.length > 0 ? (
        <WorkAreaTable 
          workAreas={workAreasState}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          isRevision={isRevision}
          changedWorkAreas={changedWorkAreas}
        />
      ) : (
        <WorkAreaEmptyState />
      )}

      <WorkAreaFormControls onBack={() => window.history.back()} onSave={handleSave} />
    </div>
  );
}
