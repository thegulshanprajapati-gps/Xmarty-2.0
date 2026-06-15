import React from 'react';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isUUID } from '@/lib/validators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, BookOpen, ChevronRight, FileText, Download, Award, Compass, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/format';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { generateFingerprint, createSecureAccessToken } from '@/lib/secure-token';
import { SessionUser } from '@/types/auth';
import { CourseFileViewer } from '@/components/course-file-viewer';

type Props = {
  params: Promise<{ folderId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { folderId } = await params;
  const isMongoId = ObjectId.isValid(String(folderId));
  const db = await getDb();
  
  let folder = null;
  if (isMongoId) {
    folder = await db.collection('course_folders').findOne({ _id: new ObjectId(folderId) });
  }
  if (!folder) {
    folder = await db.collection('course_folders').findOne({ slug: folderId });
  }

  return {
    title: folder?.meta_title || folder?.title || 'Course Details',
    description: folder?.meta_description || folder?.description || 'Learn and excel with this premium course.',
    keywords: folder?.keywords || '',
    openGraph: {
      title: folder?.meta_title || folder?.title || 'Course Details',
      description: folder?.meta_description || folder?.description || '',
      images: folder?.thumbnail_url ? [{ url: folder.thumbnail_url }] : [],
    },
  };
}

export default async function CourseFolderPage({ params }: Props) {
  const { folderId } = await params;

  const reqHeaders = await headers();
  const userAgent = reqHeaders.get('user-agent') || '';
  const ip = reqHeaders.get('x-forwarded-for') || '127.0.0.1';
  const fingerprint = generateFingerprint(userAgent, ip);

  const session = (await getSession()) as SessionUser | null;
  const sessionEmail = session?.email || '';
  const sessionEmailLower = sessionEmail.toLowerCase();

  const isMongoId = ObjectId.isValid(String(folderId));
  const db = await getDb();
  
  let folder = null;
  if (isMongoId) {
    folder = await db.collection('course_folders').findOne({ _id: new ObjectId(folderId) });
  }
  if (!folder) {
    folder = await db.collection('course_folders').findOne({ slug: folderId });
  }

  // If this is a subfolder (section/module within a course), restrict access to registered/logged-in users.
  if (folder && folder.parent_folder_id) {
    if (!session) {
      // Redirect to login with a ?redirect= param so user is bounced back after sign-in
      const returnUrl = encodeURIComponent(`/courses/${folderId}`);
      redirect(`/login?redirect=${returnUrl}`);
    }
  }

  // Prevent student/public access to unapproved courses
  if (folder && folder.approved === false) {
    const canViewUnapproved = session && (session.role === 'instructor' || session.role === 'admin' || session.role === 'super_admin' || session.role === 'staff' || session.role === 'support');
    if (!canViewUnapproved) {
      redirect('/unauthorized?reason=unapproved_course');
    }
  }

  const realFolderId = folder?._id?.toString() || null;

  // Record telemetry traffic view on server load
  if (folder) {
    db.collection('security_logs').insertOne({
      ip,
      route: `/courses/${folder.slug || realFolderId}`,
      renderTime: 1,
      userAgent,
      timestamp: new Date()
    }).catch(() => {});
  }

  // Retrieve sub-sections/lessons and files
  let subfolders: any[] = [];
  let contents: any[] = [];
  let overviewContents: any[] = [];

  if (folder) {
    if (!folder.parent_folder_id) {
      // Root course folder: find "Content" subfolder (case-insensitive) and traverse it
      const rootSubfolders = await db.collection('course_folders')
        .find({ parent_folder_id: realFolderId })
        .sort({ sort_order: 1 })
        .toArray();

      // Get overview contents (any files uploaded directly in the root course folder)
      overviewContents = await db.collection('course_contents')
        .find({ folder_id: realFolderId })
        .sort({ sort_order: 1 })
        .toArray();

      const contentFolder = rootSubfolders.find((sf: any) => sf.title.toLowerCase() === 'content');
      if (contentFolder) {
        const contentFolderId = contentFolder._id.toString();

        // Show modules inside "Content" subfolder
        subfolders = await db.collection('course_folders')
          .find({ parent_folder_id: contentFolderId })
          .sort({ sort_order: 1 })
          .toArray();

        // Show files inside "Content" subfolder + inside any FREE subfolder/module
        const freeSubfolderIds = subfolders
          .filter((sf: any) => !sf.is_paid)
          .map((sf: any) => sf._id.toString());

        const allowedFolderIds = [contentFolderId, ...freeSubfolderIds];

        contents = await db.collection('course_contents')
          .find({ folder_id: { $in: allowedFolderIds } })
          .sort({ sort_order: 1 })
          .toArray();
      } else {
        // Fallback: exclude 'thumbnail' & '.thumbnail' folder
        subfolders = rootSubfolders.filter((sf: any) => sf.title.toLowerCase() !== 'thumbnail' && sf.title.toLowerCase() !== '.thumbnail');
        contents = await db.collection('course_contents')
          .find({ folder_id: realFolderId })
          .sort({ sort_order: 1 })
          .toArray();
      }

      // Ensure we exclude thumbnail folders anywhere in root folders listing
      subfolders = subfolders.filter((sf: any) => sf.title.toLowerCase() !== 'thumbnail' && sf.title.toLowerCase() !== '.thumbnail');
    } else {
      // Subfolder/lesson page: show its own subfolders and files
      subfolders = await db.collection('course_folders')
        .find({ parent_folder_id: realFolderId })
        .sort({ sort_order: 1 })
        .toArray();

      contents = await db.collection('course_contents')
        .find({ folder_id: realFolderId })
        .sort({ sort_order: 1 })
        .toArray();

      subfolders = subfolders.filter((sf: any) => sf.title.toLowerCase() !== 'thumbnail' && sf.title.toLowerCase() !== '.thumbnail');
    }
  }

  const priceNum = Number(folder?.price || 0);
  let enrollmentStatus = 'none';
  if (sessionEmail && folder) {
    const userProfile = await db.collection('users').findOne({ email: sessionEmail });
    const enrolledCourses: string[] = userProfile?.enrolled_courses || [];
    const parentCourseIdStr = folder._id?.toString() || '';
    const parentCourseSlug = folder.slug || '';
    const isEnrolled = enrolledCourses.includes(parentCourseIdStr) || enrolledCourses.includes(parentCourseSlug);
    if (priceNum === 0 || isEnrolled) {
      enrollmentStatus = 'active';
    }
  }

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Hero Header Section */}
      <div className="border-b bg-muted/15 relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full">
                {folder?.category || "General"}
              </Badge>
              <Badge className="bg-accent text-accent-foreground border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full">
                {folder?.level || "Beginner"}
              </Badge>
              {folder?.is_paid ? (
                <Badge className="bg-amber-500/10 text-amber-500 border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full">Premium Access</Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full">Free Access</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Title & Short Description */}
              <div className="lg:col-span-2 space-y-6">
                <h1 className="text-4xl sm:text-6xl font-headline font-bold leading-tight tracking-tight text-foreground">
                  {folder?.title || 'Course Details'}
                </h1>
                
                {/* Telemetry info row */}
                <div className="flex flex-wrap gap-6 text-sm font-semibold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>Instructor: <strong className="text-foreground font-bold">{folder?.instructor || "Guest Specialist"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>Duration: <strong className="text-foreground font-bold">{folder?.duration || "8 Hours"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>Enrollments: <strong className="text-foreground font-bold">{folder?.students || "120"} students</strong></span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-base sm:text-lg text-muted-foreground leading-relaxed">
                  <p>{folder?.description || 'Learn and excel with this premium course module tailored on XmartyCreator.'}</p>
                </div>

                {/* Rich Body Content from Course Editor */}
                {folder?.body_content && (
                  <div
                    className="prose dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed mt-4"
                    dangerouslySetInnerHTML={{ __html: folder.body_content }}
                  />
                )}
              </div>

              {/* Side Pricing Card */}
              <Card className="border-primary/10 shadow-2xl rounded-[2rem] overflow-hidden bg-background">
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={folder?.thumbnail_url || `https://picsum.photos/seed/${realFolderId}/800/600`}
                    alt={folder?.title || "Course"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Investment</span>
                  <div className="text-3xl font-headline font-black text-primary">
                    {priceNum > 0 ? formatINR(priceNum) : 'Free Enrollment'}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <Button className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                    Enroll in Course
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground font-medium">30-day money-back guarantee & certificate included.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Course Curriculum & Contents */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content (Curriculum Structure) */}
          <div className="lg:col-span-2 space-y-10">
            {overviewContents && overviewContents.length > 0 && (
              <section className="space-y-6">
                <div className="border-b pb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-headline font-bold">Course Overview & Introductory Files</h2>
                </div>
                <CourseFileViewer
                  items={overviewContents.map((c: any) => {
                    const secureToken = createSecureAccessToken({
                      courseId: folder?.slug || folder?._id?.toString() || '',
                      folderId: folder?._id?.toString() || '',
                      email: sessionEmail,
                      enrollmentStatus,
                      fingerprint: fingerprint
                    });
                    return {
                      id: c._id?.toString() || c.id || '',
                      title: c.title || c.file_name || 'Untitled',
                      file_url: sessionEmail
                        ? `/api/courses/file?token=${secureToken}&fileId=${c._id?.toString() || c.id || ''}`
                        : c.file_url,
                      file_name: c.file_name,
                      item_type: c.item_type,
                      thumbnail_url: c.thumbnail_url,
                    };
                  })}
                />
              </section>
            )}

            {subfolders && subfolders.length > 0 && (
              <section className="space-y-6">
                <div className="border-b pb-3 flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-headline font-bold">Course Lessons & Sections</h2>
                </div>
                <div className="space-y-4">
                  {subfolders.map((sf: any) => {
                    const secureToken = createSecureAccessToken({
                      courseId: folder?.slug || folder?._id?.toString() || '',
                      folderId: sf.slug || sf._id?.toString() || '',
                      email: sessionEmail,
                      enrollmentStatus,
                      fingerprint: fingerprint
                    });
                    return (
                      <Card key={sf._id?.toString() || sf.id} className="rounded-2xl border-primary/5 hover:border-primary/20 transition-colors shadow-sm group">
                        <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
                          <div className="space-y-1">
                            <CardTitle className="text-lg font-headline font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                              📂 {sf.title}
                            </CardTitle>
                            <CardDescription className="text-xs leading-relaxed">{sf.description}</CardDescription>
                          </div>
                          {sf.is_paid ? (
                            <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] uppercase tracking-wider font-bold">Paid</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase tracking-wider font-bold">Free</Badge>
                          )}
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                          <div className="flex justify-end pt-2">
                            <Button asChild variant="outline" size="sm" className="rounded-xl flex items-center gap-1">
                              <Link href={`/courses/protected/${secureToken}`}>
                                Get Content <ChevronRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="space-y-6">
              <div className="border-b pb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-headline font-bold">Files &amp; Resources</h2>
              </div>

              <CourseFileViewer
                items={contents.map((c: any) => ({
                  id: c._id?.toString() || c.id || '',
                  title: c.title || c.file_name || 'Untitled',
                  file_url: c.file_url || '',
                  file_name: c.file_name,
                  item_type: c.item_type,
                  thumbnail_url: c.thumbnail_url,
                }))}
              />
            </section>
          </div>

          {/* Sidebar Specs Panel */}
          <div className="space-y-6">
            <Card className="border-primary/5 rounded-[2rem] p-6 space-y-6 bg-muted/5">
              <h3 className="font-headline text-lg font-bold border-b pb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Certificate program
              </h3>
              <ul className="space-y-4 text-xs font-semibold text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>100% Online & self-paced schedule</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Interactive quizzes and downloadable resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Official certification accredited by XmartyCreator</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
