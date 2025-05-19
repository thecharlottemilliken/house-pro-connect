import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ClipboardEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChangeTracker } from './utils/revisionUtils';

// Update the interface to include the new props
interface ProjectReviewFormProps {
  workAreas: any[];
  laborItems: any[];
  materialItems: any[];
  bidConfiguration: {
    bidDuration: string;
    projectDescription: string;
  };
  projectId: string;
  isRevision?: boolean;
  isRevised?: boolean;
  onSave: (confirmed: boolean) => void;
  changes?: ChangeTracker;
}

export const ProjectReviewForm = ({
  workAreas,
  laborItems,
  materialItems,
  bidConfiguration,
  projectId,
  isRevision = false,
  isRevised = false,
  onSave,
  changes
}: ProjectReviewFormProps) => {
  const handleSubmit = async () => {
    onSave(true);
  };

  const handleCancel = () => {
    onSave(false);
  };

  // Helper to check if an item was changed
  const wasChanged = (id: string, itemType: 'workAreas' | 'laborItems' | 'materialItems'): boolean => {
    if (!changes) return false;
    return !!changes[itemType]?.[id];
  };

  // Render each section with change highlighting
  const renderWorkAreas = () => {
    return workAreas.map((area, index) => {
      const id = area.id || `index-${index}`;
      const isChanged = wasChanged(id, 'workAreas');
      const highlightClass = isChanged ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-3 -ml-3' : '';
      
      return (
        <div key={id} className={`mb-6 ${highlightClass}`}>
          {/* Add a change badge if this item was changed */}
          {isChanged && (
            <Badge className="mb-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex w-fit items-center gap-1">
              <ClipboardEdit className="h-3 w-3" /> Updated
            </Badge>
          )}
          
          <h3 className="text-lg font-semibold mb-2">{area.name}</h3>
          <p className="text-gray-600 mb-3">{area.description || 'No description provided'}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Location</h4>
              <p className="text-gray-700">{area.location || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Dimensions</h4>
              <p className="text-gray-700">{area.dimensions || 'Not specified'}</p>
            </div>
          </div>
          
          {area.notes && (
            <div className="mt-2">
              <h4 className="font-medium text-sm mb-1">Notes</h4>
              <p className="text-gray-700">{area.notes}</p>
            </div>
          )}
        </div>
      );
    });
  };

  const renderLaborItems = () => {
    return laborItems.map((item, index) => {
      const id = item.id || `index-${index}`;
      const isChanged = wasChanged(id, 'laborItems');
      const highlightClass = isChanged ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-3 -ml-3' : '';
      
      return (
        <div key={id} className={`mb-4 ${highlightClass}`}>
          {isChanged && (
            <Badge className="mb-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex w-fit items-center gap-1">
              <ClipboardEdit className="h-3 w-3" /> Updated
            </Badge>
          )}
          
          <h4 className="font-medium">{item.title}</h4>
          <p className="text-sm text-gray-600">{item.description}</p>
          
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500">Work Area:</span>
              <p className="text-sm">{item.workArea || 'All areas'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Expertise Required:</span>
              <p className="text-sm">{item.expertise || 'General'}</p>
            </div>
          </div>
          
          {item.notes && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Notes:</span>
              <p className="text-sm">{item.notes}</p>
            </div>
          )}
        </div>
      );
    });
  };

  const renderMaterialItems = () => {
    return materialItems.map((item, index) => {
      const id = item.id || `index-${index}`;
      const isChanged = wasChanged(id, 'materialItems');
      const highlightClass = isChanged ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-3 -ml-3' : '';
      
      return (
        <div key={id} className={`mb-4 ${highlightClass}`}>
          {isChanged && (
            <Badge className="mb-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex w-fit items-center gap-1">
              <ClipboardEdit className="h-3 w-3" /> Updated
            </Badge>
          )}
          
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-gray-600">{item.description}</p>
          
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500">Work Area:</span>
              <p className="text-sm">{item.workArea || 'All areas'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Quantity:</span>
              <p className="text-sm">{item.quantity || 'Not specified'}</p>
            </div>
          </div>
          
          {item.specifications && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Specifications:</span>
              <p className="text-sm">{item.specifications}</p>
            </div>
          )}
          
          {item.notes && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Notes:</span>
              <p className="text-sm">{item.notes}</p>
            </div>
          )}
        </div>
      );
    });
  };

  const renderBidConfiguration = () => {
    const isChanged = changes?.bidConfiguration;
    const highlightClass = isChanged ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-3 -ml-3' : '';
    
    return (
      <div className={`mb-6 ${highlightClass}`}>
        {isChanged && (
          <Badge className="mb-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex w-fit items-center gap-1">
            <ClipboardEdit className="h-3 w-3" /> Updated
          </Badge>
        )}
        
        <h3 className="text-lg font-semibold mb-2">Bid Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Bid Duration</h4>
            <p className="text-gray-700">{bidConfiguration.bidDuration} days</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-1">Project Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{bidConfiguration.projectDescription || 'No description provided'}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {(isRevision || isRevised) && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <ClipboardEdit className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Revised Document</AlertTitle>
          <AlertDescription className="text-blue-700">
            This is a revised version of the Statement of Work. Changes based on feedback are highlighted.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Work Areas</h2>
          {workAreas.length > 0 ? (
            <div>{renderWorkAreas()}</div>
          ) : (
            <p className="text-gray-500">No work areas defined.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Labor Requirements</h2>
          {laborItems.length > 0 ? (
            <div>{renderLaborItems()}</div>
          ) : (
            <p className="text-gray-500">No labor requirements defined.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Material Requirements</h2>
          {materialItems.length > 0 ? (
            <div>{renderMaterialItems()}</div>
          ) : (
            <p className="text-gray-500">No material requirements defined.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Bid Configuration</h2>
          {renderBidConfiguration()}
        </div>
      </div>

      {onSave && (
        <div className="mt-8 flex justify-end">
          <Button
            variant="outline"
            className="mr-4"
            onClick={() => onSave(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(true)}
          >
            {isRevision ? "Submit Revised SOW" : "Submit SOW for Review"}
          </Button>
        </div>
      )}
    </div>
  );
};
