'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Bell, Search, LogOut, User, Home, Info, BookOpen, Users, Newspaper, Mail, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import useTheme from '@/hooks/use-theme';
import { cn } from "@/lib/utils";
import { useCMS } from "@/components/cms-provider";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { EditableText } from '@/components/cms/editable-text';
import { motion } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { settings, refreshSettings } = useCMS();
  const { theme: localTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    // Clear any localStorage session state
    try { localStorage.removeItem('xmarty_session'); } catch {}
    // Hard redirect — clears all React state so useUser() re-reads from cleared cookies
    window.location.href = '/';
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > 50) {
        if (currentScrollY > prevScrollPos) {
          setVisible(false); // scrolling down
        } else {
          setVisible(true); // scrolling up
        }
      } else {
        setVisible(true); // at the top
      }
      setPrevScrollPos(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = 'google-fonts-all-100';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Abel&family=Abril+Fatface&family=Alfa+Slab+One&family=Alice&family=Amatic+SC&family=Anonymous+Pro&family=Archivo+Black&family=Arimo&family=Arizonia&family=Arvo&family=Asap&family=Assistant&family=Barlow&family=Bitter&family=Bree+Serif&family=Bricolage+Grotesque&family=Bungee&family=Cabin&family=Cardo&family=Caveat&family=Chivo&family=Cinzel&family=Comfortaa&family=Cormorant+Garamond&family=Courgette&family=Courier+Prime&family=Crimson+Text&family=Dancing+Script&family=DM+Sans&family=DM+Serif+Display&family=Domine&family=Dosis&family=EB+Garamond&family=Exo+2&family=Fira+Code&family=Fira+Sans&family=Fredoka&family=Garamond&family=Geist&family=Georgia&family=Gloria+Hallelujah&family=Gochi+Hand&family=Great+Vibes&family=Heebo&family=Hind&family=IBM+Plex+Mono&family=IBM+Plex+Sans&family=Inconsolata&family=Indie+Flower&family=Inter&family=JetBrains+Mono&family=Josefin+Sans&family=Kanit&family=Karla&family=Kaushan+Script&family=Lato&family=League+Script&family=Lexend&family=Libre+Baskerville&family=Libre+Franklin&family=Lobster&family=Lora&family=Lustria&family=Manrope&family=Maven+Pro&family=Merriweather&family=Montserrat&family=Mukta&family=Neuton&family=Noto+Sans&family=Noto+Serif&family=Nunito&family=Open+Sans&family=Oswald&family=Outfit&family=Overpass&family=Pacifico&family=Parisienne&family=Permanent+Marker&family=Playfair+Display&family=Plus+Jakarta+Sans&family=Poppins&family=Press+Start+2P&family=Quicksand&family=Raleway&family=Righteous&family=Roboto&family=Roboto+Mono&family=Sacramento&family=Satisfy&family=Space+Grotesk&family=Special+Elite&family=Spectral&family=Tangerine&family=Titan+One&family=Ubuntu&family=Urbanist&family=Varela+Round&family=Work+Sans&family=Yellowtail&family=Yeseva+One&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const toggleTheme = async () => {
    const newMode = localTheme === 'dark' ? 'light' : 'dark';
    setTheme(newMode);
    try {
      const payload = { theme_settings: { themeMode: newMode } };
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      refreshSettings().catch(() => {});
    } catch {}
  };

  useEffect(() => {
    if (settings?.themeMode) setTheme(settings.themeMode);
  }, [settings?.themeMode]);

  const links = [
    { labelKey: 'home', defaultLabel: 'Home', href: '/' },
    { labelKey: 'about', defaultLabel: 'About', href: '/about' },
    { labelKey: 'courses', defaultLabel: 'Courses', href: '/courses' },
    { labelKey: 'community', defaultLabel: 'Community', href: '/community' },
    { labelKey: 'blog', defaultLabel: 'Blog', href: '/blog' },
    { labelKey: 'contact', defaultLabel: 'Contact', href: '/contact' },
  ];

  // All possible bottom nav items
  const allNavItems = {
    home:      { label: 'Home',      href: '/',          icon: Home },
    about:     { label: 'About',     href: '/about',     icon: Info },
    courses:   { label: 'Courses',   href: '/courses',   icon: BookOpen },
    community: { label: 'Community', href: '/community', icon: Users },
    blog:      { label: 'Blog',      href: '/blog',      icon: Newspaper },
    login:     { label: user ? 'Profile' : 'Login', href: user ? '/profile' : '/login', icon: User },
  } as const;

  // Build ordered list from settings, filtering login if disabled
  const savedNavOrder: { id: string }[] = settings?.nav_order || [
    { id: 'home' }, { id: 'about' }, { id: 'courses' }, { id: 'community' }, { id: 'blog' }
  ];
  const loginEnabled: boolean = settings?.login_enabled ?? false;

  const bottomLinks = savedNavOrder
    .filter(item => item.id !== 'login' || loginEnabled)
    .map(item => allNavItems[item.id as keyof typeof allNavItems])
    .filter(Boolean);


  const iconMap: Record<string, any> = {
    '/': Home,
    '/about': Info,
    '/courses': BookOpen,
    '/community': Users,
    '/blog': Newspaper,
    '/contact': Mail,
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updates, setUpdates] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);

  const results = links.filter((l) =>
    (l.defaultLabel || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch('/api/updates');
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json?.data) ? json.data : [];
          setUpdates(items);

          // Calculate unread count based on last seen timestamp stored in localStorage
          const lastSeenTime = localStorage.getItem('xmarty_last_seen_update') || '0';
          const newItems = items.filter((item: any) => {
            const itemTime = new Date(item.created_at || item.updated_at).getTime();
            return itemTime > Number(lastSeenTime);
          });
          setUnreadCount(newItems.length);
        }
      } catch (err) {
        console.error('Failed to load updates in Navbar', err);
      }
    };
    if (mounted) {
      fetchUpdates();
      // Poll every 60 seconds to check for new updates
      const interval = setInterval(fetchUpdates, 60000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  useEffect(() => {
    setBellDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.bell-container') && !target.closest('.bell-container-mobile')) {
        setBellDropdownOpen(false);
      }
    };
    if (bellDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [bellDropdownOpen]);

  return (
    <>
      <nav className={cn(
        "fixed top-0 z-[100] w-full select-none transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-md border-b py-2 shadow-sm" : "bg-background py-3",
        !visible && "-translate-y-full shadow-none"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
                <EditableText
                  pageSlug="navbar"
                  sectionKey="brand"
                  contentKey="siteName"
                  defaultValue="Xmarty Creator"
                  as="span"
                  className="font-headline text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors"
                />
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-primary/5 relative">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={cn(
                      "relative px-5 py-2 text-sm font-bold transition-colors duration-300 rounded-full z-10",
                      isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg shadow-primary/30"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                    <EditableText
                      pageSlug="navbar"
                      sectionKey="menu"
                      contentKey={link.labelKey}
                      defaultValue={link.defaultLabel}
                      as="span"
                      className="text-inherit"
                    />
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <div className="relative bell-container">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setBellDropdownOpen(!bellDropdownOpen);
                    if (!bellDropdownOpen) {
                      setUnreadCount(0);
                      localStorage.setItem('xmarty_last_seen_update', Date.now().toString());
                    }
                  }}
                  className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {bellDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-popover text-popover-foreground shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80">
                      <h4 className="font-bold text-sm">Notifications & Updates</h4>
                      <Link 
                        href="/updates" 
                        onClick={() => setBellDropdownOpen(false)}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {updates.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No recent updates.</p>
                      ) : (
                        updates.slice(0, 4).map((update: any) => (
                          <div 
                            key={update.id || update.slug} 
                            onClick={() => {
                              setBellDropdownOpen(false);
                              router.push('/updates');
                            }}
                            className="group/item flex flex-col gap-1 p-2 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                                {update.tags?.[0] || 'general'}
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(update.created_at || update.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs group-hover/item:text-primary transition-colors line-clamp-1">
                              {update.title}
                            </h5>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {update.excerpt || update.description || ''}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {mounted ? (localTheme === 'dark' ? (
                  <Sun className="h-5 w-5 text-primary" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground hover:text-primary" />
                )) : (
                  <span className="h-5 w-5 inline-block" />
                )}
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSearchOpen(true)}
                className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="secondary" size="sm" asChild className="hover:bg-primary/10 transition-colors">
                <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 px-4 py-2 text-primary hover:text-primary font-bold">
                  <User className="h-4 w-4 text-primary" />
                  <EditableText
                    pageSlug="navbar"
                    sectionKey="menu"
                    contentKey={user ? 'profile' : 'login'}
                    defaultValue={user ? 'Profile' : 'Login'}
                    as="span"
                    className="text-primary hover:text-primary"
                  />
                </Link>
              </Button>

              {user && (
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {mounted ? (localTheme === 'dark' ? (
                  <Sun className="h-5 w-5 text-primary" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground hover:text-primary" />
                )) : (
                  <span className="h-5 w-5 inline-block" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center p-8">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSearchOpen(false)} />
            <div className="relative w-full max-w-xl bg-background rounded-2xl shadow-2xl p-6 border">
              <div className="flex items-center gap-3 border-b pb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchOpen(false);
                      }
                    }
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Search courses, blogs, content... (Cmd/Ctrl+K)"
                  className="w-full bg-transparent outline-none text-lg text-foreground"
                />
                {searchQuery.trim() && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                    }}
                    className="rounded-xl bg-primary text-white text-xs font-bold px-3 py-1.5"
                  >
                    Search
                  </Button>
                )}
              </div>
              
              <div className="mt-4 space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Suggestions</div>
                {results.map((r) => (
                  <a key={r.href} href={r.href} onClick={() => setSearchOpen(false)} className="block p-2.5 rounded-xl hover:bg-muted/60 transition-colors flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-foreground">{r.defaultLabel}</span>
                      <span className="text-xs text-muted-foreground ml-2">({r.href})</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60" />
                  </a>
                ))}
                <div className="text-[10px] text-muted-foreground mt-4 text-center font-medium">
                  Type search query and press <strong>Enter</strong> to explore courses, blogs, and all page contents.
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Floating Navigation for Mobile (Pill Style) */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-background/90 dark:bg-background/95 backdrop-blur-md border border-border/80 rounded-full shadow-2xl py-2 px-3 flex justify-between items-center z-[100]">
        {bottomLinks.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-full transition-all relative flex-1",
                isActive ? "text-primary font-bold animate-pulse" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive ? "scale-110" : "")} />
              <span className="text-[9px] tracking-tight">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
