-- Xmarty Creator CMS schema for Supabase PostgreSQL
-- Directly runnable in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUM types using safe Supabase-compatible checks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'page_status') THEN
    CREATE TYPE public.page_status AS ENUM ('draft', 'published', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'page_visibility') THEN
    CREATE TYPE public.page_visibility AS ENUM ('public', 'private', 'password_protected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'navigation_location') THEN
    CREATE TYPE public.navigation_location AS ENUM ('header', 'footer', 'sidebar');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'author', 'viewer');
  END IF;
END$$;

-- Role helper functions for RLS
CREATE OR REPLACE FUNCTION public.has_cms_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  select exists (
    select 1 from public.users_roles ur
    where ur.user_id = auth.uid()
      and ur.role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_cms_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  select public.has_cms_role('admin');
$$;

-- Timestamp trigger helper
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- users_roles table
CREATE TABLE IF NOT EXISTS public.users_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_roles_user_id ON public.users_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_users_roles_role ON public.users_roles (role);

-- site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL,
  logo text,
  favicon text,
  primary_color text,
  secondary_color text,
  theme_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.page_status NOT NULL DEFAULT 'draft',
  seo_title text,
  seo_description text,
  featured_image text,
  template text NOT NULL DEFAULT 'default',
  visibility public.page_visibility NOT NULL DEFAULT 'public',
  author_id uuid,
  parent_page_id uuid,
  sort_order integer NOT NULL DEFAULT 0,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pages_slug_unique UNIQUE (slug)
);

ALTER TABLE public.pages
  ADD CONSTRAINT pages_parent_fk FOREIGN KEY (parent_page_id)
    REFERENCES public.pages (id)
    ON DELETE SET NULL;

