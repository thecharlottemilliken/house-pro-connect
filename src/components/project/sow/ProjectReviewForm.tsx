
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActionItemsGenerator } from "@/hooks/useActionItemsGenerator";

interface ProjectReviewFormProps {
  workAreas: any[];
  laborItems: any[];
  materialItems: any[];
  bidConfiguration: {
    bidDuration: string;
    projectDescription: string;
  };
  projectId: string;
  isRevision?: boolean;
  onSave: (confirmed: boolean) => void;
}

export function ProjectReviewForm({
  workAreas,
  laborItems,
  materialItems,
  bidConfiguration,
  projectId,
  isRevision = false,
  onSave
}: ProjectReviewFormProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { generateActionItems } = useActionItemsGenerator();

  const handleSaveSOW = async () => {
    if (!confirmed) return;
    
    setIsSaving(true);
    
    try {
      // First check if SOW exists for this project
      const { data: existingSOW, error: fetchError } = await supabase
        .from('statement_of_work')
        .select('id')
        .eq('project_id', projectId)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (existingSOW) {
        // Update existing SOW record with completed status
        const { error } = await supabase
          .from('statement_of_work')
          .update({
            work_areas: workAreas,
            labor_items: laborItems,
            material_items: materialItems,
            bid_configuration: bidConfiguration,
            status: 'ready for review', // This status is used for both initial submission and after revision
            feedback: null // Clear any previous feedback when resubmitting
          })
          .eq('id', existingSOW.id);
          
        if (error) throw error;
      } else {
        // Create new SOW record with completed status
        const { error } = await supabase
          .from('statement_of_work')
          .insert([{
            project_id: projectId,
            work_areas: workAreas,
            labor_items: laborItems,
            material_items: materialItems,
            bid_configuration: bidConfiguration,
            status: 'ready for review'
          }]);
          
        if (error) throw error;
      }
      
      // Generate action items to ensure the SOW review item appears
      await generateActionItems(projectId);
      
      toast({
        title: "Success",
        description: isRevision 
          ? "Revised Statement of Work has been submitted for review"
          : "Statement of Work has been saved and submitted for review",
      });
      
      onSave(true);
    } catch (error) {
      console.error("Error saving SOW:", error);
      toast({
        title: "Error",
        description: "Failed to save the Statement of Work",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to format specifications object for display
  const formatSpecifications = (specs: any): React.ReactNode => {
    if (!specs || Object.keys(specs).length === 0) return null;

    // Handle cabinet array specifically
    if (specs.cabinets && Array.isArray(specs.cabinets)) {
      return (
        <div>
          <p className="font-medium">Cabinets:</p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            {specs.cabinets.map((cab: any, i: number) => (
              <li key={i}>
                {cab.type} - {cab.doors} doors, {cab.drawers} drawers, {cab.size}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Generic handling for all other specification types
    return (
      <div>
        {Object.entries(specs).map(([key, value]) => {
          // Skip empty values or complex objects
          if (!value || typeof value === 'object') return null;
          return (
            <p key={key} className="text-xs">
              <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: </span>
              {String(value)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              {workAreas.map((area: any, index: number) => (
                <li key={index} className="text-gray-700">
                  {area.name}
                  {area.additionalAreas && area.additionalAreas.length > 0 && (
                    <ul className="list-circle pl-6 mt-1">
                      {area.additionalAreas.map((subArea: any, subIndex: number) => (
                        <li key={subIndex} className="text-gray-600 text-sm">
                          {subArea.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-4">
              {Object.entries(
                laborItems.reduce((acc: any, item: any) => {
                  if (!acc[item.category]) {
                    acc[item.category] = [];
                  }
                  acc[item.category].push(item);
                  return acc;
                }, {})
              ).map(([category, items]: [string, any]) => (
                <li key={category}>
                  <strong>{category}</strong>
                  <ul className="list-circle pl-6 mt-2">
                    {items.map((item: any, index: number) => (
                      <li key={index} className="text-gray-600">
                        {item.task}
                        {item.rooms && item.rooms.length > 0 && (
                          <ul className="list-none pl-4 mt-1">
                            {item.rooms.map((room: any, roomIndex: number) => (
                              <li key={roomIndex} className="text-sm text-gray-500">
                                {room.name}: {room.notes}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-4">
              {Object.entries(
                materialItems.reduce((acc: any, item: any) => {
                  if (!acc[item.category]) {
                    acc[item.category] = [];
                  }
                  acc[item.category].push(item);
                  return acc;
                }, {})
              ).map(([category, items]: [string, any]) => (
                <li key={category}>
                  <strong>{category}</strong>
                  <ul className="list-circle pl-6 mt-2">
                    {items.map((item: any, index: number) => (
                      <li key={index} className="text-gray-600">
                        {item.type}
                        {/* Display specifications if they exist */}
                        {item.specifications && Object.keys(item.specifications).length > 0 && (
                          <div className="mt-1 ml-2 text-gray-500">
                            {formatSpecifications(item.specifications)}
                          </div>
                        )}
                        {item.rooms && item.rooms.length > 0 && (
                          <ul className="list-none pl-4 mt-1">
                            {item.rooms.map((room: any, roomIndex: number) => (
                              <li key={roomIndex} className="text-sm text-gray-500">
                                <span className="font-medium">{room.name}:</span> {room.notes}
                                {/* Display specifications from the room if they exist */}
                                {room.specifications && Object.keys(room.specifications).length > 0 && (
                                  <div className="mt-1 ml-2">
                                    {formatSpecifications(room.specifications)}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bid Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Bid Duration</h4>
              <p className="text-gray-600">{bidConfiguration.bidDuration} days</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Project Overview</h4>
              <p className="text-gray-600">{bidConfiguration.projectDescription}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="flex items-start space-x-2">
        <Checkbox
          id="review-confirm"
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked as boolean)}
        />
        <Label
          htmlFor="review-confirm"
          className="text-sm leading-relaxed"
        >
          I confirm that I have reviewed all the information above and it accurately reflects the scope of work for this project.
        </Label>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSOW} 
          disabled={!confirmed || isSaving}
        >
          {isSaving ? 
            "Saving..." : 
            isRevision ? "Submit Revised SOW" : "Submit SOW"
          }
        </Button>
      </div>
    </div>
  );
}
