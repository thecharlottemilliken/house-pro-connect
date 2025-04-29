
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyImageCarouselProps {
  images: string[];
}

export function PropertyImageCarousel({ images }: PropertyImageCarouselProps) {
  const defaultImage = "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80";
  const displayImages = images.length > 0 ? images : [defaultImage];
  const [loadingStates, setLoadingStates] = useState<boolean[]>(new Array(displayImages.length).fill(true));
  const [errorStates, setErrorStates] = useState<boolean[]>(new Array(displayImages.length).fill(false));

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

  // Try to fix Zillow image URLs if needed
  const processImageUrl = (url: string): string => {
    if (!url) return defaultImage;
    
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
  };
  
  return (
    <Carousel className="w-full max-w-3xl mx-auto">
      <CarouselContent>
        {displayImages.map((image, index) => (
          <CarouselItem key={index}>
            <AspectRatio ratio={16 / 9} className="relative">
              {loadingStates[index] && (
                <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
              )}
              <img
                src={processImageUrl(image)}
                alt={`Property image ${index + 1}`}
                className={`rounded-lg object-cover w-full h-full ${errorStates[index] ? 'opacity-50' : ''}`}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                style={{ visibility: loadingStates[index] ? 'hidden' : 'visible' }}
              />
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
  );
}
