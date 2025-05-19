
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProjectReviewFormProps {
  workAreas: any[];
  laborItems: any[];
  materialItems: any[];
  bidConfiguration: {
    bidDuration: string;
    projectDescription: string;
  };
  projectId: string;
  onSave: () => void;
  isRevision?: boolean;
  changes?: any;
}

interface ChangeTracked {
  old?: any;
  new?: any;
  status: string;
}

export function ProjectReviewForm({
  workAreas = [],
  laborItems = [],
  materialItems = [],
  bidConfiguration,
  projectId,
  onSave,
  isRevision = false,
  changes = null
}: ProjectReviewFormProps) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = changes && Object.values(changes).some((change: any) => change.status !== "unchanged");

  const getHighlightClass = (field: string, subField?: string) => {
    if (!isRevision || !changes) return "";
    
    const fieldChanges = changes[field];
    if (!fieldChanges) return "";
    
    if (subField) {
      const subFieldChanges = fieldChanges[subField];
      if (!subFieldChanges) return "";
      
      return subFieldChanges.status === "added" ? "bg-green-100" : 
             subFieldChanges.status === "modified" ? "bg-yellow-100" : "";
    }
    
    return fieldChanges.status === "added" ? "bg-green-100" : 
           fieldChanges.status === "modified" ? "bg-yellow-100" : "";
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('statement_of_work')
        .update({ status: 'approved' })
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      toast.success("Statement of Work approved successfully");
      // Redirect back to project
      navigate(`/project-dashboard/${projectId}`);
    } catch (error) {
      console.error("Error approving SOW:", error);
      toast.error("Failed to approve the Statement of Work");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback before requesting revisions");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('statement_of_work')
        .update({ 
          status: 'pending revision',
          feedback: feedback
        })
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      toast.success("Revision requested successfully");
      // Redirect back to project
      navigate(`/project-dashboard/${projectId}`);
    } catch (error) {
      console.error("Error requesting revision:", error);
      toast.error("Failed to request revision");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe rendering helper for specifications
  const renderSpecifications = (specs: any) => {
    if (!specs) return null;
    
    // Handle cabinets specifically since it's a common source of errors
    if (specs.cabinets) {
      let cabinetsData = specs.cabinets;
      
      // If cabinets is an object but not an array, convert it to array
      if (typeof cabinetsData === 'object' && !Array.isArray(cabinetsData)) {
        cabinetsData = [cabinetsData];
      }
      
      if (Array.isArray(cabinetsData)) {
        return (
          <div className="mt-2">
            <h4 className="text-sm font-medium">Cabinet Specifications:</h4>
            {cabinetsData.map((cabinet: any, index: number) => (
              <div key={index} className="ml-4 text-sm">
                <p>Type: {cabinet.type || 'Not specified'}</p>
                <p>Doors: {cabinet.doors || '0'}</p>
                <p>Drawers: {cabinet.drawers || '0'}</p>
                <p>Size: {cabinet.size || 'Not specified'}</p>
              </div>
            ))}
          </div>
        );
      }
      
      return <p className="text-sm text-red-500">Invalid cabinet data format</p>;
    }
    
    // For other specification types
    return (
      <div className="mt-2">
        {Object.entries(specs).map(([key, value]: [string, any]) => {
          // Skip rendering if it's the cabinets property since we handled it above
          if (key === 'cabinets') return null;
          
          // For objects, format as JSON
          if (value && typeof value === 'object') {
            return <p key={key} className="text-sm"><strong>{key}:</strong> {JSON.stringify(value)}</p>;
          }
          
          return <p key={key} className="text-sm"><strong>{key}:</strong> {value?.toString() || 'Not specified'}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className={`rounded-lg border p-6 ${getHighlightClass('bidConfiguration')}`}>
        <h3 className="text-lg font-medium mb-4">Bid Configuration</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Bid Duration</h4>
            <p className="text-sm">{bidConfiguration?.bidDuration || 'Not specified'} days</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Project Description</h4>
            <p className="text-sm">{bidConfiguration?.projectDescription || 'No description provided.'}</p>
          </div>
        </div>
      </div>

      <div className={`rounded-lg border p-6 ${getHighlightClass('workAreas')}`}>
        <h3 className="text-lg font-medium mb-4">Work Areas</h3>
        {workAreas && workAreas.length > 0 ? (
          <div className="space-y-6">
            {workAreas.map((area, index) => (
              <div key={index} className="p-4 border rounded-md">
                <h4 className="font-medium">{area.name}</h4>
                <p className="text-sm text-gray-600 mt-1">Dimensions: {area.width}' × {area.length}' × {area.height}'</p>
                {area.notes && <p className="text-sm mt-2">{area.notes}</p>}
                
                {area.additionalAreas && area.additionalAreas.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium">Additional Areas:</h5>
                    <ul className="ml-4 text-sm">
                      {area.additionalAreas.map((subArea: any, subIndex: number) => (
                        <li key={subIndex} className="mt-2">
                          <span className="font-medium">{subArea.name}</span>
                          <p className="text-gray-600">Dimensions: {subArea.width}' × {subArea.length}' × {subArea.height}'</p>
                          {subArea.notes && <p>{subArea.notes}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No work areas defined.</p>
        )}
      </div>

      <div className={`rounded-lg border p-6 ${getHighlightClass('laborItems')}`}>
        <h3 className="text-lg font-medium mb-4">Labor Requirements</h3>
        {laborItems && laborItems.length > 0 ? (
          <div className="space-y-6">
            {laborItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.category}</h4>
                  <span className="text-sm text-gray-500">{item.laborType}</span>
                </div>
                
                {item.rooms && item.rooms.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium">Affected Areas:</h5>
                    <ul className="ml-4 text-sm">
                      {item.rooms.map((room: any, roomIndex: number) => (
                        <li key={roomIndex} className="mt-2">
                          <span className="font-medium">{room.name}</span>
                          {room.notes && <p>{room.notes}</p>}
                          
                          {room.affectedAreas && room.affectedAreas.length > 0 && (
                            <div className="ml-4 mt-1">
                              <span className="text-xs text-gray-500">Connected areas:</span>
                              <ul className="ml-2">
                                {room.affectedAreas.map((area: any, areaIndex: number) => (
                                  <li key={areaIndex}>
                                    <span>{area.name}</span>
                                    {area.notes && <p className="text-xs text-gray-600">{area.notes}</p>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No labor requirements defined.</p>
        )}
      </div>

      <div className={`rounded-lg border p-6 ${getHighlightClass('materialItems')}`}>
        <h3 className="text-lg font-medium mb-4">Material Requirements</h3>
        {materialItems && materialItems.length > 0 ? (
          <div className="space-y-6">
            {materialItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.category}</h4>
                  <span className="text-sm text-gray-500">{item.materialType}</span>
                </div>
                
                {item.rooms && item.rooms.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium">Affected Areas:</h5>
                    <ul className="ml-4 text-sm">
                      {item.rooms.map((room: any, roomIndex: number) => (
                        <li key={roomIndex} className="mt-2">
                          <span className="font-medium">{room.name}</span>
                          {room.notes && <p>{room.notes}</p>}
                          
                          {/* Safely render specifications */}
                          {room.specifications && renderSpecifications(room.specifications)}
                          
                          {room.affectedAreas && room.affectedAreas.length > 0 && (
                            <div className="ml-4 mt-1">
                              <span className="text-xs text-gray-500">Connected areas:</span>
                              <ul className="ml-2">
                                {room.affectedAreas.map((area: any, areaIndex: number) => (
                                  <li key={areaIndex}>
                                    <span>{area.name}</span>
                                    {area.notes && <p className="text-xs text-gray-600">{area.notes}</p>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No material requirements defined.</p>
        )}
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Review Options</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium mb-2">
              {isRevision ? "Additional Feedback" : "Feedback"}
              {isRevision && hasChanges && (
                <span className="text-green-600 ml-2 text-xs">
                  (Previous feedback has been addressed)
                </span>
              )}
            </label>
            <textarea
              id="feedback"
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Provide feedback or change requests..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleRequestRevision}
              disabled={isSubmitting}
            >
              Request Revision
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
