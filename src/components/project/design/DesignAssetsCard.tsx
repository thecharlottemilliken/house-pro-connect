
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CategorySection from "./CategorySection";

interface DesignAssetsCardProps {
  hasRenderings: boolean;
  renderingImages?: string[];
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  propertyBlueprint?: string | null;
  propertyId?: string;
}

const DesignAssetsCard = ({
  hasRenderings,
  renderingImages = [],
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  propertyBlueprint,
  propertyId
}: DesignAssetsCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [isCheckingPdf, setIsCheckingPdf] = useState(false);
  const [blueprintFile, setBlueprintFile] = useState<{name: string; size: string; type: 'pdf' | 'xls' | 'jpg' | 'png'; url?: string} | null>(
    propertyBlueprint ? { name: "Blueprint.pdf", size: "1.2MB", type: 'pdf', url: propertyBlueprint } : null
  );
  const [renderingFiles, setRenderingFiles] = useState<{name: string; size: string; type: 'jpg' | 'png' | 'pdf'; url?: string}[]>(
    renderingImages.map((url, index) => ({
      name: `Rendering_${index + 1}.jpg`,
      size: "1.5MB",
      type: 'jpg',
      url
    }))
  );
  
  const [drawingFiles, setDrawingFiles] = useState<{name: string; size: string; type: 'jpg' | 'png' | 'pdf'; url?: string}[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Effect to load drawings when component mounts
  useEffect(() => {
    if (propertyId) {
      fetchExistingDrawings();
      fetchRoomId();
    }
  }, [propertyId]);

  // Function to fetch room ID for the current property
  const fetchRoomId = async () => {
    if (!propertyId) return;
    
    try {
      const { data: rooms, error } = await supabase
        .from('property_rooms')
        .select('id')
        .eq('property_id', propertyId);
        
      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }
      
      if (rooms && rooms.length > 0) {
        // We'll use the first room for now
        setRoomId(rooms[0].id);
        console.log('Room ID set to:', rooms[0].id);
      }
    } catch (error) {
      console.error('Error in fetchRoomId:', error);
    }
  };

  // Function to fetch existing drawings from the database
  const fetchExistingDrawings = async () => {
    if (!propertyId) return;
    
    try {
      const { data: rooms, error: roomsError } = await supabase
        .from('property_rooms')
        .select('id')
        .eq('property_id', propertyId);
        
      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        return;
      }
      
      if (!rooms || rooms.length === 0) {
        console.log('No rooms found for property');
        return;
      }
      
      // For simplicity, we'll use the first room
      const roomId = rooms[0].id;
      console.log('Using room ID for fetching drawings:', roomId);
        
      const { data: preferences, error } = await supabase
        .from('room_design_preferences')
        .select('drawings')
        .eq('room_id', roomId)
        .maybeSingle();
          
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching drawings:', error);
        return;
      }
      
      if (preferences?.drawings && preferences.drawings.length > 0) {
        const files = preferences.drawings.map((url: string, index: number) => {
          const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
          return {
            name: `Drawing_${index + 1}.${fileType}`,
            size: "1.2MB",
            type: fileType as 'jpg' | 'png' | 'pdf',
            url: url
          };
        });
        
        setDrawingFiles(files);
      }
    } catch (error) {
      console.error('Error in fetchExistingDrawings:', error);
    }
  };

  const verifyBlueprintUrl = async () => {
    if (!propertyBlueprint) {
      setPdfStatus('invalid');
      return false;
    }
    
    try {
      setIsCheckingPdf(true);
      console.log("Verifying blueprint URL:", propertyBlueprint);
      
      const response = await fetch(propertyBlueprint, { method: 'HEAD' });
      const isValid = response.ok && response.headers.get('content-type')?.includes('pdf');
      
      console.log("PDF verification result:", { 
        status: response.status, 
        contentType: response.headers.get('content-type'),
        isValid 
      });
      
      setPdfStatus(isValid ? 'valid' : 'invalid');
      return isValid;
    } catch (error) {
      console.error("Error verifying blueprint URL:", error);
      setPdfStatus('invalid');
      return false;
    } finally {
      setIsCheckingPdf(false);
    }
  };
  
  const handleUploadBlueprint = async (urls: string[]) => {
    if (!urls.length || !propertyId) return;

    try {
      setIsUploading(true);
      const { error } = await supabase
        .from('properties')
        .update({ blueprint_url: urls[0] })
        .eq('id', propertyId);

      if (error) throw error;
      
      setBlueprintFile({ name: "Blueprint.pdf", size: "1.2MB", type: 'pdf', url: urls[0] });

      toast({
        title: "Blueprint Added",
        description: "Your blueprint has been successfully uploaded."
      });
    } catch (error) {
      console.error('Error uploading blueprint:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading the blueprint.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBlueprint = async () => {
    if (!propertyId) return;

    try {
      if (propertyBlueprint) {
        const filename = propertyBlueprint.split('/').pop();
        if (filename) {
          await supabase.storage
            .from('property-blueprints')
            .remove([filename]);
        }
      }

      const { error } = await supabase
        .from('properties')
        .update({ blueprint_url: null })
        .eq('id', propertyId);

      if (error) throw error;
      
      setBlueprintFile(null);

      toast({
        title: "Blueprint Removed",
        description: "The blueprint has been successfully removed."
      });
    } catch (error) {
      console.error('Error removing blueprint:', error);
      toast({
        title: "Remove Failed",
        description: "There was a problem removing the blueprint.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadBlueprint = () => {
    if (propertyBlueprint) {
      const link = document.createElement('a');
      link.href = propertyBlueprint;
      link.download = "property-blueprint.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddRenderings = async (urls: string[]) => {
    console.log("Adding rendering URLs:", urls);
    if (!propertyId || urls.length === 0) {
      console.log("Missing propertyId or URLs");
      return;
    }
    
    // Make sure we have a room ID
    if (!roomId) {
      await fetchRoomId();
      if (!roomId) {
        toast({
          title: "Error",
          description: "Could not identify a room for this property.",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      // Get existing room design preferences
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('renderings')
        .eq('room_id', roomId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', fetchError);
        throw fetchError;
      }
      
      // Combine existing and new renderings
      const existingRenderings = existingPrefs?.renderings || [];
      const updatedRenderings = [...existingRenderings, ...urls];
      
      console.log("Existing renderings:", existingRenderings);
      console.log("Updated renderings:", updatedRenderings);
      
      // Check if record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('room_design_preferences')
        .select('id')
        .eq('room_id', roomId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking room design preferences:', checkError);
        throw checkError;
      }
      
      let updateError;
      
      if (existingRecord) {
        console.log("Updating existing record");
        // Update existing record
        const { error } = await supabase
          .from('room_design_preferences')
          .update({ 
            renderings: updatedRenderings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
        
        updateError = error;
      } else {
        console.log("Creating new record");
        // Create new record
        const { error } = await supabase
          .from('room_design_preferences')
          .insert({ 
            room_id: roomId,
            renderings: updatedRenderings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        updateError = error;
      }
      
      if (updateError) {
        console.error('Error saving renderings:', updateError);
        throw updateError;
      }
      
      // Update local state with renderings
      const newRenderings = urls.map((url, index) => {
        const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
        return {
          name: `Rendering_${renderingFiles.length + index + 1}.${fileType}`,
          size: "1.5MB",
          type: fileType as 'jpg' | 'png' | 'pdf',
          url: url
        };
      });
      
      setRenderingFiles(prev => [...prev, ...newRenderings]);
      
      toast({
        title: "Success",
        description: "Renderings have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving renderings:', error);
      toast({
        title: "Error",
        description: "Failed to save renderings. Please try again.",
        variant: "destructive"
      });
    }
    
    if (onAddRenderings) onAddRenderings();
  };

  const handleRemoveRenderings = async () => {
    try {
      if (renderingFiles.length === 0 || !propertyId || !roomId) {
        return;
      }
      
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('renderings')
        .eq('room_id', roomId)
        .maybeSingle();
          
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const existingRenderings = existingPrefs?.renderings || [];
      if (existingRenderings.length > 0) {
        const updatedRenderings = existingRenderings.slice(0, -1);
        
        const { error: updateError } = await supabase
          .from('room_design_preferences')
          .update({ 
            renderings: updatedRenderings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
          
        if (updateError) throw updateError;
      }
      
      setRenderingFiles(prev => prev.slice(0, -1));
      
      toast({
        title: "Success",
        description: "Rendering removed successfully."
      });
    } catch (error) {
      console.error('Error removing rendering:', error);
      toast({
        title: "Error",
        description: "Failed to remove rendering. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddDrawings = async (urls: string[]) => {
    console.log("Adding drawing URLs:", urls);
    if (!propertyId || urls.length === 0) {
      console.log("Missing propertyId or URLs");
      return;
    }
    
    // Make sure we have a room ID
    if (!roomId) {
      await fetchRoomId();
      if (!roomId) {
        toast({
          title: "Error",
          description: "Could not identify a room for this property.",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      console.log("Using room ID for drawings:", roomId);
      
      // Get existing room design preferences
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('drawings')
        .eq('room_id', roomId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', fetchError);
        throw fetchError;
      }
      
      // Combine existing and new drawings
      const existingDrawings = existingPrefs?.drawings || [];
      const updatedDrawings = [...existingDrawings, ...urls];
      
      console.log("Existing drawings:", existingDrawings);
      console.log("Updated drawings:", updatedDrawings);
      
      // Check if record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('room_design_preferences')
        .select('id')
        .eq('room_id', roomId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking room design preferences:', checkError);
        throw checkError;
      }
      
      let updateError;
      
      if (existingRecord) {
        console.log("Updating existing record for drawings");
        // Update existing record
        const { error } = await supabase
          .from('room_design_preferences')
          .update({ 
            drawings: updatedDrawings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
        
        updateError = error;
      } else {
        console.log("Creating new record for drawings");
        // Create new record
        const { error } = await supabase
          .from('room_design_preferences')
          .insert({ 
            room_id: roomId,
            drawings: updatedDrawings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        updateError = error;
      }
      
      if (updateError) {
        console.error('Error saving drawings:', updateError);
        throw updateError;
      }
      
      // Update local state
      const newDrawings = urls.map((url, index) => {
        const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
        return {
          name: `Drawing_${drawingFiles.length + index + 1}.${fileType}`,
          size: "1.2MB",
          type: fileType as 'jpg' | 'png' | 'pdf',
          url: url
        };
      });
      
      setDrawingFiles(prev => [...prev, ...newDrawings]);
      
      toast({
        title: "Success",
        description: "Drawings have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving drawings:', error);
      toast({
        title: "Error",
        description: "Failed to save drawings. Please try again.",
        variant: "destructive"
      });
    }
    
    if (onAddDrawings) onAddDrawings();
  };

  const handleRemoveDrawings = async () => {
    try {
      if (drawingFiles.length === 0 || !propertyId || !roomId) {
        return;
      }
      
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('drawings')
        .eq('room_id', roomId)
        .maybeSingle();
          
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const existingDrawings = existingPrefs?.drawings || [];
      if (existingDrawings.length > 0) {
        const updatedDrawings = existingDrawings.slice(0, -1);
        
        const { error: updateError } = await supabase
          .from('room_design_preferences')
          .update({ 
            drawings: updatedDrawings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
          
        if (updateError) throw updateError;
      }
      
      setDrawingFiles(prev => prev.slice(0, -1));
      
      toast({
        title: "Success",
        description: "Drawing removed successfully."
      });
    } catch (error) {
      console.error('Error removing drawing:', error);
      toast({
        title: "Error",
        description: "Failed to remove drawing. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <CategorySection
          title="Blueprints"
          files={blueprintFile ? [blueprintFile] : []}
          onUpload={handleUploadBlueprint}
          onDelete={handleRemoveBlueprint}
        />

        <CategorySection
          title="Renderings"
          files={renderingFiles}
          onUpload={handleAddRenderings}
          onDelete={handleRemoveRenderings}
        />

        <CategorySection
          title="Drawings"
          files={drawingFiles}
          onUpload={handleAddDrawings}
          onDelete={handleRemoveDrawings}
        />
      </CardContent>
    </Card>
  );
};

export default DesignAssetsCard;
