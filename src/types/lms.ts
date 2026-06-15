import { ObjectId } from 'mongodb';

export interface DbCourseFolder {
  _id?: ObjectId;
  id?: string;
  course_id: string;
  title: string;
  description: string | null;
  parent_folder_id: string | null;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
  is_paid?: boolean;
  category?: string;
  level?: string;
  instructor?: string;
  duration?: string;
  students?: string;
  price?: string | number;
  thumbnail_url?: string;
  visibility?: string;
  slug?: string;
  body_content?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  focus_keyphrase?: string;
}

export interface DbCourseContent {
  _id?: ObjectId;
  id?: string;
  folder_id: string;
  title: string;
  item_type: string;
  file_url: string;
  thumbnail_url: string | null;
  file_name: string;
  file_size: number;
  cloudinary_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}
