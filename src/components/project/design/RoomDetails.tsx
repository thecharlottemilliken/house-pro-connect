import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import RoomMeasurementsCard from './RoomMeasurementsCard';
import BeforePhotosSection from './BeforePhotosSection';
import SelectPropertyPhotosDialog from './SelectPropertyPhotosDialog';

interface Designer {
  id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  speciality?: string;
}

interface RoomDetailsProps {
  area: string;
  location?: string;
  designers: Designer[];
  designAssets?: any[];
  measurements?: any;
  beforePhotos?: string[];
  propertyPhotos?: string[];
  onAddDesigner: () => void;
  onUploadAssets: () => void;
  onSaveMeasurements: (measurements: any) => void;
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({
  area,
  location,
  designers = [],
  designAssets = [],
  measurements,
  beforePhotos = [],
  propertyPhotos = [],
  onAddDesigner,
  onUploadAssets,
  onSaveMeasurements,
  onSelectBeforePhotos,
  onUploadBeforePhotos
}) => {
  const [isPropertyPhotosDialogOpen, setIsPropertyPhotosDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Room Details</h3>
        <p className="text-gray-700">
          Area: {area}
          {location && `, Location: ${location}`}
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Designers</h3>
          <Button variant="outline" size="sm" className="text-[#174c65] border-[#174c65]" onClick={onAddDesigner}>
            <Plus className="w-4 h-4 mr-2" /> ADD DESIGNER
          </Button>
        </div>
        {designers.length > 0 ? (
          <ul className="list-disc pl-5">
            {designers.map((designer) => (
              <li key={designer.id}>
                {designer.businessName} ({designer.speciality})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No designers added yet.</p>
        )}
      </div>

      <RoomMeasurementsCard 
        area={area}
        measurements={measurements}
        onSaveMeasurements={onSaveMeasurements}
      />

      <BeforePhotosSection 
        area={area}
        beforePhotos={beforePhotos}
        propertyPhotos={propertyPhotos}
        onSelectPhotos={() => setIsPropertyPhotosDialogOpen(true)}
        onUploadPhotos={onUploadBeforePhotos}
      />

      <SelectPropertyPhotosDialog
        isOpen={isPropertyPhotosDialogOpen}
        onClose={() => setIsPropertyPhotosDialogOpen(false)}
        propertyPhotos={propertyPhotos}
        onSelect={onSelectBeforePhotos}
      />
    </div>
  );
};

export default RoomDetails;
