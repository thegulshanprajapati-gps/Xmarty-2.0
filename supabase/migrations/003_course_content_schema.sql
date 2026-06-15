-- Xmarty Creator course and assessment CMS extension for Supabase
-- Adds course folder structure, content items, user access rows, and audit triggers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- course_folders table for course/module/folder hierarchy
CREATE TABLE IF NOT EXISTS public.course_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_folder_id uuid,
  course_id text NOT NULL DEFAULT 'default',
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_folders
  ADD CONSTRAINT course_folders_parent_fk FOREIGN KEY (parent_folder_id)
    REFERENCES public.course_folders (id)
    ON DELETE CASCADE;

ALTER TABLE public.course_folders
  ADD CONSTRAINT course_folders_created_by_fk FOREIGN KEY (created_by)
    REFERENCES auth.users (id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_course_folders_course_id ON public.course_folders (course_id);
CREATE INDEX IF NOT EXISTS idx_course_folders_parent_folder_id ON public.course_folders (parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_course_folders_sort_order ON public.course_folders (sort_order);

-- course_contents table for shared course assets, PDFs, images, and module files
CREATE TABLE IF NOT EXISTS public.course_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL,
  title text NOT NULL,
  item_type text NOT NULL DEFAULT 'file',
  file_url text NOT NULL,
  thumbnail_url text,
  file_name text,
  file_size bigint NOT NULL DEFAULT 0,
  cloudinary_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_contents
  ADD CONSTRAINT course_contents_folder_fk FOREIGN KEY (folder_id)
    REFERENCES public.course_folders (id)
    ON DELETE CASCADE;

ALTER TABLE public.course_contents
  ADD CONSTRAINT course_contents_created_by_fk FOREIGN KEY (created_by)
    REFERENCES auth.users (id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_course_contents_folder_id ON public.course_contents (folder_id);
CREATE INDEX IF NOT EXISTS idx_course_contents_item_type ON public.course_contents (item_type);
CREATE INDEX IF NOT EXISTS idx_course_contents_created_by ON public.course_contents (created_by);

-- user_access table for supportdomain access management and role metadata
CREATE TABLE IF NOT EXISTS public.user_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_level text NOT NULL DEFAULT 'viewer',
  allowed_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_access
  ADD CONSTRAINT user_access_user_fk FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON public.user_access (user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_access_level ON public.user_access (access_level);

-- Shared updated_at trigger for content tables
DROP TRIGGER IF EXISTS set_updated_at_course_folders ON public.course_folders;
CREATE TRIGGER set_updated_at_course_folders
BEFORE UPDATE ON public.course_folders
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_course_contents ON public.course_contents;
CREATE TRIGGER set_updated_at_course_contents
BEFORE UPDATE ON public.course_contents
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_access ON public.user_access;
CREATE TRIGGER set_updated_at_user_access
BEFORE UPDATE ON public.user_access
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
