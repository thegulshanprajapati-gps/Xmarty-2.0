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
import { ShieldCheck, Play, ArrowLeft, BookOpen, Clock, User, AlertTriangle } from 'lucide-react';
import { generateFingerprint, verifySecureAccessToken, createSecureAccessToken } from '@/lib/secure-token';
import { SessionUser } from '@/types/auth';

type Props = {
  params: Promise<{ token: string }>;
};

export default async function EnrolledCoursePage({ params }: Props) {
  const { token } = await params;

  // 1. Get client headers for fingerprint generation
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get('user-agent') || '';
  const ip = reqHeaders.get('x-forwarded-for') || '127.0.0.1';
  const fingerprint = generateFingerprint(userAgent, ip);

  // 2. Enforce active authentication session
  const session = (await getSession()) as SessionUser | null;
  if (!session || !session.email) {
    redirect(`/login?redirect=${encodeURIComponent(`/courses/enrolled/${token}`)}`);
  }

  const sessionEmail = session.email;
  const sessionEmailLower = sessionEmail.toLowerCase();

  // 3. Decode & Verify Secure Access Token
  const payload = await verifySecureAccessToken(token, fingerprint, { ip, userAgent, email: sessionEmail });
  if (!payload || payload.folderId !== 'catalog') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-rose-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-headline font-bold text-rose-500 dark:text-rose-400">Link Expired or Reused</CardTitle>
            <CardDescription className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed">
              This dynamic course access link is single-use and changes on every visit. Please re-open the course from your profile tab to get a fresh link.
            </CardDescription>
          </div>
          <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">
            <Link href="/profile?tab=courses">Go to Profile</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Verify that the token email matches the active session email
  if (payload.email.toLowerCase() !== sessionEmailLower) {
    redirect('/profile');
  }

  const db = await getDb();

  // 4. Retrieve Course details
  const isMongoId = ObjectId.isValid(payload.courseId);
  let course = null;
  if (isMongoId) {
    course = await db.collection('course_folders').findOne({ _id: new ObjectId(payload.courseId) });
  } else {
    course = await db.collection('course_folders').findOne({ slug: payload.courseId });
  }

  if (!course) {
    redirect('/profile');
  }

  const courseIdStr = course._id?.toString();

  // Verify enrollment status in database
  const userProfile = await db.collection('users').findOne({ email: sessionEmail });
  const enrolledCourses: string[] = userProfile?.enrolled_courses || [];
  const isEnrolled = enrolledCourses.includes(courseIdStr) || enrolledCourses.includes(course.slug || '');
  
  if (!isEnrolled) {
    redirect('/profile');
  }

  // Fetch all modules of this course
  const modules = await db.collection('course_folders')
    .find({ parent_folder_id: courseIdStr })
    .sort({ sort_order: 1 })
    .toArray();

  return (
    <div className="w-full bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-slate-100 min-h-screen pb-16">
      {/* Session Security Banner */}
      <div className="bg-gradient-to-r from-violet-600/20 via-primary/20 to-emerald-600/20 border-b border-slate-200 dark:border-white/5 py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4 animate-pulse" />
            <span>Secure Student Enrollment Session Bound</span>
          </div>
          <span className="text-violet-600 dark:text-violet-400">IP: {ip} | {sessionEmail}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary border-primary/25 font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5">
              Enrolled Course Area
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-headline font-bold text-slate-800 dark:text-white leading-tight">
              {course.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {course.instructor || "Guest"}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration || "8 Hours"}</span>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs gap-1.5 h-11 shrink-0">
            <Link href="/profile?tab=courses">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Course Description */}
        {course.description && (
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About this Course</h3>
            <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
              {course.description}
            </p>
          </div>
        )}

        {/* Modules / Outline List */}
        <div className="space-y-4">
          <h2 className="text-xl font-headline font-bold text-slate-800 dark:text-white">Course Curriculum ({modules.length})</h2>
          
          {modules.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-[2rem] border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/20">
              <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Curriculum contents are currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {modules.map((mod: any, index: number) => {
                const moduleToken = createSecureAccessToken({
                  courseId: course.slug || courseIdStr || '',
                  folderId: mod.slug || mod._id?.toString() || '',
                  email: sessionEmail,
                  enrollmentStatus: 'enrolled',
                  fingerprint
                }, 10 * 60 * 1000);

                return (
                  <Link 
                    key={mod._id?.toString() || mod.id}
                    href={`/courses/protected/${moduleToken}`}
                    className="group block p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 hover:border-primary/20 dark:hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-primary transition-colors">
                          {mod.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Lesson Module</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/5 hover:bg-primary text-primary hover:text-white shrink-0">
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
