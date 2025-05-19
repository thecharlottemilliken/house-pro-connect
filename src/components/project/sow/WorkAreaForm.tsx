<think>

</think>

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