ALTER TABLE public.pages
  ADD CONSTRAINT pages_author_fk FOREIGN KEY (author_id)
    REFERENCES auth.users (id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pages_status_visibility ON public.pages (status, visibility);
CREATE INDEX IF NOT EXISTS idx_pages_author_id ON public.pages (author_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent_sort ON public.pages (parent_page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_pages_content_gin ON public.pages USING gin (content jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_pages_meta_gin ON public.pages USING gin (meta jsonb_path_ops);

-- page_versions table
CREATE TABLE IF NOT EXISTS public.page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL,
  version_number integer NOT NULL,
  content_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_versions_page_fk FOREIGN KEY (page_id)
    REFERENCES public.pages (id)
    ON DELETE CASCADE,
  CONSTRAINT page_versions_unique_version UNIQUE (page_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON public.page_versions (page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_created_by ON public.page_versions (created_by);

-- media_library table
CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  alt_text text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_library
  ADD CONSTRAINT media_library_uploaded_by_fk FOREIGN KEY (uploaded_by)
    REFERENCES auth.users (id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON public.media_library (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON public.media_library (file_type);

-- navigation_menus table
CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_name text NOT NULL,
  location public.navigation_location NOT NULL DEFAULT 'header',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_navigation_menus_location ON public.navigation_menus (location);

-- navigation_items table
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL,
  label text NOT NULL,
  page_id uuid,
  custom_url text,
  parent_id uuid,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT navigation_items_menu_fk FOREIGN KEY (menu_id)
    REFERENCES public.navigation_menus (id)
    ON DELETE CASCADE,
  CONSTRAINT navigation_items_page_fk FOREIGN KEY (page_id)
    REFERENCES public.pages (id)
    ON DELETE SET NULL,
  CONSTRAINT navigation_items_parent_fk FOREIGN KEY (parent_id)
    REFERENCES public.navigation_items (id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_navigation_items_menu_sort ON public.navigation_items (menu_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_navigation_items_parent ON public.navigation_items (parent_id);

-- seo_settings table
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL UNIQUE,
  canonical_url text,
  robots_meta text NOT NULL DEFAULT 'index, follow',
  schema_markup jsonb NOT NULL DEFAULT '{}'::jsonb,
  og_image text,
  twitter_card text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seo_settings_page_fk FOREIGN KEY (page_id)
    REFERENCES public.pages (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seo_settings_page_id ON public.seo_settings (page_id);
CREATE INDEX IF NOT EXISTS idx_seo_settings_robots_meta ON public.seo_settings (robots_meta);

-- forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forms_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_forms_slug ON public.forms (slug);
CREATE INDEX IF NOT EXISTS idx_forms_fields_gin ON public.forms USING gin (fields jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_forms_settings_gin ON public.forms USING gin (settings jsonb_path_ops);

-- form_submissions table
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL,
  submission_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT form_submissions_form_fk FOREIGN KEY (form_id)
    REFERENCES public.forms (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions (form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON public.form_submissions (submitted_at);

-- Timestamp triggers
DROP TRIGGER IF EXISTS set_updated_at_pages ON public.pages;
CREATE TRIGGER set_updated_at_pages
BEFORE UPDATE ON public.pages
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_media_library ON public.media_library;
CREATE TRIGGER set_updated_at_media_library
BEFORE UPDATE ON public.media_library
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_navigation_menus ON public.navigation_menus;
CREATE TRIGGER set_updated_at_navigation_menus
BEFORE UPDATE ON public.navigation_menus
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_navigation_items ON public.navigation_items;
CREATE TRIGGER set_updated_at_navigation_items
BEFORE UPDATE ON public.navigation_items
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_seo_settings ON public.seo_settings;
CREATE TRIGGER set_updated_at_seo_settings
BEFORE UPDATE ON public.seo_settings
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_forms ON public.forms;
CREATE TRIGGER set_updated_at_forms
BEFORE UPDATE ON public.forms
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_users_roles ON public.users_roles;
CREATE TRIGGER set_updated_at_users_roles
BEFORE UPDATE ON public.users_roles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Row Level Security enablement
ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
DROP POLICY IF EXISTS users_roles_admin_manage ON public.users_roles;
CREATE POLICY users_roles_admin_manage ON public.users_roles
FOR ALL
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS site_settings_select_public ON public.site_settings;
CREATE POLICY site_settings_select_public ON public.site_settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS site_settings_manage_admin ON public.site_settings;
CREATE POLICY site_settings_manage_admin ON public.site_settings
FOR INSERT, UPDATE, DELETE
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS pages_select_public ON public.pages;
CREATE POLICY pages_select_public ON public.pages
FOR SELECT
USING (status = 'published' AND visibility = 'public');

DROP POLICY IF EXISTS pages_select_authenticated ON public.pages;
CREATE POLICY pages_select_authenticated ON public.pages
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    visibility = 'public'
    OR author_id = auth.uid()
    OR public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
);

DROP POLICY IF EXISTS pages_insert_manage ON public.pages;
CREATE POLICY pages_insert_manage ON public.pages
FOR INSERT
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
    OR public.has_cms_role('author')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
    OR (public.has_cms_role('author') AND author_id = auth.uid())
  )
);

DROP POLICY IF EXISTS pages_update_manage ON public.pages;
CREATE POLICY pages_update_manage ON public.pages
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
    OR (public.has_cms_role('author') AND author_id = auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
    OR (public.has_cms_role('author') AND author_id = auth.uid())
  )
);

DROP POLICY IF EXISTS pages_delete_manage ON public.pages;
CREATE POLICY pages_delete_manage ON public.pages
FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
);

DROP POLICY IF EXISTS page_versions_select ON public.page_versions;
CREATE POLICY page_versions_select ON public.page_versions
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_id
        AND p.author_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS page_versions_insert ON public.page_versions;
CREATE POLICY page_versions_insert ON public.page_versions
FOR INSERT
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_id
        AND p.author_id = auth.uid()
    )
  )
)
WITH CHECK (page_id IS NOT NULL);

DROP POLICY IF EXISTS media_library_select ON public.media_library;
CREATE POLICY media_library_select ON public.media_library
FOR SELECT
USING (true);

DROP POLICY IF EXISTS media_library_manage ON public.media_library;
CREATE POLICY media_library_manage ON public.media_library
FOR INSERT, UPDATE, DELETE
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR uploaded_by = auth.uid()
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR uploaded_by = auth.uid()
  )
);

DROP POLICY IF EXISTS navigation_menus_select ON public.navigation_menus;
CREATE POLICY navigation_menus_select ON public.navigation_menus
FOR SELECT
USING (true);

DROP POLICY IF EXISTS navigation_menus_manage ON public.navigation_menus;
CREATE POLICY navigation_menus_manage ON public.navigation_menus
FOR INSERT, UPDATE, DELETE
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
);

DROP POLICY IF EXISTS navigation_items_select ON public.navigation_items;
CREATE POLICY navigation_items_select ON public.navigation_items
FOR SELECT
USING (true);

DROP POLICY IF EXISTS navigation_items_manage ON public.navigation_items;
CREATE POLICY navigation_items_manage ON public.navigation_items
FOR INSERT, UPDATE, DELETE
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
);

DROP POLICY IF EXISTS seo_settings_select ON public.seo_settings;
CREATE POLICY seo_settings_select ON public.seo_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = page_id
      AND p.status = 'published'
      AND p.visibility = 'public'
  )
);

