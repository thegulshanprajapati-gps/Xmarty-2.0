-- Seed: default CMS pages
BEGIN;

INSERT INTO public.pages (title, slug, description, content, status, seo_title, seo_description, featured_image, meta)
VALUES
('Home', 'home', 'Landing page', '{"blocks":[{"type":"hero","data":{"heading":"Welcome"}}]}'::jsonb, 'published', 'Home', 'Welcome to our site', NULL, '{}'::jsonb),
('About', 'about', 'About us', '{"blocks":[{"type":"text","data":{"body":"About us content"}}]}'::jsonb, 'published', 'About', 'About us', NULL, '{}'::jsonb),
('Courses', 'courses', 'Courses catalog', '{"blocks":[{"type":"list","data":{"items":[]}}]}'::jsonb, 'published', 'Courses', 'Our courses', NULL, '{}'::jsonb),
('Contact', 'contact', 'Contact page', '{"blocks":[{"type":"contact","data":{}}]}'::jsonb, 'published', 'Contact', 'Contact us', NULL, '{}'::jsonb),
('FAQ', 'faq', 'Frequently asked questions', '{"blocks":[{"type":"faq","data":{"items":[]}}]}'::jsonb, 'published', 'FAQ', 'Frequently asked questions', NULL, '{}'::jsonb),
('Privacy Policy', 'privacy', 'Privacy policy', '{"blocks":[{"type":"legal","data":{}}]}'::jsonb, 'published', 'Privacy Policy', 'Our privacy policy', NULL, '{}'::jsonb),
('Terms', 'terms', 'Terms of service', '{"blocks":[{"type":"legal","data":{}}]}'::jsonb, 'published', 'Terms', 'Terms and conditions', NULL, '{}'::jsonb),
('Blog', 'blog', 'Blog index', '{"blocks":[{"type":"posts","data":{}}]}'::jsonb, 'published', 'Blog', 'Our posts', NULL, '{}'::jsonb),
('Team', 'team', 'Meet the team', '{"blocks":[{"type":"team","data":{}}]}'::jsonb, 'published', 'Team', 'Meet the team', NULL, '{}'::jsonb),
('Testimonials', 'testimonials', 'Student testimonials', '{"blocks":[{"type":"testimonials","data":{}}]}'::jsonb, 'published', 'Testimonials', 'What people say', NULL, '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
