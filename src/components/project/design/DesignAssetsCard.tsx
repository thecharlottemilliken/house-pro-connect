
import React from "react";
import { Building2, FileImage, PenTool } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EmptyDesignState from "./EmptyDesignState";
import { Button } from "@/components/ui/button";

interface DesignAssetsCardProps {
  hasRenderings: boolean;
  renderingImages?: string[];
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
}

const DesignAssetsCard = ({
  hasRenderings,
  renderingImages = [],
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
}: DesignAssetsCardProps) => {
  return (
    <Card className="w-full shadow-lg border-gray-200/50">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Renderings Section */}
          <Card className="w-full">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<FileImage className="w-12 h-12 text-gray-400" />}
                customTitle="3D Renderings"
                customDescription="Add 3D visualizations of your design"
                customActionLabel="Add Renderings"
                onAction={onAddRenderings}
              />
            </CardContent>
          </Card>

          {/* Drawings Section */}
          <Card className="w-full">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<PenTool className="w-12 h-12 text-gray-400" />}
                customTitle="Design Drawings"
                customDescription="Add detailed design drawings"
                customActionLabel="Add Drawings"
                onAction={onAddDrawings}
              />
            </CardContent>
          </Card>

          {/* Blueprints Section */}
          <Card className="w-full">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<Building2 className="w-12 h-12 text-gray-400" />}
                customTitle="Blueprints"
                customDescription="Add architectural blueprints"
                customActionLabel="Add Blueprints"
                onAction={onAddBlueprints}
              />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignAssetsCard;
