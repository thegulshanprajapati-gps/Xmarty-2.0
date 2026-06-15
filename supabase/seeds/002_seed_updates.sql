-- Seed: default updates
BEGIN;

INSERT INTO public.updates (title, slug, excerpt, content, tags, status)
VALUES
('SBTE Revised Exam Schedule (Compartmental/Supplementary 2025 Odd)', 'sbte-revised-exam-schedule-2025', 'SBTE Bihar updated the exam schedule for the compartmental and supplementary exams.', '{"blocks":[{"type":"document","data":{}}]}'::jsonb, ARRAY['Exam','Document'], 'published'),
('Platform Maintenance: Scheduled Downtime', 'platform-maintenance-jun-10-2026', 'We will perform maintenance on June 10, 2026. Expected downtime: 30 minutes.', '{"blocks":[{"type":"notice","data":{}}]}'::jsonb, ARRAY['Maintenance','Announcement'], 'published'),
('New Course: Advanced React Patterns', 'new-course-advanced-react-patterns', 'A new advanced React course covering patterns, performance, and architecture is live.', '{"blocks":[{"type":"course","data":{}}]}'::jsonb, ARRAY['Course'], 'published')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
