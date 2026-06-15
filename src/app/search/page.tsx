'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCMS } from '@/components/cms-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Newspaper, FileText, ArrowRight, Clock, User, Calendar } from 'lucide-react';
import Link from 'next/link';

// Static fallbacks for Search indexing
const STATIC_COURSES = [
  {
    id: '1',
    title: 'Advanced Indigo Web Architecture',
    instructor: 'Dr. Sarah Indigo',
    duration: '12 Hours',
    level: 'Advanced',
    students: '1.2k',
    price: '₹9,900',
    category: 'Architecture',
    description: 'Learn indigo web architecture patterns, standard scales and secure multi-tier designs.',
    href: '/courses'
  },
  {
    id: '2',
    title: 'Enterprise Microservices with Node.js',
    instructor: 'Marcus Aurelius',
    duration: '8 Hours',
    level: 'Intermediate',
    students: '800',
    price: '₹7,900',
    category: 'Backend',
    description: 'Learn production scalability, load balance orchestration, Redis caching, and Docker.',
    href: '/courses'
  },
  {
    id: '3',
    title: 'UI/UX Excellence: Mastering ShadCN',
    instructor: 'Jessica Walters',
    duration: '15 Hours',
    level: 'Beginner',
    students: '2.5k',
    price: '₹12,900',
    category: 'Frontend',
    description: 'Build gorgeous fluid components, tailwind animations, accessibility, and high performance themes.',
    href: '/courses'
  }
];

