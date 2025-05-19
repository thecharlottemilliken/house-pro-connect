
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BidConfigRevisionProps } from './components/RevisionAwareFormProps';

export interface BidConfiguration {
  bidDuration: string;
  projectDescription: string;
}

interface BidConfigurationFormProps extends BidConfigRevisionProps {
  onSave: (data: BidConfiguration) => void;
  bidConfiguration?: BidConfiguration;
  initialData?: BidConfiguration;
}

export function BidConfigurationForm({ 
  onSave, 
  bidConfiguration, 
  initialData,
  isRevision = false,
  hasChanges = false
}: BidConfigurationFormProps) {
  // Use bidConfiguration or initialData if provided, otherwise use default values
  const defaultValues = bidConfiguration || initialData || {
    bidDuration: '7',
    projectDescription: '',
  };

  const form = useForm<BidConfiguration>({
    defaultValues
  });

  // Update form values if props change
  useEffect(() => {
    if (bidConfiguration || initialData) {
      const values = bidConfiguration || initialData;
      if (values) {
        form.reset(values);
      }
    }
  }, [bidConfiguration, initialData, form]);

  const onSubmit = (data: BidConfiguration) => {
    onSave(data);
  };

  const highlightClass = isRevision && hasChanges ? "p-4 bg-yellow-50 rounded-md border border-yellow-200" : "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${isRevision ? highlightClass : ""}`}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="bidDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bid Duration</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bid duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Overview</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide a general overview of the project..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit">
            Save & Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
