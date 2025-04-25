
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PropertyLinkInputProps {
  onPropertyDataFetched: (data: any) => void;
}

export function PropertyLinkInput({ onPropertyDataFetched }: PropertyLinkInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      console.log("Scraping property URL:", url);
      const result = await FirecrawlService.scrapePropertyUrl(url);
      
      if (result.success && result.data) {
        console.log("Property data loaded successfully:", result.data);
        onPropertyDataFetched(result.data);
        toast({
          title: "Success",
          description: "Property data loaded successfully",
        });
        setUrl("");
      } else {
        console.error("Failed to load property data:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to load property data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scraping property:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to load property: ${error.message}` 
          : "Failed to load property data. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        type="url"
        placeholder="Paste Zillow or Realtor.com property link..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Fill Form"
        )}
      </Button>
    </form>
  );
}