const STATIC_BLOGS = [
  {
    id: '1',
    title: 'The Future of Web Architecture in 2024',
    slug: 'the-future-of-web-architecture-in-2024',
    excerpt: 'Exploring how server-side rendering and AI-driven design are reshaping the digital landscape...',
    author: 'Admin Sarah',
    date: 'Oct 24, 2024',
    readTime: '8 min',
    category: 'Technology',
    href: '/blog/the-future-of-web-architecture-in-2024'
  },
  {
    id: '2',
    title: 'Mastering the XmartyCreator Workflow',
    slug: 'mastering-the-xmartycreator-workflow',
    excerpt: 'A comprehensive guide to using our dynamic CMS and enterprise modules for your next big project...',
    author: 'Marcus Aurelius',
    date: 'Oct 20, 2024',
    readTime: '12 min',
    category: 'Guide',
    href: '/blog/mastering-the-xmartycreator-workflow'
  },
  {
    id: '3',
    title: 'Why AI-Powered Learning is the New Gold Standard',
    slug: 'why-ai-powered-learning-is-the-new-gold-standard',
    excerpt: 'How tools like Vasant AI are helping students bridge the gap between theory and real-world execution...',
    author: 'Vasant AI Team',
    date: 'Oct 15, 2024',
    readTime: '6 min',
    category: 'AI',
    href: '/blog/why-ai-powered-learning-is-the-new-gold-standard'
  }
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { contentBlocks } = useCMS();
  
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'blogs' | 'pages'>('all');

  const [dbModules, setDbModules] = useState<any[]>([]);
  const [localStorageBlogs, setLocalStorageBlogs] = useState<any[]>([]);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  // Load dynamic db modules (courses) and localStorage blogs if any
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/folders?course_id=default');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setDbModules(data);
        }
      } catch (e) {}

      try {
        const resBlogs = await fetch('/api/blogs');
        if (resBlogs.ok) {
          const dataBlogs = await resBlogs.json();
          if (Array.isArray(dataBlogs)) setLocalStorageBlogs(dataBlogs);
        }
      } catch (e) {}
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Perform search indexing
  const results = useMemo(() => {
    const q = queryParam.trim().toLowerCase();
    if (!q) return { courses: [], blogs: [], pages: [], count: 0 };

    // 1. Index Courses
    const coursesResults = [
      ...STATIC_COURSES.map(c => ({ ...c, type: 'course' })),
      ...dbModules.map(m => ({
        id: m.id,
        title: m.title,
        instructor: 'Platform Instructor',
        duration: 'Self-Paced',
        level: m.is_paid ? 'Premium' : 'Free',
        category: 'Curriculum',
        description: m.description || 'Published course curriculum module.',
        href: `/courses/${m.id}`,
        type: 'course'
      }))
    ].filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      (c.instructor && c.instructor.toLowerCase().includes(q))
    );

    // 2. Index Blogs
    const blogsList = localStorageBlogs.length > 0 ? localStorageBlogs : STATIC_BLOGS;
    const blogsResults = blogsList.map(b => ({
      ...b,
      href: `/blog/${b.slug || b.id}`,
      type: 'blog'
    })).filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.category.toLowerCase().includes(q) || 
      (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q))
    );

    // 3. Index Page Content blocks (dynamic CMS items)
    const pagesResults = contentBlocks.filter(b => {
      // Don't index SEO keys, images or raw technical data blocks
      if (b.section_key === 'seo' || b.type === 'image') return false;
      
      const rawVal = b.type === 'json' || b.type === 'list' 
        ? JSON.stringify(b.json_value || '') 
        : (b.value || '');
      
      return rawVal.toLowerCase().includes(q);
    }).map(b => {
      let snippet = '';
      if (b.type === 'json' || b.type === 'list') {
        snippet = `Section config details for ${b.section_key}`;
      } else {
        snippet = b.value || '';
        if (snippet.length > 150) snippet = snippet.slice(0, 150) + '...';
      }

      // Convert slug/section to readable name
      const pageName = b.page_slug.charAt(0).toUpperCase() + b.page_slug.slice(1);
      const sectionName = b.section_key.charAt(0).toUpperCase() + b.section_key.slice(1);

      return {
        id: b.id,
        title: `${pageName} Page — ${sectionName} Section`,
        description: snippet,
        href: b.page_slug === 'home' ? '/' : `/${b.page_slug}`,
        category: 'CMS Page Content',
        type: 'page'
      };
    });

    return {
      courses: coursesResults,
      blogs: blogsResults,
      pages: pagesResults,
      count: coursesResults.length + blogsResults.length + pagesResults.length
    };
  }, [queryParam, dbModules, localStorageBlogs, contentBlocks]);

  const displayedResults = useMemo(() => {
    if (activeTab === 'courses') return results.courses;
    if (activeTab === 'blogs') return results.blogs;
    if (activeTab === 'pages') return results.pages;
    return [...results.courses, ...results.blogs, ...results.pages];
  }, [activeTab, results]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-6xl font-headline font-black tracking-tight">
          Search <span className="text-primary underline decoration-primary/20 decoration-wavy underline-offset-4">Results</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          {queryParam ? `Found ${results.count} matching results across all website pages and documents` : "Type a query to search the website"}
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, blogs, contact information..."
            className="pl-12 h-14 rounded-2xl text-base border-primary/10 bg-background shadow-md focus-visible:ring-primary focus-visible:ring-1"
          />
        </div>
        <Button type="submit" size="lg" className="h-14 rounded-2xl bg-primary text-white font-bold px-8 shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all">
          Search
        </Button>
      </form>

      {queryParam ? (
        <div className="space-y-6">
          {/* Tab Pill Headers */}
          <div className="flex gap-2 border-b pb-3 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All Results', count: results.count },
              { id: 'courses', label: 'Courses', count: results.courses.length },
              { id: 'blogs', label: 'Blog & Articles', count: results.blogs.length },
              { id: 'pages', label: 'Website Content', count: results.pages.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'courses' | 'blogs' | 'pages')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/15'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <Badge className={`px-1.5 py-0 text-[10px] pointer-events-none ${activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-muted-foreground/15 text-muted-foreground'}`}>
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Results Grid List */}
          <div className="space-y-4">
            {displayedResults.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/5">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-bold">No results found for "{queryParam}"</p>
                <p className="text-xs mt-1">Try check spelling or use simpler keywords.</p>
              </div>
            ) : (
              displayedResults.map((item, idx) => (
                <Card key={idx} className="group border-primary/5 hover:border-primary/20 hover:shadow-lg transition-all duration-300 rounded-[1.75rem] overflow-hidden">
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-between md:flex-row gap-6 items-start md:items-center">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                          {item.type}
                        </Badge>
                        <Badge className="bg-primary/5 border-none text-primary text-[10px] font-bold">
                          {item.category}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-headline font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description || item.excerpt || '' }} />

                      {item.type === 'course' && (
                        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.duration}</span>
                          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {item.instructor}</span>
                        </div>
                      )}

                      {item.type === 'blog' && (
                        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {item.date}</span>
                          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {item.author}</span>
                        </div>
                      )}
                    </div>

                    <Button asChild variant="outline" className="rounded-xl border-primary/10 hover:border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Link href={item.href || '#'}>
                        View <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold text-lg">XmartyCreator Unified Search</p>
          <p className="text-sm max-w-md mx-auto mt-1">
            Search keywords to look inside course content, blog posts, pages information, contact email, and platform details.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading Search Index...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
