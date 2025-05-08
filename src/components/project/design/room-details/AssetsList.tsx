
import React from 'react';
import AssetItem from './AssetItem';

interface AssetsListProps {
  designAssets: Array<{ name: string; url: string; tags?: string[]; }>;
  onViewAsset: (asset: { name: string; url: string; type: string }) => void;
  onManageTags: (index: number) => void;
  onRemoveAsset: (index: number) => void;
}

const AssetsList: React.FC<AssetsListProps> = ({
  designAssets,
  onViewAsset,
  onManageTags,
  onRemoveAsset
}) => {
  if (!designAssets || designAssets.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-gray-500 text-sm">No design assets added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {designAssets.map((asset, idx) => (
        <AssetItem
          key={idx}
          asset={asset}
          index={idx}
          onViewAsset={onViewAsset}
          onManageTags={() => onManageTags(idx)}
          onRemoveAsset={() => onRemoveAsset(idx)}
        />
      ))}
    </div>
  );
};

export default AssetsList;
