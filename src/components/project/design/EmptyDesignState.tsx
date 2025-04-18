
import React, { ReactNode } from "react";
import { FileText, Image as ImageIcon, PenBox, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyDesignStateProps {
  type: "no-designs" | "designer" | "design-assets" | "renderings" | "inspiration";
  onAction?: () => void;
  customIcon?: ReactNode;
  customTitle?: string;
  customDescription?: string;
  customActionLabel?: string;
}

const EmptyDesignState = ({ 
  type, 
  onAction,
  customIcon,
  customTitle,
  customDescription,
  customActionLabel 
}: EmptyDesignStateProps) => {
  const getContent = () => {
    switch (type) {
      case "no-designs":
        return {
          icon: <PenBox className="w-12 h-12 text-gray-400" />,
          title: "No Design Plans Yet",
          description: "Start by adding your design plans or connecting with a designer.",
          actionLabel: "Add Design Plans"
        };
      case "designer":
        return {
          icon: <PenBox className="w-12 h-12 text-gray-400" />,
          title: "No Designer Assigned",
          description: "Add a designer to help bring your vision to life.",
          actionLabel: "Add Designer"
        };
      case "design-assets":
        return {
          icon: <FileText className="w-12 h-12 text-gray-400" />,
          title: "No Design Assets",
          description: "Upload your design plans, blueprints, or specifications.",
          actionLabel: "Upload Assets"
        };
      case "renderings":
        return {
          icon: <ImageIcon className="w-12 h-12 text-gray-400" />,
          title: "No Renderings",
          description: "Add 3D renderings or visualizations of your design.",
          actionLabel: "Add Renderings"
        };
      case "inspiration":
        return {
          icon: <Lightbulb className="w-12 h-12 text-gray-400" />,
          title: "No Inspiration Added",
          description: "Add photos that inspire your design vision.",
          actionLabel: "Add Inspiration"
        };
    }
  };

  const content = getContent();

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center">
          {customIcon || content?.icon}
          <h3 className="text-lg font-semibold mt-4 mb-2">{customTitle || content?.title}</h3>
          <p className="text-gray-600 mb-4">{customDescription || content?.description}</p>
          <Button 
            variant="outline" 
            className="bg-gray-200 border-gray-300"
            onClick={onAction}
          >
            {customActionLabel || content?.actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyDesignState;
