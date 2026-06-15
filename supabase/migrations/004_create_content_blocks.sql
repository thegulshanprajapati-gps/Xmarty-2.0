-- Xmarty Creator universal content block CMS schema
-- Adds a database table for editable page content, navigation, footer, and UI copy.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL DEFAULT '',
  section_key text NOT NULL DEFAULT '',
  content_key text NOT NULL DEFAULT '',
  value text,
  type text NOT NULL DEFAULT 'text',
  json_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_blocks
  ADD CONSTRAINT content_blocks_unique_keys UNIQUE (page_slug, section_key, content_key);

CREATE INDEX IF NOT EXISTS idx_content_blocks_page_slug ON public.content_blocks (page_slug);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section_key ON public.content_blocks (section_key);
CREATE INDEX IF NOT EXISTS idx_content_blocks_content_key ON public.content_blocks (content_key);

-- Optional trigger for updated_at values if trigger_set_updated_at exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_updated_at') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_content_blocks') THEN
      CREATE TRIGGER set_updated_at_content_blocks
      BEFORE UPDATE ON public.content_blocks
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_set_updated_at();
    END IF;
  END IF;
END$$;
