
import React from 'react';
import PhotoItem from './PhotoItem';

interface PhotoGridProps {
  photos: string[];
  onRemovePhoto: (index: number) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
}

const PhotoGrid = ({ photos, onRemovePhoto, onReorderPhotos }: PhotoGridProps) => {
  if (photos.length === 0) return null;
  
  if (photos.length === 1) {
    return (
      <div className="w-full">
        <PhotoItem 
          photo={photos[0]} 
          index={0} 
          onRemove={onRemovePhoto}
          onReorder={onReorderPhotos}
        />
      </div>
    );
  } else if (photos.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <PhotoItem 
            key={index} 
            photo={photo} 
            index={index} 
            onRemove={onRemovePhoto}
            onReorder={onReorderPhotos}
          />
        ))}
      </div>
    );
  } else if (photos.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <PhotoItem 
            photo={photos[0]} 
            index={0} 
            onRemove={onRemovePhoto}
            onReorder={onReorderPhotos}
          />
        </div>
        <div className="col-span-1">
          <PhotoItem 
            photo={photos[1]} 
            index={1} 
            onRemove={onRemovePhoto}
            onReorder={onReorderPhotos}
          />
        </div>
        <div className="col-span-2">
          <PhotoItem 
            photo={photos[2]} 
            index={2} 
            onRemove={onRemovePhoto}
            onReorder={onReorderPhotos}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-2 gap-4">
        <PhotoItem photo={photos[0]} index={0} onRemove={onRemovePhoto} onReorder={onReorderPhotos} />
        <PhotoItem photo={photos[1]} index={1} onRemove={onRemovePhoto} onReorder={onReorderPhotos} />
        <PhotoItem photo={photos[2]} index={2} onRemove={onRemovePhoto} onReorder={onReorderPhotos} />
        {photos.length > 3 && (
          <PhotoItem photo={photos[3]} index={3} onRemove={onRemovePhoto} onReorder={onReorderPhotos} />
        )}
        {photos.length > 4 && (
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {photos.slice(4).map((photo, idx) => (
                <PhotoItem 
                  key={idx + 4} 
                  photo={photo} 
                  index={idx + 4} 
                  onRemove={onRemovePhoto}
                  onReorder={onReorderPhotos}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default PhotoGrid;
