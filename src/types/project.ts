
export interface Project {
  id: string;
  property_id: string;
  title: string;
  created_at: string;
  property: {
    property_name: string;
    image_url: string;
    address_line1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  is_owner: boolean;
  team_role?: string;
}
