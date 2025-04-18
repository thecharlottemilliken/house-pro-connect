
import React from "react";
import { Building2, FileImage, PenTool } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EmptyDesignState from "./EmptyDesignState";

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
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Design Assets</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<FileImage className="w-8 h-8 text-gray-400" />}
                customTitle="3D Renderings"
                customDescription="Add design visualizations"
                customActionLabel="Add Renderings"
                onAction={onAddRenderings}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<PenTool className="w-8 h-8 text-gray-400" />}
                customTitle="Design Drawings"
                customDescription="Add design drawings"
                customActionLabel="Add Drawings"
                onAction={onAddDrawings}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<Building2 className="w-8 h-8 text-gray-400" />}
                customTitle="Blueprints"
                customDescription="Add blueprints"
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
