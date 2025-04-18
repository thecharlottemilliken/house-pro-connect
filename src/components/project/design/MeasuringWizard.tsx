
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Ruler, MoveHorizontal, MoveVertical, LayoutPanelTop, Check } from "lucide-react";

interface MeasuringWizardProps {
  area: string;
  initialMeasurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'ft' | 'm';
    additionalNotes?: string;
  };
  onComplete: (measurements: any) => void;
}

const MeasuringWizard = ({ area, initialMeasurements, onComplete }: MeasuringWizardProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const form = useForm({
    defaultValues: {
      length: initialMeasurements?.length || '',
      width: initialMeasurements?.width || '',
      height: initialMeasurements?.height || '',
      unit: initialMeasurements?.unit || 'ft',
      additionalNotes: initialMeasurements?.additionalNotes || '',
    }
  });

  const goToNextStep = () => {
    setStep(current => Math.min(current + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    setStep(current => Math.max(current - 1, 1));
  };

  const onSubmit = (data: any) => {
    // Convert string values to numbers
    const processedData = {
      ...data,
      length: data.length ? parseFloat(data.length) : undefined,
      width: data.width ? parseFloat(data.width) : undefined,
      height: data.height ? parseFloat(data.height) : undefined,
    };
    onComplete(processedData);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-6">
              <Ruler className="h-12 w-12 text-gray-600" />
            </div>
            <p>Taking accurate measurements is essential for your renovation project. Here's what you'll need:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A tape measure (at least 25 feet long)</li>
              <li>Paper and pencil to note measurements</li>
              <li>A helper (optional but recommended)</li>
            </ul>
            <p>During this process, we'll measure the length, width, and height of your {area.toLowerCase()}.</p>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-6">
              <MoveHorizontal className="h-12 w-12 text-gray-600" />
            </div>
            <p className="mb-4">
              <strong>Measuring length and width:</strong>
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Measure the longest wall of your {area.toLowerCase()} for length</li>
              <li>Measure the perpendicular wall for width</li>
              <li>For irregular rooms, measure at the longest points</li>
              <li>Double-check your measurements</li>
            </ol>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input type="number" step="0.1" {...field} />
                          <select
                            className="ml-2 h-10 rounded-md border border-input bg-background px-3"
                            value={form.watch("unit")}
                            onChange={(e) => form.setValue("unit", e.target.value as 'ft' | 'm')}
                          >
                            <option value="ft">ft</option>
                            <option value="m">m</option>
                          </select>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>

              <Form {...form}>
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-6">
              <MoveVertical className="h-12 w-12 text-gray-600" />
            </div>
            <p className="mb-4">
              <strong>Measuring height:</strong>
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Measure from the floor to ceiling</li>
              <li>Check in multiple locations as ceilings may not be level</li>
              <li>Note any ceiling features (beams, soffits, etc.)</li>
            </ol>
            
            <Form {...form}>
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Height</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-6">
              <LayoutPanelTop className="h-12 w-12 text-gray-600" />
            </div>
            <p>
              <strong>Additional details:</strong>
            </p>
            <p>Note any important features of your {area.toLowerCase()} that might affect the renovation:</p>
            
            <Form {...form}>
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={`E.g., windows, doors, built-ins, unusual angles, etc.`}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
            
            <div className="mt-6 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">
                <strong>Summary of measurements:</strong><br />
                Length: {form.watch("length") || '–'} {form.watch("unit")}<br />
                Width: {form.watch("width") || '–'} {form.watch("unit")}<br />
                Height: {form.watch("height") || '–'} {form.watch("unit")}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="relative">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${idx + 1 <= step ? 'bg-[#174c65] text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {idx + 1 === step && <span>{idx + 1}</span>}
                {idx + 1 < step && <Check className="h-4 w-4" />}
                {idx + 1 > step && <span>{idx + 1}</span>}
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-gray-200 w-full mt-4">
            <div 
              className="absolute top-0 left-0 h-1 bg-[#174c65] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {renderStepContent()}
      </div>

      <DialogFooter className="mt-6">
        {step > 1 && (
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            className="mr-auto"
          >
            Back
          </Button>
        )}
        
        {step < totalSteps ? (
          <Button onClick={goToNextStep}>Continue</Button>
        ) : (
          <DialogClose asChild>
            <Button onClick={form.handleSubmit(onSubmit)}>
              Save Measurements
            </Button>
          </DialogClose>
        )}
      </DialogFooter>
    </>
  );
};

export default MeasuringWizard;
