
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import MeasuringWizard from './MeasuringWizard';
import { supabase } from "@/integrations/supabase/client";
import { useParams } from 'react-router-dom';
import { Json } from "@/integrations/supabase/types";

interface RoomMeasurementsCardProps {
  area: string;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  onSaveMeasurements: (measurements: any) => void;
}

const RoomMeasurementsCard = ({ 
  area, 
  measurements, 
  onSaveMeasurements 
}: RoomMeasurementsCardProps) => {
  const { toast } = useToast();
  const params = useParams();
  const projectId = params.projectId;
  const hasMeasurements = measurements && (measurements.length || measurements.width);

  const calculateSquareFootage = () => {
    if (!measurements?.length || !measurements?.width) return null;
    
    // Ensure we're working with numbers
    const length = Number(measurements.length);
    const width = Number(measurements.width);
    
    if (isNaN(length) || isNaN(width)) return null;
    
    const area = length * width;
    
    // Convert to square feet if measurements are in meters
    return measurements.unit === 'm' ? area * 10.764 : area;
  };

  const formatSquareFootage = (sqft: number | null) => {
    if (sqft === null) return null;
    return sqft.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const squareFootage = calculateSquareFootage();
  const formattedSquareFootage = formatSquareFootage(squareFootage);
  
  const handleSaveMeasurements = async (newMeasurements: any) => {
    try {
      const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select('design_preferences')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      // Handle the design_preferences as an object, accounting for it possibly being null or another type
      const designPreferences = typeof currentProject.design_preferences === 'object' && currentProject.design_preferences !== null 
        ? currentProject.design_preferences 
        : {};
      
      // Handle roomMeasurements, ensuring we're working with an object
      const roomMeasurements = typeof designPreferences === 'object' && 
        'roomMeasurements' in designPreferences && 
        typeof designPreferences.roomMeasurements === 'object' 
          ? designPreferences.roomMeasurements 
          : {};

      const updatedDesignPreferences = {
        ...designPreferences,
        roomMeasurements: {
          ...roomMeasurements,
          [area.toLowerCase()]: newMeasurements
        }
      };

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectId);

      if (updateError) throw updateError;

      onSaveMeasurements(newMeasurements);
      toast({
        title: "Measurements saved",
        description: `Room measurements for ${area} have been saved successfully.`
      });
    } catch (error: any) {
      console.error('Error saving measurements:', error);
      toast({
        title: "Error saving measurements",
        description: "There was a problem saving the room measurements. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-sm border-gray-200/50 mt-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-base">Room Measurements</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Ruler className="h-4 w-4" />
                {hasMeasurements ? "Edit Measurements" : "Help me measure"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Measure Your {area}</DialogTitle>
                <DialogDescription>
                  Let's walk through measuring your {area.toLowerCase()} for your renovation project.
                </DialogDescription>
              </DialogHeader>
              <MeasuringWizard 
                area={area} 
                initialMeasurements={measurements} 
                onComplete={handleSaveMeasurements} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {hasMeasurements ? (
          <div className="bg-gray-50 rounded-md p-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-sm text-gray-500">Length</p>
                <p className="font-medium">{measurements.length} {measurements.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Width</p>
                <p className="font-medium">{measurements.width} {measurements.unit}</p>
              </div>
              {measurements.height && (
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">{measurements.height} {measurements.unit}</p>
                </div>
              )}
              {squareFootage && (
                <div>
                  <p className="text-sm text-gray-500">Square Footage</p>
                  <p className="font-medium">{formattedSquareFootage} SQFT</p>
                </div>
              )}
            </div>
            {measurements.additionalNotes && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm">{measurements.additionalNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <Ruler className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium">No measurements added</p>
            <p className="text-sm text-gray-500 mt-1">Add the dimensions of your {area.toLowerCase()} for accurate planning</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomMeasurementsCard;
