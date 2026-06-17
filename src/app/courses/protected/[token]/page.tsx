import React from 'react';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Play, ArrowLeft, BookOpen, Clock, FileText, CheckCircle, Award, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { CourseFileViewer } from '@/components/course-file-viewer';
import { generateFingerprint, verifySecureAccessToken, createSecureAccessToken } from '@/lib/secure-token';
import { SessionUser } from '@/types/auth';
import { LessonProgress } from '@/components/lesson-progress';

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ProtectedCoursePage({ params }: Props) {
  const { token } = await params;

  // 1. Get client headers for fingerprint generation
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get('user-agent') || '';
  const ip = reqHeaders.get('x-forwarded-for') || '127.0.0.1';
  const fingerprint = generateFingerprint(userAgent, ip);

  // 2. Enforce active authentication session
  const session = (await getSession()) as SessionUser | null;
  if (!session || !session.email) {
    redirect(`/login?redirect=${encodeURIComponent(`/courses/protected/${token}`)}`);
  }

  const sessionEmail = session.email;
  const sessionEmailLower = sessionEmail.toLowerCase();

  // 2.5 Rate Limiter Integration
  const rateLimitKey = sessionEmailLower || ip;
  const { checkRateLimit } = await import('@/lib/rate-limiter');
  const limiterResult = await checkRateLimit({
    key: rateLimitKey,
    action: 'page_access',
    limit: 30, // 30 requests per minute burst protection
    windowMs: 60 * 1000
  });

  if (!limiterResult.allowed) {
    const { logSecurityEvent } = await import('@/lib/audit');
    await logSecurityEvent({
      category: 'RATE_LIMIT_EXCEEDED',
      ip,
      userAgent,
      email: sessionEmail,
      status: 'WARN',
      details: { action: 'protected_token_page' }
    });
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <AlertTriangle className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-headline font-bold text-amber-500 dark:text-amber-400">Too Many Requests</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Rate limit exceeded. Please wait a moment before trying again.
            </CardDescription>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Decode & Verify Secure Access Token
  const payload = await verifySecureAccessToken(token, fingerprint, { ip, userAgent, email: sessionEmail });
  if (!payload) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-rose-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-headline font-bold text-rose-500 dark:text-rose-400">Access Denied</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              The access link is invalid, expired, or bound to a different browser session fingerprint.
            </CardDescription>
          </div>
          <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-205 dark:border-white/5 font-mono text-[10px] text-slate-550 dark:text-slate-500 text-left space-y-1">
            <p>IP Address: {ip}</p>
            <p>Timestamp: {new Date().toISOString()}</p>
            <p>Verification Status: FAILED</p>
          </div>
          <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">
            <Link href="/courses">Return to Catalog</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Verify that the token email matches the active session email
  if (payload.email.toLowerCase() !== sessionEmailLower) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-rose-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-headline font-bold text-rose-500 dark:text-rose-400">Session Mismatch</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              This link was issued to {payload.email}, but you are currently logged in as {sessionEmail}.
            </CardDescription>
          </div>
          <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">
            <Link href="/courses">Return to Catalog</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const db = await getDb();

  // 4. Retrieve Module Details from DB
  const isMongoId = ObjectId.isValid(String(payload.folderId));
  let folder = null;
  if (isMongoId) {
    folder = await db.collection('course_folders').findOne({ _id: new ObjectId(payload.folderId) });
  }
  if (!folder) {
    folder = await db.collection('course_folders').findOne({ slug: payload.folderId });
  }

  if (!folder) {
    redirect('/courses');
  }

  const realFolderId = folder._id?.toString() || null;

  // 5. Fetch Sibling Modules / Playlist for Navigation & Sidebar
  let siblingModules: any[] = [];
  if (folder.parent_folder_id) {
    siblingModules = await db.collection('course_folders')
      .find({ parent_folder_id: folder.parent_folder_id })
      .sort({ sort_order: 1 })
      .toArray();
  }

  // 6. Strict Paid Course Enrollment Verification
  let parentCourse = null;
  if (folder.parent_folder_id) {
    parentCourse = await db.collection('course_folders').findOne({ _id: new ObjectId(folder.parent_folder_id) });
  }

  const isCoursePaid = parentCourse?.price && Number(parentCourse.price) > 0;
  if (isCoursePaid && parentCourse) {
    const userProfile = await db.collection('users').findOne({ email: sessionEmail });
    const enrolledCourses: string[] = userProfile?.enrolled_courses || [];
    const parentCourseIdStr = parentCourse._id?.toString() || '';
    const parentCourseSlug = parentCourse.slug || '';

    const isEnrolled = enrolledCourses.includes(parentCourseIdStr) || enrolledCourses.includes(parentCourseSlug);
    if (!isEnrolled) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <Card className="max-w-md border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Award className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-headline font-bold text-amber-500 dark:text-amber-400">Enrollment Required</CardTitle>
              <CardDescription className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed">
                You must purchase or enroll in this course before accessing premium modules.
              </CardDescription>
            </div>
            <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold">
              <Link href={parentCourse.slug ? `/courses/${parentCourse.slug}` : `/courses/${parentCourseIdStr}`}>
                View Course Page
              </Link>
            </Button>
          </Card>
        </div>
      );
    }
  }

  // 7. Load Module Resource Contents
  let contents: any[] = [];
  if (realFolderId) {
    contents = await db.collection('course_contents')
      .find({ folder_id: realFolderId })
      .sort({ sort_order: 1 })
      .toArray();
  }

  // 8. Navigation Sibling Indexes
  const currentIdx = siblingModules.findIndex((sm: any) => sm._id?.toString() === realFolderId);
  const prevModule = currentIdx > 0 ? siblingModules[currentIdx - 1] : null;
  const nextModule = currentIdx >= 0 && currentIdx < siblingModules.length - 1 ? siblingModules[currentIdx + 1] : null;

  // 9. Fetch lesson completion progress from database
  const courseIdStr = parentCourse?._id?.toString() || parentCourse?.slug || '';
  const progressDoc = await db.collection('course_progress').findOne({
    email: sessionEmailLower,
    courseId: courseIdStr,
  });
  const completedFolderIds: string[] = progressDoc?.completedFolderIds || [];
  const completedCount = siblingModules.filter(sm => 
    completedFolderIds.includes(sm._id?.toString() || '') || 
    (sm.slug && completedFolderIds.includes(sm.slug))
  ).length;

  return (
    <div className="w-full bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-slate-100 min-h-screen pb-16">
      {/* Session Security Banner */}
      <div className="bg-gradient-to-r from-violet-600/20 via-primary/20 to-emerald-600/20 border-b border-slate-200 dark:border-white/5 py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4 animate-pulse" />
            <span>Cryptographic Session Bind Active</span>
          </div>
          <span className="text-violet-600 dark:text-violet-400">Linked to Account: {sessionEmail}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation / Learning Breadcrumbs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/courses" className="hover:text-primary dark:hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="h-3 w-3" />
            {parentCourse && (
              <>
                <Link href={`/courses/${parentCourse.slug || parentCourse._id?.toString()}`} className="hover:text-primary dark:hover:text-white transition-colors">
                  {parentCourse.title}
                </Link>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className="text-slate-800 dark:text-white truncate max-w-[120px] sm:max-w-[200px]">{folder.title}</span>
          </div>

          <Button asChild variant="ghost" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 gap-2 rounded-xl">
            <Link href={folder.parent_folder_id ? `/courses/${folder.parent_folder_id}` : '/courses'}>
              <ArrowLeft className="h-4 w-4" /> Curriculum
            </Link>
          </Button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Module Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 shadow-2xl flex flex-col justify-center items-center text-center p-6">
              <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 dark:from-white via-transparent to-transparent font-mono text-[6vw] flex items-center justify-center font-black">
                {sessionEmail}
              </div>
              
              <div className="space-y-4 max-w-sm relative z-10">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg">
                  <Play className="h-6 w-6 fill-primary ml-1" />
                </div>
                <h3 className="text-lg font-headline font-bold text-slate-800 dark:text-white">Secure Video Player</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Stream protection verified for IP <strong className="text-slate-700 dark:text-slate-300">{ip}</strong>. Session fingerprinting is active.
                </p>
                <Button className="h-10 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-6">
                  Play Lesson Video
                </Button>
              </div>
            </div>

            {/* Next/Prev Navigation Controls */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm">
              {prevModule ? (
                (() => {
                  const prevToken = createSecureAccessToken({
                    courseId: parentCourse?.slug || parentCourse?._id?.toString() || '',
                    folderId: prevModule.slug || prevModule._id?.toString() || '',
                    email: sessionEmail,
                    enrollmentStatus: payload.enrollmentStatus,
                    fingerprint
                  });
                  return (
                    <Button asChild variant="outline" className="h-10 text-xs font-bold border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl gap-1">
                      <Link href={`/courses/protected/${prevToken}`}>
                        <ChevronLeft className="h-4 w-4" /> Previous Lesson
                      </Link>
                    </Button>
                  );
                })()
              ) : (
                <div />
              )}

              {nextModule ? (
                (() => {
                  const nextToken = createSecureAccessToken({
                    courseId: parentCourse?.slug || parentCourse?._id?.toString() || '',
                    folderId: nextModule.slug || nextModule._id?.toString() || '',
                    email: sessionEmail,
                    enrollmentStatus: payload.enrollmentStatus,
                    fingerprint
                  });
                  return (
                    <Button asChild className="h-10 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-xl gap-1">
                      <Link href={`/courses/protected/${nextToken}`}>
                        Next Lesson <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  );
                })()
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle className="h-4 w-4" /> Curriculum Completed!
                </div>
              )}
            </div>

            {/* Persistent Course Progress Component */}
            <LessonProgress
              courseId={courseIdStr}
              folderId={realFolderId || ''}
              isCompleted={completedFolderIds.includes(realFolderId || '') || (folder.slug && completedFolderIds.includes(folder.slug)) || false}
              completedCount={completedCount}
              totalCount={siblingModules.length}
            />

            {/* Lesson Body Overview */}
            <div className="space-y-4 bg-white dark:bg-slate-900/40 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
              <h2 className="text-2xl font-headline font-bold text-slate-900 dark:text-white tracking-tight">{folder.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {folder.description || "Study guides, worksheets, and resources for this module section."}
              </p>
              {folder.body_content && (
                <div
                  className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-white/5 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: folder.body_content }}
                />
              )}
            </div>

            {/* Lesson Files Resource Viewer */}
            <div className="bg-white dark:bg-slate-900/40 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
              <div className="border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-headline font-bold text-slate-800 dark:text-white">Materials &amp; Attachments</h3>
              </div>
              {contents && contents.length > 0 ? (
                <CourseFileViewer
                  items={contents.map((c: any) => ({
                    id: c._id?.toString() || c.id || '',
                    title: c.title || c.file_name || 'Untitled',
                    file_url: `/api/courses/file?token=${token}&fileId=${c._id?.toString() || c.id || ''}`,
                    file_name: c.file_name,
                    item_type: c.item_type,
                    thumbnail_url: c.thumbnail_url,
                  }))}
                />
              ) : (
                <p className="text-center py-6 text-xs text-slate-450 dark:text-slate-500 uppercase font-black tracking-wider">
                  No additional attachments uploaded for this lesson.
                </p>
              )}
            </div>
          </div>

          {/* Sibling Playlist Sidebar */}
          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/60 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/80 p-5 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-primary" />
                  <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">Curriculum Playlist ({siblingModules.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                {siblingModules.map((sm: any, index: number) => {
                  const isCurrent = sm._id?.toString() === realFolderId || sm.id === realFolderId || sm.slug === payload.folderId;
                  const itemToken = createSecureAccessToken({
                    courseId: parentCourse?.slug || parentCourse?._id?.toString() || '',
                    folderId: sm.slug || sm._id?.toString() || '',
                    email: sessionEmail,
                    enrollmentStatus: payload.enrollmentStatus,
                    fingerprint
                  });
                  const isCompleted = completedFolderIds.includes(sm._id?.toString() || '') || (sm.slug && completedFolderIds.includes(sm.slug));

                  return (
                    <Link
                      key={sm._id?.toString() || sm.id}
                      href={`/courses/protected/${itemToken}`}
                      className={`flex gap-3 items-center p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-primary/10 border border-primary/20 text-slate-800 dark:text-white font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      <span className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono transition-colors ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate">{sm.title}</p>
                        <p className="text-[10px] opacity-60">Lesson section</p>
                      </div>
                      {isCurrent && <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
