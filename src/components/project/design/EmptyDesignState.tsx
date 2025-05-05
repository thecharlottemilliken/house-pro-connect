
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Phone, Mail, User } from "lucide-react";
import { DesignPreferences } from '@/hooks/useProjectData';

interface EmptyDesignStateProps {
  type: 'no-designs' | 'designer' | 'renderings' | 'drawings' | 'blueprints' | 'inspiration';
  onAction?: () => void;
  designers?: Array<{ id: string; businessName: string; contactName?: string; email?: string; phone?: string; speciality?: string; }>;
}

const EmptyDesignState: React.FC<EmptyDesignStateProps> = ({ 
  type, 
  onAction,
  designers = []
}) => {
  const getTitle = () => {
    switch (type) {
      case 'no-designs':
        return 'No Design Plans Yet';
      case 'designer':
        return designers && designers.length > 0 
          ? 'Designer Information' 
          : 'No Designer Yet';
      case 'renderings':
        return 'No Renderings Yet';
      case 'drawings':
        return 'No Drawings Yet';
      case 'blueprints':
        return 'No Blueprints Yet';
      case 'inspiration':
        return 'No Inspiration Yet';
      default:
        return 'No Data Yet';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'no-designs':
        return 'There are no design plans yet for this area.';
      case 'designer':
        return designers && designers.length > 0
          ? 'Here are the details of your assigned designers.'
          : 'No designer has been assigned to this area yet.';
      case 'renderings':
        return 'There are no 3D renderings available yet.';
      case 'drawings':
        return 'There are no architectural drawings available yet.';
      case 'blueprints':
        return 'There are no blueprints available yet.';
      case 'inspiration':
        return 'No inspiration images have been added yet.';
      default:
        return 'No data available yet.';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'no-designs':
        return 'Add Design Plans';
      case 'designer':
        return 'Add Designer';
      case 'renderings':
        return 'Add Renderings';
      case 'drawings':
        return 'Add Drawings';
      case 'blueprints':
        return 'Add Blueprints';
      case 'inspiration':
        return 'Add Inspiration';
      default:
        return 'Add Data';
    }
  };

  if (type === 'designer' && designers && designers.length > 0) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">{getTitle()}</h3>
        <div className="space-y-4">
          {designers.map((designer, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {designer.businessName.charAt(0)}
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">{designer.businessName}</h4>
                  {designer.speciality && <p className="text-sm text-blue-600 font-medium">{designer.speciality}</p>}
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                {designer.contactName && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{designer.contactName}</span>
                  </div>
                )}
                {designer.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`mailto:${designer.email}`} className="text-blue-600 hover:underline">
                      {designer.email}
                    </a>
                  </div>
                )}
                {designer.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`tel:${designer.phone}`} className="text-blue-600 hover:underline">
                      {designer.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 rounded-lg text-center flex flex-col items-center space-y-3">
      <div className="bg-white p-4 rounded-full shadow-sm">
        <PlusCircle className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="font-semibold text-lg">{getTitle()}</h3>
      <p className="text-gray-500 max-w-md">{getDescription()}</p>
      {onAction && (
        <Button 
          onClick={onAction}
          variant="ghost" 
          className="mt-4 border border-gray-200"
        >
          {getButtonText()}
        </Button>
      )}
    </div>
  );
};

export default EmptyDesignState;
