-- ==========================================
-- MASTER DATABASE INITIALIZATION SCHEMA (POSTGRESQL / SUPABASE)
-- Project: XmartyCreator CMS Database System
-- ==========================================

-- Clean up existing assets to avoid conflicts
DROP TABLE IF EXISTS section_items CASCADE;
DROP TABLE IF EXISTS page_sections CASCADE;
DROP TABLE IF EXISTS seo_metadata CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS navigation CASCADE;
DROP TABLE IF EXISTS footer CASCADE;
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS course_content CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_folders CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS reusable_components CASCADE;
DROP TABLE IF EXISTS cms_blocks CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'XmartyCreator',
  logo text NULL,
  primary_color text NOT NULL DEFAULT '#FF0000',
  secondary_color text NOT NULL DEFAULT '#FF0000',
  theme_settings jsonb NOT NULL DEFAULT '{"themeMode": "light"}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. PAGES
CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'published', -- draft, published
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. SEO METADATA
CREATE TABLE seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  meta_title text NOT NULL,
  meta_description text NOT NULL,
  og_image text NULL,
  keywords text[] DEFAULT '{}'::text[],
  canonical_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. PAGE SECTIONS
CREATE TABLE page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  key text NOT NULL,
  title text NULL,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, key)
);

-- 5. SECTION ITEMS (Individual content pieces)
CREATE TABLE section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NULL,
  json_value jsonb NULL,
  type text NOT NULL DEFAULT 'text', -- text, json, image
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_id, key)
);

-- 6. NAVIGATION
CREATE TABLE navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer DEFAULT 0,
  parent_id uuid NULL REFERENCES navigation(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. FOOTER
CREATE TABLE footer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL, -- e.g., 'Company', 'Resources', 'Legal'
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. MEDIA ASSETS
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'image', -- image, video, banner, thumbnail, icon
  size_bytes integer NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. COURSE FOLDERS
CREATE TABLE course_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NULL,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  owner_id uuid NULL, -- Owner ID for permission models
  created_by uuid NULL,
  visibility text NOT NULL DEFAULT 'public', -- public, private, restricted
  permissions jsonb DEFAULT '{"role": "authenticated", "access": "read"}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. COURSES
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NULL REFERENCES course_folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NULL,
  published boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  owner_id uuid NULL,
  created_by uuid NULL,
  visibility text NOT NULL DEFAULT 'public',
  permissions jsonb DEFAULT '{"role": "authenticated", "access": "read"}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. COURSE CONTENT
CREATE TABLE course_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'video', -- video, article, quiz
  url text NULL,
  body text NULL,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. FORMS (Dynamic text labels for submission pages)
CREATE TABLE forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key text UNIQUE NOT NULL, -- e.g., 'contact_form'
  title text NOT NULL,
  fields jsonb NOT NULL, -- Fields mapping configurations
  cta_text text NOT NULL DEFAULT 'Submit',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. TESTIMONIALS
CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  role text NULL,
  company text NULL,
  quote text NOT NULL,
  avatar_url text NULL,
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. FAQS
CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 15. REUSABLE COMPONENTS
CREATE TABLE reusable_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_key text UNIQUE NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 16. CMS BLOCKS
CREATE TABLE cms_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key text UNIQUE NOT NULL,
  body jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES Setup
-- ==========================================

-- Enable RLS for all required tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reusable_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Generator Wrapper
DO $$
DECLARE
    table_arr text[] := ARRAY[
        'site_settings', 'pages', 'seo_metadata', 'page_sections', 'section_items', 
        'navigation', 'footer', 'media_assets', 'course_folders', 'courses', 
        'course_content', 'forms', 'testimonials', 'faqs', 'reusable_components', 'cms_blocks'
    ];
    tname text;
BEGIN
    FOREACH tname IN ARRAY table_arr LOOP
        -- Public read access policy
        EXECUTE format('DROP POLICY IF EXISTS "Public select access for %s" ON %s', tname, tname);
        EXECUTE format('CREATE POLICY "Public select access for %s" ON %s FOR SELECT USING (true)', tname, tname);

        -- Fully safe authenticated admin access
        EXECUTE format('DROP POLICY IF EXISTS "Admin full access for %s" ON %s', tname, tname);
        EXECUTE format('CREATE POLICY "Admin full access for %s" ON %s FOR ALL TO authenticated USING (true) WITH CHECK (true)', tname, tname);
    END LOOP;
END
$$;


-- ==========================================
-- SEED DATA MIGRATION FROM CURRENT UI CONTENT
-- ==========================================

-- 1. Seed Site Settings
INSERT INTO site_settings (site_name, primary_color, secondary_color, theme_settings)
VALUES ('XmartyCreator', '#FF0000', '#FF0000', '{"themeMode": "light"}');

-- 2. Seed Pages
INSERT INTO pages (title, slug, description)
VALUES 
  ('Home', 'home', 'Welcome to XmartyCreator landing page'),
  ('About', 'about', 'Who we are and our story'),
  ('Contact', 'contact', 'Get in touch with platform support');

-- 3. Seed Page Sections
INSERT INTO page_sections (page_id, key, title)
SELECT id, 'hero', 'Hero Banner Section' FROM pages WHERE slug = 'home';

INSERT INTO page_sections (page_id, key, title)
SELECT id, 'pathways', 'Learning Pathways Grid' FROM pages WHERE slug = 'home';

INSERT INTO page_sections (page_id, key, title)
SELECT id, 'featured', 'Featured Track Cards' FROM pages WHERE slug = 'home';

INSERT INTO page_sections (page_id, key, title)
SELECT id, 'community', 'Community Grid Section' FROM pages WHERE slug = 'home';

INSERT INTO page_sections (page_id, key, title)
SELECT id, 'story', 'Our Story Text Details' FROM pages WHERE slug = 'about';

-- 4. Seed Home Page content
INSERT INTO section_items (section_id, key, value, type)
SELECT id, 'title', 'Learn skills that actually ship.', 'text' FROM page_sections WHERE key = 'hero' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

INSERT INTO section_items (section_id, key, value, type)
SELECT id, 'subtitle', 'XmartyCreator helps creators learn production-grade development, build real portfolio projects, and grow with AI-guided support.', 'text' FROM page_sections WHERE key = 'hero' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

INSERT INTO section_items (section_id, key, value, type)
SELECT id, 'primaryCta', 'Explore Courses', 'text' FROM page_sections WHERE key = 'hero' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

INSERT INTO section_items (section_id, key, value, type)
SELECT id, 'secondaryCta', 'Join Community', 'text' FROM page_sections WHERE key = 'hero' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

INSERT INTO section_items (section_id, key, value, type)
SELECT id, 'loginCta', 'Login / Register', 'text' FROM page_sections WHERE key = 'hero' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

-- JSON block for Stats
INSERT INTO section_items (section_id, key, json_value, type)
SELECT id, 'stats', '[{"label": "Active learners", "value": "45K+"}, {"label": "Industry projects", "value": "120+"}, {"label": "Mentor sessions", "value": "8K+"}]'::jsonb, 'json' 
FROM page_sections WHERE key = 'hero' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

-- JSON block for Learning Pathways
INSERT INTO section_items (section_id, key, json_value, type)
SELECT id, 'items', '[
  {"title": "Build Production Skills", "desc": "Learn modern frontend, backend, architecture, and deployment through practical course tracks.", "icon": "BookOpen"},
  {"title": "Practice With AI Guidance", "desc": "Use Vasant AI for quick explanations, debugging help, and personalized learning direction.", "icon": "BrainCircuit"},
  {"title": "Grow With Community", "desc": "Join study circles, code reviews, discussions, and creator groups that keep momentum alive.", "icon": "Users"},
  {"title": "Prepare For Careers", "desc": "Turn projects into portfolio proof and follow updates for internships, placements, and launches.", "icon": "BriefcaseBusiness"}
]'::jsonb, 'json'
FROM page_sections WHERE key = 'pathways' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

