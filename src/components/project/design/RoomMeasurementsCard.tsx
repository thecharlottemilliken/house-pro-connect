
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

      // Make sure area is a string before calling toLowerCase()
      const safeArea = typeof area === 'string' ? area.toLowerCase() : String(area).toLowerCase();

      const updatedDesignPreferences = {
        ...designPreferences,
        roomMeasurements: {
          ...roomMeasurements,
          [safeArea]: newMeasurements
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
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        <div className="bg-[#174c65] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xl">Room Measurements</h3>
              <p className="text-white/80 mt-1">Add measurements of your {area.toLowerCase()}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-[#174c65] hover:bg-gray-100">
                  {hasMeasurements ? "Edit Measurements" : "Measure Room"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
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
        </div>

        {hasMeasurements ? (
          <div className="p-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Length</p>
                <p className="font-medium text-base">{measurements.length} {measurements.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Width</p>
                <p className="font-medium text-base">{measurements.width} {measurements.unit}</p>
              </div>
              {measurements.height && (
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium text-base">{measurements.height} {measurements.unit}</p>
                </div>
              )}
              {squareFootage && (
                <div>
                  <p className="text-sm text-gray-500">Square Footage</p>
                  <p className="font-medium text-base">{formattedSquareFootage} SQFT</p>
                </div>
              )}
            </div>
            {measurements.additionalNotes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm">{measurements.additionalNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#174c65]/10 flex items-center justify-center mb-3">
              <Ruler className="h-6 w-6 text-[#174c65]" />
            </div>
            <h4 className="font-semibold text-gray-900">Add your room measurements</h4>
            <p className="text-gray-500 max-w-md mt-1">
              Provide accurate dimensions for better planning and more precise project estimates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomMeasurementsCard;
