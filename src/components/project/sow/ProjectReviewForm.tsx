
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProjectReviewFormProps {
  workAreas: any[];
  laborItems: any[];
  materialItems: any[];
  bidConfiguration: {
    bidDuration: string;
    projectDescription: string;
  };
  onSave: (confirmed: boolean) => void;
}

export function ProjectReviewForm({
  workAreas,
  laborItems,
  materialItems,
  bidConfiguration,
  onSave
}: ProjectReviewFormProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              {workAreas.map((area: any, index: number) => (
                <li key={index} className="text-gray-700">
                  {area.name}
                  {area.additionalAreas && area.additionalAreas.length > 0 && (
                    <ul className="list-circle pl-6 mt-1">
                      {area.additionalAreas.map((subArea: any, subIndex: number) => (
                        <li key={subIndex} className="text-gray-600 text-sm">
                          {subArea.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-4">
              {Object.entries(
                laborItems.reduce((acc: any, item: any) => {
                  if (!acc[item.category]) {
                    acc[item.category] = [];
                  }
                  acc[item.category].push(item);
                  return acc;
                }, {})
              ).map(([category, items]: [string, any]) => (
                <li key={category}>
                  <strong>{category}</strong>
                  <ul className="list-circle pl-6 mt-2">
                    {items.map((item: any, index: number) => (
                      <li key={index} className="text-gray-600">
                        {item.task}
                        {item.rooms && item.rooms.length > 0 && (
                          <ul className="list-none pl-4 mt-1">
                            {item.rooms.map((room: any, roomIndex: number) => (
                              <li key={roomIndex} className="text-sm text-gray-500">
                                {room.name}: {room.notes}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-4">
              {Object.entries(
                materialItems.reduce((acc: any, item: any) => {
                  if (!acc[item.category]) {
                    acc[item.category] = [];
                  }
                  acc[item.category].push(item);
                  return acc;
                }, {})
              ).map(([category, items]: [string, any]) => (
                <li key={category}>
                  <strong>{category}</strong>
                  <ul className="list-circle pl-6 mt-2">
                    {items.map((item: any, index: number) => (
                      <li key={index} className="text-gray-600">
                        {item.type}
                        {item.specifications && Object.keys(item.specifications).length > 0 && (
                          <ul className="list-none pl-4 mt-1">
                            {Object.entries(item.specifications).map(([key, value]: [string, any]) => (
                              <li key={key} className="text-sm text-gray-500">
                                {key}: {value}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bid Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Bid Duration</h4>
              <p className="text-gray-600">{bidConfiguration.bidDuration} days</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Project Overview</h4>
              <p className="text-gray-600">{bidConfiguration.projectDescription}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="flex items-start space-x-2">
        <Checkbox
          id="review-confirm"
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked as boolean)}
        />
        <Label
          htmlFor="review-confirm"
          className="text-sm leading-relaxed"
        >
          I confirm that I have reviewed all the information above and it accurately reflects the scope of work for this project.
        </Label>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => onSave(confirmed)}
          disabled={!confirmed}
        >
          Complete SOW
        </Button>
      </div>
    </div>
  );
}
