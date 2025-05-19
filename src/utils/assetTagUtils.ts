/**
 * Asset tag utilities for the unified asset management system
 */

export type TagCategory = 'type' | 'room' | 'style' | 'material' | 'custom';

export interface TagDefinition {
  id: string;        // Unique tag identifier (e.g., "type:design")
  label: string;     // Display label (e.g., "Design")
  category: TagCategory;  // Category for grouping tags
  color?: string;    // Optional color for display
  icon?: string;     // Optional icon name
  description?: string; // Optional description
}

export interface TagsMetadata {
  version: number;   // For future migrations
  categories: Record<string, {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }>;
  tags: Record<string, TagDefinition>;
}

// Default tag metadata with predefined categories and common tags
export const defaultTagsMetadata: TagsMetadata = {
  version: 1,
  categories: {
    type: {
      name: "Asset Type",
      description: "Categorizes the type of document or image",
      color: "#0ea5e9", // Sky blue
      icon: "file"
    },
    room: {
      name: "Room",
      description: "Room or area in the property",
      color: "#10b981", // Emerald green
      icon: "home"
    },
    style: {
      name: "Style",
      description: "Design style or aesthetic",
      color: "#8b5cf6", // Violet
      icon: "paintbrush"
    },
    material: {
      name: "Material",
      description: "Construction or design materials",
      color: "#f59e0b", // Amber
      icon: "layers"
    },
    custom: {
      name: "Custom",
      description: "User-defined tags",
      color: "#64748b", // Slate
      icon: "tag"
    }
  },
  tags: {
    // Type tags
    "type:design": { id: "type:design", label: "Design", category: "type", color: "#0ea5e9" },
    "type:inspiration": { id: "type:inspiration", label: "Inspiration", category: "type", color: "#ec4899" },
    "type:blueprint": { id: "type:blueprint", label: "Blueprint", category: "type", color: "#3b82f6" },
    "type:floorplan": { id: "type:floorplan", label: "Floor Plan", category: "type", color: "#3b82f6" },
    "type:before-photo": { id: "type:before-photo", label: "Before Photo", category: "type", color: "#f97316" },
    "type:material": { id: "type:material", label: "Material", category: "type", color: "#f59e0b" },
    "type:fixture": { id: "type:fixture", label: "Fixture", category: "type", color: "#84cc16" },
    "type:document": { id: "type:document", label: "Document", category: "type", color: "#6b7280" },
    
    // Common rooms (these will be generated dynamically from the project's rooms)
    "room:kitchen": { id: "room:kitchen", label: "Kitchen", category: "room", color: "#10b981" },
    "room:bathroom": { id: "room:bathroom", label: "Bathroom", category: "room", color: "#10b981" },
    "room:bedroom": { id: "room:bedroom", label: "Bedroom", category: "room", color: "#10b981" },
    "room:living": { id: "room:living", label: "Living Room", category: "room", color: "#10b981" },
    
    // Common styles
    "style:modern": { id: "style:modern", label: "Modern", category: "style", color: "#8b5cf6" },
    "style:traditional": { id: "style:traditional", label: "Traditional", category: "style", color: "#8b5cf6" },
    "style:contemporary": { id: "style:contemporary", label: "Contemporary", category: "style", color: "#8b5cf6" },
    "style:minimalist": { id: "style:minimalist", label: "Minimalist", category: "style", color: "#8b5cf6" },
    
    // Common materials
    "material:wood": { id: "material:wood", label: "Wood", category: "material", color: "#f59e0b" },
    "material:stone": { id: "material:stone", label: "Stone", category: "material", color: "#f59e0b" },
    "material:metal": { id: "material:metal", label: "Metal", category: "material", color: "#f59e0b" },
    "material:glass": { id: "material:glass", label: "Glass", category: "material", color: "#f59e0b" }
  }
};

/**
 * Creates a tag ID from a category and name
 */
export function createTagId(category: TagCategory, name: string): string {
  const sanitizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
  return `${category}:${sanitizedName}`;
}

/**
 * Gets the category of a tag from its ID
 */
export function getTagCategory(tagId: string): TagCategory {
  const parts = tagId.split(':');
  if (parts.length >= 2) {
    const category = parts[0] as TagCategory;
    return ['type', 'room', 'style', 'material', 'custom'].includes(category) 
      ? category 
      : 'custom';
  }
  return 'custom';
}

/**
 * Gets a tag definition from metadata, creating it if it doesn't exist
 */
export function getTagDefinition(
  tagId: string, 
  metadata: TagsMetadata = defaultTagsMetadata
): TagDefinition {
  // If the tag exists in metadata, return it
  if (metadata.tags[tagId]) {
    return metadata.tags[tagId];
  }
  
  // Otherwise create a default definition
  const category = getTagCategory(tagId);
  const parts = tagId.split(':');
  const label = parts.length > 1 
    ? parts[1].split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') 
    : tagId;
    
  const categoryInfo = metadata.categories[category] || metadata.categories.custom;
  
  return {
    id: tagId,
    label,
    category,
    color: categoryInfo?.color
  };
}

/**
 * Groups tags by their category
 */
export function groupTagsByCategory(
  tags: string[], 
  metadata: TagsMetadata = defaultTagsMetadata
): Record<TagCategory, TagDefinition[]> {
  const result: Record<TagCategory, TagDefinition[]> = {
    type: [],
    room: [],
    style: [],
    material: [],
    custom: []
  };
  
  tags.forEach(tagId => {
    const definition = getTagDefinition(tagId, metadata);
    result[definition.category] = [...result[definition.category], definition];
  });
  
  return result;
}

/**
 * Generates room tags from project room data
 */
export function generateRoomTags(rooms: Array<{ id: string; name: string }>): Record<string, TagDefinition> {
  const roomTags: Record<string, TagDefinition> = {};
  
  rooms.forEach(room => {
    const normalizedName = room.name.toLowerCase().trim().replace(/\s+/g, '-');
    const tagId = `room:${normalizedName}`;
    
    roomTags[tagId] = {
      id: tagId,
      label: room.name,
      category: 'room',
      color: '#10b981' // Emerald green for rooms
    };
  });
  
  return roomTags;
}

/**
 * Merges custom tag metadata with the default metadata
 */
export function mergeTagsMetadata(
  custom: Partial<TagsMetadata> = {}, 
  base: TagsMetadata = defaultTagsMetadata
): TagsMetadata {
  return {
    version: custom.version || base.version,
    categories: { ...base.categories, ...custom.categories },
    tags: { ...base.tags, ...custom.tags }
  };
}
