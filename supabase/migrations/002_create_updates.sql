-- Migration: create updates table, indexes, trigger, and RLS policies
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS updates_status_idx ON public.updates (status);
CREATE INDEX IF NOT EXISTS updates_tags_gin ON public.updates USING gin (tags);
CREATE INDEX IF NOT EXISTS updates_content_gin ON public.updates USING gin (content);

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_updates ON public.updates;
CREATE TRIGGER set_updated_at_updates
BEFORE UPDATE ON public.updates
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public select published updates" ON public.updates
FOR SELECT
USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Admins manage updates (user_roles)" ON public.updates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

COMMIT;
