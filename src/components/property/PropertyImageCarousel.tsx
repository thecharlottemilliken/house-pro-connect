
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

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  const handleImageError = (index: number) => {
    console.error(`Failed to load image at index ${index}:`, displayImages[index]);
    // Replace the failed image URL with the default image
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
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
                src={image}
                alt={`Property image ${index + 1}`}
                className="rounded-lg object-cover w-full h-full"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                style={{ visibility: loadingStates[index] ? 'hidden' : 'visible' }}
              />
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