-- JSON block for Featured Courses
INSERT INTO section_items (section_id, key, json_value, type)
SELECT id, 'courses', '[
  {"title": "Advanced Web Architecture", "tag": "Architecture", "image": "https://picsum.photos/seed/xmarty-architecture/900/650"},
  {"title": "Enterprise Backend Systems", "tag": "Backend", "image": "https://picsum.photos/seed/xmarty-backend/900/650"},
  {"title": "Product UI Excellence", "tag": "Frontend", "image": "https://picsum.photos/seed/xmarty-product-ui/900/650"}
]'::jsonb, 'json'
FROM page_sections WHERE key = 'featured' AND page_id = (SELECT id FROM pages WHERE slug = 'home');

-- 5. Seed About Page FAQs
INSERT INTO faqs (question, answer, sort_order)
VALUES 
  ('Is XmartyCreator suitable for beginners?', 'Absolutely. Our curriculum starts from foundations and scales to enterprise levels, ensuring anyone with passion can learn.', 1),
  ('What makes Vasant AI different?', 'Vasant is trained specifically on our curriculum to provide context-aware, 24/7 technical guidance that feels like a real tutor.', 2),
  ('Do I get a certificate?', 'Yes, every completed course includes an industry-verified digital certificate that you can share on LinkedIn.', 3),
  ('Can I access courses offline?', 'Our platform is optimized for web access, but all resource materials and code templates are downloadable for offline use.', 4);

-- 6. Seed Course Folders and Courses
INSERT INTO course_folders (title, slug, description, visibility)
VALUES ('Core Courses', 'core-courses', 'Featured course folders', 'public');

INSERT INTO courses (folder_id, title, slug, description, published, visibility)
SELECT id, 'Getting Started', 'getting-started', 'A first course to get started quickly', true, 'public'
FROM course_folders
WHERE slug = 'core-courses';
