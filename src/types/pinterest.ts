
export interface PinterestBoard {
  id: string;
  name: string;
  url: string;
  imageUrl?: string;
  pins?: PinterestPin[];
}

export interface PinterestPin {
  id: string;
  imageUrl: string;
  description?: string;
}