DROP POLICY IF EXISTS seo_settings_manage ON public.seo_settings;
CREATE POLICY seo_settings_manage ON public.seo_settings
FOR INSERT, UPDATE, DELETE
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
);

DROP POLICY IF EXISTS forms_select ON public.forms;
CREATE POLICY forms_select ON public.forms
FOR SELECT
USING (true);

DROP POLICY IF EXISTS forms_manage ON public.forms;
CREATE POLICY forms_manage ON public.forms
FOR INSERT, UPDATE, DELETE
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
);

DROP POLICY IF EXISTS form_submissions_insert ON public.form_submissions;
CREATE POLICY form_submissions_insert ON public.form_submissions
FOR INSERT
USING (true)
WITH CHECK (form_id IS NOT NULL);

DROP POLICY IF EXISTS form_submissions_select ON public.form_submissions;
CREATE POLICY form_submissions_select ON public.form_submissions
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    public.is_cms_admin()
    OR public.has_cms_role('editor')
  )
);

-- Seed data for default CMS pages
INSERT INTO public.pages (id, title, slug, description, content, status, seo_title, seo_description, featured_image, template, visibility, author_id, sort_order, meta, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Home', 'home', 'Landing page for Xmarty Creator',
    '{"blocks":[{"type":"hero","data":{"heading":"Build beautiful websites and online courses","subheading":"Xmarty Creator makes website creation easy for creators, educators and teams.","cta":[{"label":"Start free","url":"/register"}]}},{"type":"feature_grid","data":{"items":[{"title":"No-code editor","description":"Visual page builder with responsive blocks."},{"title":"Course LMS","description":"Lesson, quiz and progress management."},{"title":"SEO friendly","description":"Publish pages with metadata and sitemaps."}]}},{"type":"testimonial_carousel","data":{"items":[{"name":"Ayesha","quote":"Xmarty Creator transformed our online academy.","role":"Founder"},{"name":"Ravi","quote":"Launching courses has never been easier.","role":"Instructor"}]}}]} }'::jsonb,
    'published', 'Xmarty Creator — Website builder and LMS platform', 'Create landing pages, courses, and membership sites quickly.', 'https://assets.xmartycreator.com/banners/home-hero.jpg', 'default', 'public', NULL, 0, '{"template":"home","featured":true}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'About', 'about', 'About Xmarty Creator',
    '{"blocks":[{"type":"text","data":{"heading":"About Xmarty Creator","body":"Xmarty Creator is a modern website builder and LMS platform designed for creators, instructors, and teams."}},{"type":"stats","data":{"items":[{"label":"Templates","value":"50+"},{"label":"Users","value":"10k+"},{"label":"Integrations","value":"30+"}]}}]}'::jsonb,
    'published', 'About Xmarty Creator', 'Learn about our mission, team, and platform.', NULL, 'default', 'public', NULL, 1, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'Courses', 'courses', 'See available courses and learning paths',
    '{"blocks":[{"type":"course_overview","data":{"heading":"Featured Courses","description":"Browse our library of training and certification courses.","courses":[{"title":"Product Design","duration":"8 weeks"},{"title":"Web Development","duration":"12 weeks"},{"title":"Marketing Automation","duration":"6 weeks"}]}},{"type":"cta","data":{"label":"Browse all courses","url":"/courses"}}]}'::jsonb,
    'published', 'Courses — Xmarty Creator', 'Explore the course catalog and training programs.', NULL, 'course', 'public', NULL, 2, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000004', 'Contact', 'contact', 'Contact page for support and inquiries',
    '{"blocks":[{"type":"contact_form","data":{"heading":"Get in touch","description":"Have questions? Reach out to our support team.","formSlug":"contact-form"}},{"type":"contact_info","data":{"items":[{"label":"Email","value":"support@xmartycreator.com"},{"label":"Phone","value":"+1 800 123 4567"}]}}]}'::jsonb,
    'published', 'Contact Xmarty Creator', 'Contact support or sales for help with your project.', NULL, 'default', 'public', NULL, 3, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000005', 'FAQ', 'faq', 'Frequently asked questions',
    '{"blocks":[{"type":"faq","data":{"items":[{"question":"How do I create a page?","answer":"Use the drag-and-drop builder to add sections and publish instantly."},{"question":"Can I sell courses?","answer":"Yes, integrate payment providers and manage students in one place."}]}}]}'::jsonb,
    'published', 'FAQ — Xmarty Creator', 'Common questions about the website builder and LMS platform.', NULL, 'default', 'public', NULL, 4, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000006', 'Blog', 'blog', 'Blog and news updates',
    '{"blocks":[{"type":"blog_index","data":{"heading":"Latest articles","description":"Read our latest tips, product updates, and case studies.","posts":[{"title":"Launching a course in 7 days","slug":"launch-course"},{"title":"Designing modern landing pages","slug":"landing-page-design"}]}}]}'::jsonb,
    'published', 'Blog — Xmarty Creator', 'Read articles on education, design, and business growth.', NULL, 'default', 'public', NULL, 5, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000007', 'Privacy Policy', 'privacy-policy', 'Privacy policy for Xmarty Creator',
    '{"blocks":[{"type":"legal","data":{"heading":"Privacy Policy","body":"We collect only the data needed to run your account and comply with our policies."}}]}'::jsonb,
    'published', 'Privacy Policy', 'Learn how we protect your data and privacy.', NULL, 'legal', 'public', NULL, 6, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000008', 'Terms', 'terms', 'Terms of service for Xmarty Creator',
    '{"blocks":[{"type":"legal","data":{"heading":"Terms of Service","body":"Use of Xmarty Creator is governed by our terms, including acceptable use and payment policies."}}]}'::jsonb,
    'published', 'Terms of Service', 'Review the terms and conditions for using Xmarty Creator.', NULL, 'legal', 'public', NULL, 7, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000009', 'Team', 'team', 'Meet the team behind Xmarty Creator',
    '{"blocks":[{"type":"team","data":{"heading":"Meet our team","members":[{"name":"Priya","role":"CEO"},{"name":"Kamal","role":"CTO"},{"name":"Lina","role":"Head of Product"}]}},{"type":"text","data":{"body":"Our team builds intuitive tools for creators and education leaders."}}]}'::jsonb,
    'published', 'Team — Xmarty Creator', 'Get to know the people behind the platform.', NULL, 'default', 'public', NULL, 8, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000010', 'Testimonials', 'testimonials', 'Customer testimonials and success stories',
    '{"blocks":[{"type":"testimonial_list","data":{"heading":"What creators say","items":[{"author":"Sara","quote":"Xmarty Creator helped launch our academy in weeks.","company":"EduLabs"},{"author":"Naveen","quote":"The page builder is fast and flexible.","company":"Growth Academy"}]}}]}'::jsonb,
    'published', 'Testimonials — Xmarty Creator', 'See how creators use Xmarty Creator to grow their business.', NULL, 'default', 'public', NULL, 9, '{}'::jsonb, now(), now());

