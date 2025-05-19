
// Define common revision-related props for SOW form components
export interface RevisionAwareProps {
  isRevision?: boolean;
}

export interface WorkAreaRevisionProps extends RevisionAwareProps {
  changedWorkAreas?: { [key: string]: boolean };
}

export interface LaborItemRevisionProps extends RevisionAwareProps {
  changedLaborItems?: { [key: string]: boolean };
}

export interface MaterialItemRevisionProps extends RevisionAwareProps {
  changedMaterialItems?: { [key: string]: boolean };
}

export interface BidConfigRevisionProps extends RevisionAwareProps {
  hasChanges?: boolean;
}
