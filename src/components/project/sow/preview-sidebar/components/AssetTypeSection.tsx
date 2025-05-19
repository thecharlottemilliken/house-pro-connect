
import React from 'react';
import { RoomAssetWithType } from '../hooks/useRoomAssets';

interface AssetTypeSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

export function AssetTypeSection({ title, count, children }: AssetTypeSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-2 px-4">
        {title} ({count})
      </h3>
      
      <div className="space-y-1 px-4">
        {children}
      </div>
    </div>
  );
}
