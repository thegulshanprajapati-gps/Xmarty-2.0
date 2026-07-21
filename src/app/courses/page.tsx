'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, BookOpen, Clock, User, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/format";


import { useContentBlock } from "@/hooks/use-content-block";
import { CustomizableBadge } from "@/components/cms/customizable-badge";
import { EditableText } from "@/components/cms/editable-text";
import { useUser } from "@/hooks/use-user";
import { Bookmark, Eye, Key, LayoutDashboard, Settings, User as UserIcon } from "lucide-react";

const COURSES = [
  {
    id: '1',
    title: 'Advanced Indigo Web Architecture',
    instructor: 'Dr. Sarah Indigo',
    duration: '12 Hours',
    level: 'Advanced',
    students: '1.2k',
    price: 9900,
    category: 'Architecture',
    image: "https://picsum.photos/seed/indigo1/800/600"
  },
  {
    id: '2',
    title: 'Enterprise Microservices with Node.js',
    instructor: 'Marcus Aurelius',
    duration: '8 Hours',
    level: 'Intermediate',
    students: '800',
    price: 7900,
    category: 'Backend',
    image: "https://picsum.photos/seed/arch/800/600"
  },
  {
    id: '3',
    title: 'UI/UX Excellence: Mastering ShadCN',
    instructor: 'Jessica Walters',
    duration: '15 Hours',
    level: 'Beginner',
    students: '2.5k',
    price: 12900,
    category: 'Frontend',
    image: "https://picsum.photos/seed/ai-design/800/600"
  }
];

