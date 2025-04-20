
export interface WorkArea {
  name: string;
  notes: string;
  measurements: {
    length: string;
    width: string;
    height: string;
    totalSqft: string;
  };
}

export interface LaborItem {
  category: string;
  name: string;
  affectedAreas: {
    room: string;
    notes: string;
    sqft: string;
  }[];
}

export interface LaborCategory {
  name: string;
  items: string[];
}
