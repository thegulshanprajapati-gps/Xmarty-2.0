import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:9002';
  
  // Base static paths
  const staticPaths = [
    '',
    '/about',
    '/blog',
    '/community',
    '/contact',
    '/courses',
    '/faq',
    '/login',
    '/privacy',
    '/profile',
    '/refund',
    '/register',
    '/terms',
    '/updates',
  ];

  const dynamicPaths: string[] = [];

  // Fetch dynamic blog posts (from static default list)
  const blogSlugs = [
    'the-future-of-web-architecture-in-2024',
    'mastering-the-xmartycreator-workflow',
    'why-ai-powered-learning-is-the-new-gold-standard'
  ];
  blogSlugs.forEach(slug => {
    dynamicPaths.push(`/blog/${slug}`);
  });

  // Fetch dynamic courses, folders and pages from MongoDB
  try {
    const { getDb } = await import('@/lib/mongodb');
    const db = await getDb();
    
    // 1. Courses
    try {
      const courses = await db.collection('courses').find({}).toArray();
      courses.forEach((c: any) => {
        if (c._id) {
          dynamicPaths.push(`/courses/${c._id.toString()}`);
        }
      });
    } catch (e) {
      console.warn('Could not load courses for sitemap', e);
    }

    // 2. Course folders / categories
    try {
      const folders = await db.collection('course_folders').find({}).toArray();
      folders.forEach((f: any) => {
        if (f._id) {
          dynamicPaths.push(`/courses/${f._id.toString()}`);
        }
      });
    } catch (e) {
      console.warn('Could not load course folders for sitemap', e);
    }

    // 3. Custom DB-driven pages
    try {
      const pages = await db.collection('pages').find({}).toArray();
      pages.forEach((p: any) => {
        if (p.slug && p.slug !== 'home') {
          dynamicPaths.push(`/${p.slug}`);
        }
      });
    } catch (e) {
      console.warn('Could not load custom pages for sitemap', e);
    }
  } catch (error) {
    console.warn('Failed to initialize database connection for sitemap generation', error);
  }

  const allPaths = [...new Set([...staticPaths, ...dynamicPaths])];
  
  return allPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1.0 : path.startsWith('/courses') || path.startsWith('/blog') ? 0.8 : 0.5,
  }));
}
