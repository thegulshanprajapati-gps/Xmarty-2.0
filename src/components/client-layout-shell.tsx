'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VasantAI } from "@/components/vasant-ai";
import { PageTransition } from "@/components/page-transition";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

export function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isPagePending, setIsPagePending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let title = "XmartyCreator";
    if (pathname === '/') {
      title = "Home | XmartyCreator";
    } else if (pathname === '/login') {
      title = "Sign In | XmartyCreator";
    } else if (pathname === '/register') {
      title = "Join Us | XmartyCreator";
    } else if (pathname.startsWith('/profile/settings')) {
      title = "Settings | Student Dashboard";
    } else if (pathname.startsWith('/profile')) {
      title = "Student Dashboard | XmartyCreator";
    } else if (pathname.startsWith('/verify-certificate')) {
      title = "Verify Student Credential | XmartyCreator";
    } else if (pathname.startsWith('/courses')) {
      title = "Browse Courses | XmartyCreator";
    } else if (pathname.startsWith('/community')) {
      title = "Community Hub | XmartyCreator";
    } else if (pathname.startsWith('/blog')) {
      title = "Insight Blogs | XmartyCreator";
    } else if (pathname.startsWith('/test')) {
      title = "Assessment | XmartyCreator";
    } else if (pathname.startsWith('/about')) {
      title = "About Us | XmartyCreator";
    } else if (pathname.startsWith('/contact')) {
      title = "Contact Us | XmartyCreator";
    } else if (pathname.startsWith('/faq')) {
      title = "FAQ | XmartyCreator";
    } else if (pathname.startsWith('/privacy')) {
      title = "Privacy Policy | XmartyCreator";
    } else if (pathname.startsWith('/terms')) {
      title = "Terms of Service | XmartyCreator";
    } else if (pathname.startsWith('/refund')) {
      title = "Refund Policy | XmartyCreator";
    } else if (pathname.startsWith('/updates')) {
      title = "Latest Updates | XmartyCreator";
    } else if (pathname.startsWith('/leaderboard')) {
      title = "Leaderboard Rankings | XmartyCreator";
    } else if (pathname.startsWith('/search')) {
      title = "Search Results | XmartyCreator";
    } else {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const capitalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')).join(' - ');
        title = `${capitalized} | XmartyCreator`;
      }
    }
    document.title = title;
  }, [pathname, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const startTime = Date.now();
    
    // Initial ping
    fetch('/api/security/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: pathname, renderTime: 0 })
    }).catch(() => {});

    // Update time spent every 10 seconds
    const interval = setInterval(() => {
      fetch('/api/security/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: pathname, renderTime: 10 })
      }).catch(() => {});
    }, 10000);

    return () => {
      clearInterval(interval);
      // Final flush
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (elapsed > 0) {
        fetch('/api/security/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: pathname, renderTime: elapsed % 10 }),
          keepalive: true
        }).catch(() => {});
      }
    };
  }, [pathname, mounted]);

  const isHome = pathname === '/';
  const isProfile = pathname === '/profile' || pathname?.startsWith('/profile/');
  const shouldHideSiteChrome = pathname === '/test' || pathname?.startsWith('/test/');

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {!shouldHideSiteChrome && <Navbar />}
      <PageTransition onPendingChange={setIsPagePending}>
        <main
          className={cn(
            "flex-1 w-full max-w-full overflow-x-clip",
            !shouldHideSiteChrome && !isHome && "pt-20"
          )}
        >
          {children}
        </main>
      </PageTransition>
      {!shouldHideSiteChrome && !isPagePending && !isProfile && <Footer />}
      {!shouldHideSiteChrome && !isPagePending && <VasantAI />}
      <Toaster />
    </div>
  );
}
