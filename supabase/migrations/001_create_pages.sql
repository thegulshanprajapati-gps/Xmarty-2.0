-- Migration: create pages table, indexes, trigger, and RLS policies
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft','archived')),
  seo_title text,
  seo_description text,
  featured_image text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pages_status_idx ON public.pages (status);
CREATE INDEX IF NOT EXISTS pages_slug_idx ON public.pages (slug);
CREATE INDEX IF NOT EXISTS pages_content_gin ON public.pages USING gin (content);
CREATE INDEX IF NOT EXISTS pages_meta_gin ON public.pages USING gin (meta);

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.pages;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public clients to SELECT published pages only
CREATE POLICY IF NOT EXISTS "Public select published pages" ON public.pages
FOR SELECT
USING (status = 'published');

-- Admin policy example using public.user_roles(user_id, role)
CREATE POLICY IF NOT EXISTS "Admins can manage pages (user_roles)" ON public.pages
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

COMMIT;
