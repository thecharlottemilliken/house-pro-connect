
import React from 'react';

interface WorkArea {
  name: string;
  notes: string;
  measurements: {
    length: string;
    width: string;
    height: string;
    totalSqft: string;
  };
  affectsOtherAreas: boolean;
  additionalAreas: Array<{
    name: string;
    notes: string;
  }>;
}

interface WorkAreaTableRowProps {
  area: WorkArea;
  actions: React.ReactNode;
  isHighlighted?: boolean;
}

export function WorkAreaTableRow({ area, actions, isHighlighted = false }: WorkAreaTableRowProps) {
  const highlightClass = isHighlighted ? 'bg-yellow-50' : '';
  
  return (
    <tr className={`border-t ${highlightClass}`}>
      <td className="px-4 py-3">{area.name}</td>
      <td className="px-4 py-3">
        <div className="text-xs">
          <span className="font-medium">L:</span> {area.measurements?.length || '-'}
          {' | '}
          <span className="font-medium">W:</span> {area.measurements?.width || '-'}
          {' | '}
          <span className="font-medium">H:</span> {area.measurements?.height || '-'}
        </div>
        <div className="text-xs mt-1">
          <span className="font-medium">SqFt:</span> {area.measurements?.totalSqft || '-'}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm line-clamp-2">{area.notes || '-'}</div>
      </td>
      <td className="px-4 py-3">
        {area.affectsOtherAreas && (
          <div className="text-sm">
            <p className="font-medium text-xs mb-1">Affected Areas:</p>
            <ul className="text-xs list-disc pl-4">
              {area.additionalAreas.map((additionalArea, i) => (
                <li key={i}>{additionalArea.name}</li>
              ))}
            </ul>
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-right">{actions}</td>
    </tr>
  );
}
