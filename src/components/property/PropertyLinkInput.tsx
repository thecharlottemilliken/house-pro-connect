
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PropertyData {
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  propertyType?: string;
  images?: string[];
  yearBuilt?: string;
  lotSize?: string;
  price?: string;
  description?: string;
}

interface PropertyLinkInputProps {
  onPropertyDataFetched: (data: PropertyData) => void;
}

export function PropertyLinkInput({ onPropertyDataFetched }: PropertyLinkInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a property URL");
      toast({
        title: "Error",
        description: "Please enter a property URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Scraping property URL:", url);
      
      // Validate URL format
      if (!url.startsWith('http')) {
        const correctedUrl = `https://${url}`;
        console.log(`URL doesn't start with http, correcting to: ${correctedUrl}`);
        setUrl(correctedUrl);
      }
      
      // Check if it's a supported real estate site
      if (!url.includes('zillow.com') && !url.includes('realtor.com')) {
        console.warn("URL is not from a recognized real estate site. Results may vary.");
        toast({
          title: "Notice",
          description: "For best results, use Zillow or Realtor.com links",
        });
      }
      
      const result = await FirecrawlService.scrapePropertyUrl(url);
      
      if (result.success && result.data) {
        console.log("Property data loaded successfully:", result.data);
        
        // Validate images
        if (result.data.images && result.data.images.length > 0) {
          console.log(`Found ${result.data.images.length} property image URLs:`, result.data.images);
        } else {
          console.log("No property image URLs found in the scraped data");
        }
        
        onPropertyDataFetched(result.data);
        toast({
          title: "Success",
          description: "Property data loaded successfully",
        });
        setUrl("");
      } else {
        const errorMsg = result.error || "Failed to load property data. Please try again.";
        console.error("Failed to load property data:", errorMsg);
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? `Failed to load property: ${error.message}` 
        : "Failed to load property data. Please check console for details.";
      console.error("Error scraping property:", error);
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste Zillow or Realtor.com property link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={isLoading}
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
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <p className="text-xs text-gray-500">
        Paste a property URL from Zillow or Realtor.com to automatically fill the form fields and import property images using AI.
      </p>
    </div>
  );
}
