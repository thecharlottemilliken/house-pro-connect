
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Clock } from "lucide-react";

interface ProjectReviewFormProps {
  workAreas: any[];
  laborItems: any[];
  materialItems: any[];
  bidConfiguration: {
    bidDuration: string;
    projectDescription: string;
  };
  projectId: string;
  onSave: (confirmed?: boolean) => void;
  isRevision?: boolean;
  changes?: any;
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

  // Check if there are any changes to highlight for revisions
  const hasChanges = changes && 
    (Object.values(changes.workAreas || {}).some((change: any) => change.status !== "unchanged") ||
     Object.values(changes.laborItems || {}).some((change: any) => change.status !== "unchanged") ||
     Object.values(changes.materialItems || {}).some((change: any) => change.status !== "unchanged") ||
     changes.bidConfiguration?.status === "modified");

  const getHighlightClass = (itemType: string, id: string | number, field?: string): string => {
    if (!isRevision || !changes) return "";
    
    let changeMap;
    switch (itemType) {
      case 'workAreas':
        changeMap = changes.workAreas;
        break;
      case 'laborItems':
        changeMap = changes.laborItems;
        break;
      case 'materialItems':
        changeMap = changes.materialItems;
        break;
      case 'bidConfiguration':
        if (!field) {
          return changes.bidConfiguration?.status === "modified" ? "bg-yellow-50 border-yellow-200" : "";
        } else if (changes.bidConfiguration?.fields && changes.bidConfiguration.fields[field]) {
          return changes.bidConfiguration.fields[field].status === "added" ? "bg-green-50 border-green-200" : 
                 changes.bidConfiguration.fields[field].status === "modified" ? "bg-yellow-50 border-yellow-200" : "";
        }
        return "";
      default:
        return "";
    }
    
    if (!changeMap) return "";
    
    const change = changeMap[id];
    if (!change) return "";
    
    return change.status === "added" ? "bg-green-50 border-green-200" : 
           change.status === "modified" ? "bg-yellow-50 border-yellow-200" : "";
  };
  
  // For highlighting nested fields if specific field data is available
  const getFieldHighlight = (itemType: string, id: string | number, field: string): string => {
    if (!isRevision || !changes) return "";
    
    let changeMap;
    switch (itemType) {
      case 'workAreas':
        changeMap = changes.workAreas;
        break;
      case 'laborItems':
        changeMap = changes.laborItems;
        break;
      case 'materialItems':
        changeMap = changes.materialItems;
        break;
      default:
        return "";
    }
    
    if (!changeMap || !changeMap[id] || !changeMap[id].details) return "";
    
    if (changeMap[id].details[field]) {
      return changeMap[id].details[field].status === "added" ? "bg-green-50" : 
             changeMap[id].details[field].status === "modified" ? "bg-yellow-50" : "";
    }
    
    return "";
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
                {typeof cabinet === 'object' ? (
                  <>
                    <p>Type: {cabinet.type || 'Not specified'}</p>
                    <p>Doors: {cabinet.doors || '0'}</p>
                    <p>Drawers: {cabinet.drawers || '0'}</p>
                    <p>Size: {cabinet.size || 'Not specified'}</p>
                  </>
                ) : (
                  <p>{typeof cabinet === 'string' ? cabinet : 'Invalid cabinet data'}</p>
                )}
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
      {isRevision && hasChanges && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Revision Overview</h3>
              <p className="text-blue-700 text-sm mt-1">
                This is a revised Statement of Work. Areas that have been changed are highlighted in 
                <span className="mx-1 px-1.5 py-0.5 bg-green-50 border border-green-200 rounded text-green-800">green</span> (new) or 
                <span className="mx-1 px-1.5 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">yellow</span> (modified).
              </p>
              
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">
                  <Clock className="h-3 w-3 mr-1" /> Last updated: {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`rounded-lg border p-6 ${getHighlightClass('bidConfiguration', 'main')}`}>
        <h3 className="text-lg font-medium mb-4">Bid Configuration</h3>
        <div className="space-y-4">
          <div className={`p-3 rounded ${getHighlightClass('bidConfiguration', 'main', 'bidDuration')}`}>
            <h4 className="text-sm font-medium">Bid Duration</h4>
            <p className="text-sm">{bidConfiguration?.bidDuration || 'Not specified'} days</p>
          </div>
          <div className={`p-3 rounded ${getHighlightClass('bidConfiguration', 'main', 'projectDescription')}`}>
            <h4 className="text-sm font-medium">Project Description</h4>
            <p className="text-sm">{bidConfiguration?.projectDescription || 'No description provided.'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Work Areas</h3>
        {workAreas && workAreas.length > 0 ? (
          <div className="space-y-6">
            {workAreas.map((area, index) => (
              <div key={index} className={`p-4 border rounded-md ${getHighlightClass('workAreas', area.id || index)}`}>
                <h4 className={`font-medium ${getFieldHighlight('workAreas', area.id || index, 'name')}`}>{area.name}</h4>
                <p className={`text-sm text-gray-600 mt-1 ${getFieldHighlight('workAreas', area.id || index, 'dimensions')}`}>
                  Dimensions: {area.width}' × {area.length}' × {area.height}'
                </p>
                {area.notes && <p className={`text-sm mt-2 ${getFieldHighlight('workAreas', area.id || index, 'notes')}`}>{area.notes}</p>}
                
                {area.additionalAreas && area.additionalAreas.length > 0 && (
                  <div className={`mt-4 ${getFieldHighlight('workAreas', area.id || index, 'additionalAreas')}`}>
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

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Labor Requirements</h3>
        {laborItems && laborItems.length > 0 ? (
          <div className="space-y-6">
            {laborItems.map((item, index) => (
              <div key={index} className={`p-4 border rounded-md ${getHighlightClass('laborItems', item.id || index)}`}>
                <div className="flex justify-between">
                  <h4 className={`font-medium ${getFieldHighlight('laborItems', item.id || index, 'category')}`}>{item.category}</h4>
                  <span className={`text-sm text-gray-500 ${getFieldHighlight('laborItems', item.id || index, 'laborType')}`}>{item.laborType}</span>
                </div>
                
                {item.rooms && item.rooms.length > 0 && (
                  <div className={`mt-4 ${getFieldHighlight('laborItems', item.id || index, 'rooms')}`}>
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

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Material Requirements</h3>
        {materialItems && materialItems.length > 0 ? (
          <div className="space-y-6">
            {materialItems.map((item, index) => (
              <div key={index} className={`p-4 border rounded-md ${getHighlightClass('materialItems', item.id || index)}`}>
                <div className="flex justify-between">
                  <h4 className={`font-medium ${getFieldHighlight('materialItems', item.id || index, 'category')}`}>{item.category}</h4>
                  <span className={`text-sm text-gray-500 ${getFieldHighlight('materialItems', item.id || index, 'materialType')}`}>{item.materialType}</span>
                </div>
                
                {item.rooms && item.rooms.length > 0 && (
                  <div className={`mt-4 ${getFieldHighlight('materialItems', item.id || index, 'rooms')}`}>
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