export default function CoursesPage() {
  const seoTitle = useContentBlock("courses", "seo", "title", "Curriculum - Explore Our Courses", "text");
  const seoDesc = useContentBlock("courses", "seo", "description", "Explore the XmartyCreator curriculum. Practical frontend, backend, design and software courses.", "text");
  const seoKeywords = useContentBlock("courses", "seo", "keywords", "curriculum, coding courses, next.js, web development", "text");

  const heroTitle = useContentBlock("courses", "catalog", "title", "Course Library", "text");
  const heroSubtitle = useContentBlock("courses", "catalog", "subtitle", "Expert-led courses designed for the enterprise landscape of XmartyCreator.", "text");

  const [moduleFolders, setModuleFolders] = useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; course: any } | null>(null);
  
  const { user } = useUser();
  
  const categories = ["All", "Programming", "Architecture", "Backend", "Frontend", "Placement Prep"];

  useEffect(() => {
    const loadModules = async () => {
      setModulesLoading(true);
      setModulesError('');

      try {
        const res = await fetch('/api/folders?course_id=default');
        if (!res.ok) throw new Error('Failed to load modules');
        const data = await res.json();
        setModuleFolders(data || []);
      } catch (error: any) {
        setModulesError(error.message);
        setModuleFolders([]);
      } finally {
        setModulesLoading(false);
      }
    };

    loadModules();
  }, []);

  const filteredFolders = moduleFolders.filter((folder) => {
    const matchesCategory = selectedCategory === "All" || folder.category === selectedCategory;
    const matchesSearch = folder.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (folder.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (folder.instructor || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-background">
      <title>{seoTitle.value}</title>
      <meta name="description" content={seoDesc.value} />
      <meta name="keywords" content={seoKeywords.value} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
              <CustomizableBadge
                pageSlug="courses"
                sectionKey="catalog"
                badgeKey="badge"
                defaultText="CURRICULUM"
                className="text-primary border-primary/20"
              />
              <h1 className="text-5xl lg:text-7xl font-headline font-bold">
                <EditableText pageSlug="courses" sectionKey="catalog" contentKey="title" defaultValue="Course Library" as="span" />
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                <EditableText pageSlug="courses" sectionKey="catalog" contentKey="subtitle" defaultValue="Expert-led courses designed for the enterprise landscape of XmartyCreator." as="span" />
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search courses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl" 
                />
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <Button 
                key={cat} 
                variant={cat === selectedCategory ? "default" : "outline"} 
                onClick={() => setSelectedCategory(cat)}
                className={cn("rounded-full px-6 font-bold whitespace-nowrap", cat === selectedCategory ? "shadow-lg shadow-primary/20" : "border-2")}
              >
                {cat}
              </Button>
            ))}
          </div>

          {modulesLoading ? (
            <div className="text-center py-24 text-slate-500 animate-pulse">Loading active courses...</div>
          ) : filteredFolders.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-[2rem] p-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No active courses found</p>
              <p className="text-sm mt-1">Try creating a folder or adjusting your category search filters.</p>
            </div>
          ) : (
            /* Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredFolders.map((course, idx) => {
                const priceNum = Number(course.price || 0);
                const displayThumbnail = course.thumbnail_url || `https://picsum.photos/seed/${course.id}/800/600`;

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card 
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          course
                        });
                      }}
                      className="group overflow-hidden rounded-[2rem] border-primary/5 shadow-sm transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {/* Course Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayThumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="bg-white/90 text-black backdrop-blur-sm border-none font-bold">
                            {course.category || "General"}
                          </Badge>
                          <Badge className="bg-accent text-accent-foreground border-none font-bold">
                            {course.level || "Beginner"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">
                          <User className="h-3 w-3" />
                          <span>{course.instructor || "Guest Instructor"}</span>
                        </div>
                        <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 font-medium">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{course.duration || "8 Hours"}</span>
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>{course.students || "120"} Students</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between border-t mt-4 pt-6 bg-muted/20">
                        <span className="text-2xl font-bold text-primary">
                          {priceNum > 0 ? formatINR(priceNum) : "Free"}
                        </span>
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold rounded-xl shadow-lg shadow-primary/20">
                          <Link href={`/courses/${course.slug || course.id}`}>Enroll Now</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Custom Right-Click Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-transparent"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div 
            style={{ 
              top: Math.min(contextMenu.y, typeof window !== 'undefined' ? window.innerHeight - 220 : contextMenu.y), 
              left: Math.min(contextMenu.x, typeof window !== 'undefined' ? window.innerWidth - 220 : contextMenu.x) 
            }}
            className="fixed z-[9999] min-w-[210px] overflow-hidden rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 border-white/10 bg-slate-950/85 text-white"
          >
            <div className="px-3.5 py-2 border-b border-white/5 select-none shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Actions</p>
              <p className="text-xs font-bold text-slate-200 truncate mt-0.5">{contextMenu.course.title}</p>
            </div>

            <div className="p-1 space-y-0.5">
              {/* Common Options */}
              <Link href={`/courses/${contextMenu.course.slug || contextMenu.course.id}`} className="w-full">
                <button className="w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-150 hover:bg-white/10 text-slate-200">
                  <Eye className="h-4 w-4 opacity-80" />
                  <span>{user ? "View Course Content" : "Preview Course"}</span>
                </button>
              </Link>

              {/* Guest Only */}
              {!user && (
                <Link href="/login" className="w-full">
                  <button className="w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-150 hover:bg-white/10 text-slate-200">
                    <Key className="h-4 w-4 opacity-80" />
                    <span>Login to Enroll</span>
                  </button>
                </Link>
              )}

              {/* Student Only */}
              {user && user.role !== 'instructor' && user.role !== 'super_admin' && user.role !== 'staff' && (
                <>
                  <button 
                    onClick={() => {
                      alert(`"${contextMenu.course.title}" has been bookmarked to your profile!`);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-150 hover:bg-white/10 text-slate-200"
                  >
                    <Bookmark className="h-4 w-4 opacity-80" />
                    <span>Bookmark Course</span>
                  </button>
                  <Link href="/profile" className="w-full">
                    <button className="w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-150 hover:bg-white/10 text-slate-200">
                      <UserIcon className="h-4 w-4 opacity-80" />
                      <span>My Profile</span>
                    </button>
                  </Link>
                </>
              )}

              {/* Instructor / Admin Only */}
              {user && (user.role === 'instructor' || user.role === 'super_admin' || user.role === 'staff') && (
                <>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_SUPPORT_SITE_URL || 'http://localhost:4000'}/curriculum-catalog`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <button className="w-full text-left px-3.5 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2.5 transition-all duration-150 hover:bg-violet-500/20 text-violet-400">
                      <Settings className="h-4 w-4" />
                      <span>🚀 Advance Edit (Admin)</span>
                    </button>
                  </a>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_SUPPORT_SITE_URL || 'http://localhost:4000'}/courses`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <button className="w-full text-left px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-all duration-150 hover:bg-blue-500/20 text-blue-400">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>⚙️ Manage course (Admin)</span>
                    </button>
                  </a>
                  <Link href="/profile" className="w-full">
                    <button className="w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-150 hover:bg-white/10 text-slate-200">
                      <UserIcon className="h-4 w-4 opacity-80" />
                      <span>My Profile</span>
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
