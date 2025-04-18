
import React from "react";
import { Building2, Image, Pen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EmptyDesignState from "./EmptyDesignState";

interface DesignAssetsCardProps {
  hasRenderings: boolean;
  renderingImages?: string[];
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  propertyBlueprint?: string | null;
}

const DesignAssetsCard = ({
  hasRenderings,
  renderingImages = [],
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  propertyBlueprint
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
                customIcon={<Image className="w-8 h-8 text-gray-400" />}
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
                customIcon={<Pen className="w-8 h-8 text-gray-400" />}
                customTitle="Design Drawings"
                customDescription="Add design drawings"
                customActionLabel="Add Drawings"
                onAction={onAddDrawings}
              />
            </CardContent>
          </Card>

          {propertyBlueprint ? (
            <Card className="overflow-hidden">
              <img 
                src={propertyBlueprint} 
                alt="Property Blueprint"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-1">Property Blueprint</h4>
                <p className="text-sm text-gray-500">Original property blueprint</p>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignAssetsCard;
