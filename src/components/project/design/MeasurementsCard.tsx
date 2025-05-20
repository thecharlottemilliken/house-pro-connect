
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

interface MeasurementsCardProps {
  area: string;
  measurements: {
    length?: number | string;
    width?: number | string;
    height?: number | string;
    unit?: string;
  };
  onSaveMeasurements: (measurements: any) => Promise<any>;
}

const MeasurementsCard: React.FC<MeasurementsCardProps> = ({
  area,
  measurements,
  onSaveMeasurements
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm({
    defaultValues: {
      length: measurements?.length?.toString() || '',
      width: measurements?.width?.toString() || '',
      height: measurements?.height?.toString() || '',
      unit: measurements?.unit || 'ft',
    },
  });

  const handleSave = async (data: any) => {
    setIsSaving(true);
    
    try {
      await onSaveMeasurements({
        ...data,
        // Convert string values to numbers where appropriate
        length: data.length ? parseFloat(data.length) : undefined,
        width: data.width ? parseFloat(data.width) : undefined,
        height: data.height ? parseFloat(data.height) : undefined,
      });
      
      setIsEditing(false);
      toast({
        title: "Measurements saved",
        description: `${area} measurements updated successfully.`,
      });
    } catch (error) {
      console.error("Error saving measurements:", error);
      toast({
        title: "Error",
        description: "Failed to save measurements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Room Measurements</CardTitle>
        {!isEditing ? (
          <Button 
            variant="ghost" 
            onClick={() => setIsEditing(true)} 
            className="h-8 px-2"
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                form.reset();
              }}
              className="h-8 px-2"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={form.handleSubmit(handleSave)}
              className="h-8 px-2"
              disabled={isSaving}
            >
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="mb-0">
                    <div className="flex items-center space-x-2">
                      <FormLabel className="text-sm text-gray-500 min-w-[80px]">Unit</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ft">ft</SelectItem>
                            <SelectItem value="m">m</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem className="mb-0">
                  <div className="flex items-center space-x-2">
                    <FormLabel className="text-sm text-gray-500 min-w-[80px]">Length</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="text" 
                        inputMode="decimal"
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem className="mb-0">
                  <div className="flex items-center space-x-2">
                    <FormLabel className="text-sm text-gray-500 min-w-[80px]">Width</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="text" 
                        inputMode="decimal"
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem className="mb-0">
                  <div className="flex items-center space-x-2">
                    <FormLabel className="text-sm text-gray-500 min-w-[80px]">Height</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="text" 
                        inputMode="decimal"
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MeasurementsCard;