-- Example JSON content block examples for CMS builder
-- hero block
-- {"type":"hero","data":{"heading":"Launch your website","subheading":"Create pages, courses and communities in minutes.","cta":[{"label":"Start now","url":"/register"}]}}
-- feature block
-- {"type":"feature_grid","data":{"items":[{"title":"Drag & drop","description":"Design without code."},{"title":"Course LMS","description":"Built-in lessons and quizzes."}]}}
-- testimonial block
-- {"type":"testimonial_list","data":{"heading":"Customer stories","items":[{"author":"Priya","quote":"Easy to use.","company":"Edu Academy"}]}}
-- faq block
-- {"type":"faq","data":{"items":[{"question":"Can I customize templates?","answer":"Yes, every page can be personalized."}]}}

-- Example Supabase queries
-- SELECT id, title, slug, description FROM public.pages WHERE status = 'published' AND visibility = 'public' ORDER BY sort_order ASC;
-- SELECT ni.id, ni.label, COALESCE(p.slug, ni.custom_url) AS target, ni.parent_id FROM public.navigation_items ni LEFT JOIN public.pages p ON p.id = ni.page_id WHERE ni.menu_id = '<menu-id>' ORDER BY ni.sort_order;
-- SELECT version_number, created_by, created_at FROM public.page_versions WHERE page_id = '<page-id>' ORDER BY version_number DESC;
-- SELECT * FROM public.forms WHERE slug = 'contact-form';
-- SELECT * FROM public.form_submissions WHERE form_id = '<form-id>' ORDER BY submitted_at DESC;

-- End of Xmarty Creator CMS schema
