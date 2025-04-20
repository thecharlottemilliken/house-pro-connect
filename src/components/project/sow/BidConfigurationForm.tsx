
import { useState } from 'react';
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

interface BidConfigurationFormProps {
  onSave: (data: BidConfiguration) => void;
  initialData?: BidConfiguration;
}

interface BidConfiguration {
  bidDuration: string;
  projectDescription: string;
}

export function BidConfigurationForm({ onSave, initialData }: BidConfigurationFormProps) {
  const form = useForm<BidConfiguration>({
    defaultValues: initialData || {
      bidDuration: '7',
      projectDescription: '',
    }
  });

  const onSubmit = (data: BidConfiguration) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
