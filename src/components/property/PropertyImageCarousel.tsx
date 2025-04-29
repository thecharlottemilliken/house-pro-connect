
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface PropertyImageCarouselProps {
  images: string[];
}

export function PropertyImageCarousel({ images }: PropertyImageCarouselProps) {
  const defaultImage = "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80";
  const [displayImages, setDisplayImages] = useState<string[]>(images.length > 0 ? images : [defaultImage]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>(new Array(images.length || 1).fill(true));
  const [errorStates, setErrorStates] = useState<boolean[]>(new Array(images.length || 1).fill(false));

  useEffect(() => {
    // Update display images when props change
    setDisplayImages(images.length > 0 ? images : [defaultImage]);
    setLoadingStates(new Array(images.length || 1).fill(true));
    setErrorStates(new Array(images.length || 1).fill(false));
  }, [images]);

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  const handleImageError = (index: number) => {
    console.error(`Failed to load image at index ${index}:`, displayImages[index]);
    
    // Mark image as failed
    setErrorStates(prev => {
      const newStates = [...prev];
      newStates[index] = true;
      return newStates;
    });
    
    // End loading state
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  // Process image URLs to ensure they work properly
  const processImageUrl = (url: string): string => {
    if (!url) return defaultImage;
    
    try {
      // If URL already processed properly, return as is
      if (url.startsWith('http') && !url.includes('undefined')) {
        return url;
      }
      
      // Fix common issues with Zillow URLs
      if (url.includes('photos.zillow') || url.includes('zillowstatic')) {
        // Make sure URL has proper protocol
        if (!url.startsWith('http')) {
          return `https://${url.replace(/^\/\//, '')}`;
        }
        
        // Remove size limitations for better quality
        return url.replace(/-cc_ft_\d+/g, '');
      }
      
      return url;
    } catch (e) {
      console.error("Error processing image URL:", e);
      return defaultImage;
    }
  };

  // Count valid images (non-error)
  const validImageCount = errorStates.filter(state => !state).length;
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {validImageCount === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-gray-200 bg-gray-50">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900">No images available</h3>
          <p className="text-gray-500 mt-1">
            We couldn't load any images for this property.
          </p>
        </div>
      ) : (
        <Carousel className="w-full">
          <CarouselContent>
            {displayImages.map((image, index) => (
              <CarouselItem key={index}>
                <AspectRatio ratio={16 / 9} className="relative">
                  {loadingStates[index] && (
                    <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
                  )}
                  {!errorStates[index] && (
                    <img
                      src={processImageUrl(image)}
                      alt={`Property image ${index + 1}`}
                      className={`rounded-lg object-cover w-full h-full`}
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                      style={{ visibility: loadingStates[index] ? 'hidden' : 'visible' }}
                    />
                  )}
                  {errorStates[index] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 rounded-lg">
                      <p className="text-gray-500 text-sm">Image failed to load</p>
                    </div>
                  )}
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
}
