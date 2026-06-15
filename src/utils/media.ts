export type MediaAsset = {
  id: string;
  name: string;
  mime_type: string;
  media_type: 'image' | 'video' | string;
  size: number;
  url: string;
  thumbnail_url: string;
  tags: string[];
  folder_id: string | null;
  folder_name?: string | null;
  deleted: boolean;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  metadata?: { width: number | null; height: number | null };
};

export type MediaFolder = {
  id: string;
  name: string;
  parent_folder_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaQueryParams = {
  folderId?: string | null;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'name' | 'size' | 'type';
  view?: 'grid' | 'masonry';
  recycle?: boolean;
  page?: number;
  pageSize?: number;
  type?: string;
};

export type MediaResponse = {
  items: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
  view: string;
};

export const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' },
] as const;

export const sidebarItems = [
  { id: 'home', label: 'Home', path: '/asset' },
  { id: 'library', label: 'Media Library', path: '/asset' },
  { id: 'folders', label: 'Folders', path: '/asset' },
  { id: 'favorites', label: 'Favorites', path: '/asset?view=favorites' },
  { id: 'recycle', label: 'Recycle Bin', path: '/asset/recycle-bin' },
];
