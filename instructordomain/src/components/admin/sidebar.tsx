'use client';

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Settings, 
  FileEdit, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Bell, 
  Globe, 
  Image,
  BarChart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Sun,
  Moon,
  Plug,
  ClipboardList,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import NextLink from 'next/link';
import { useCMS } from "@/components/cms-provider";
import { db } from "@/lib/db";
import useTheme from '@/hooks/use-theme';

const MENU_ITEMS = [
  { group: "Analytics", items: [
    { label: "Instructor Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Compliance Audit Logs", icon: ShieldCheck, href: "/security" },
    { label: "Service Connections", icon: Plug, href: "/connections" },
  ]},
  { group: "Course Management", items: [
    { label: "Course Builder", icon: BookOpen, href: "/courses" },
    { label: "Test Builder", icon: ClipboardList, href: "/tests" },
    { label: "Student Reports", icon: BarChart, href: "/assessments/student-reports" },
    { label: "Allotted Certificates", icon: ShieldCheck, href: "/assessments/certificates" },
    { label: "Student Enrollments", icon: Users, href: "/enrollments" },
    { label: "Notification Panel", icon: Bell, href: "/notifications" },
    { label: "Role Matrix", icon: ShieldCheck, href: "/settings/roles" }
  ]}
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { settings, refreshSettings } = useCMS();
  const { theme: localTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      try {
        const { data: { user } } = await db.auth.getUser();
        if (user) {
          const { data: profile } = await db.from('profiles').select('*').eq('email', user.email).single();
          setCurrentUser({
            ...user,
            ...profile
          });
        }
      } catch (e) {
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const toggleTheme = async () => {
    const nextMode = localTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextMode);

    try {
      const payload = {
        site_name: settings?.siteName || 'XmartyCreator',
        theme_settings: { themeMode: nextMode },
      };

      if (settings?.id) {
        db.from('site_settings').update(payload).eq('id', settings.id).catch(() => {});
      } else {
        db.from('site_settings').insert(payload).catch(() => {});
      }
      refreshSettings().catch(() => {});
    } catch (error) {
      console.error('Failed to save theme setting', error);
    }
  };

  React.useEffect(() => {
    if (settings?.themeMode) setTheme(settings.themeMode);
  }, [settings?.themeMode, setTheme]);

  const userRole = currentUser?.role || 'super_admin';

  // Filter links dynamically based on role permissions
  const filteredMenuItems = MENU_ITEMS;

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r-0 bg-gradient-to-b from-amber-50/80 to-orange-50/20 dark:from-amber-950/20 dark:to-transparent border-amber-200/50 dark:border-amber-500/20">
      <SidebarHeader className="border-b h-16 flex items-center px-4 bg-transparent border-amber-200/50 dark:border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs tracking-tighter">XC</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-base leading-tight text-amber-900 dark:text-yellow-400">Xmarty Instructor</span>
            <span className="text-[10px] text-amber-700 dark:text-amber-500 uppercase tracking-widest font-bold">Instructor Console</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-6 bg-transparent">
        {isLoadingUser ? (
          <div className="space-y-6 px-4 animate-pulse">
            {[1, 2, 3].map((g) => (
              <div key={g} className="space-y-3">
                <div className="h-3 w-24 bg-amber-200/50 dark:bg-amber-800/30 rounded" />
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 w-full bg-amber-100/50 dark:bg-amber-900/20 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          filteredMenuItems.map((group) => (
            <SidebarGroup key={group.group} className="mb-4">
              <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700/80 dark:text-amber-500 group-data-[collapsible=icon]:hidden">
                {group.group}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={cn(
                            "transition-all duration-300 rounded-xl h-11 px-4 font-bold text-sm",
                            isActive 
                              ? "bg-amber-500/25 text-amber-950 dark:text-yellow-300 border border-amber-500/30 shadow-sm" 
                              : "text-amber-800/80 hover:text-amber-900 dark:text-yellow-400/80 dark:hover:text-yellow-300 hover:bg-amber-500/10"
                          )}
                        >
                          <NextLink href={item.href}>
                            <item.icon className={cn("w-4 h-4 text-amber-600 dark:text-yellow-500", isActive ? "text-amber-900 dark:text-yellow-300" : "")} />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            {isActive && <ChevronRight className="ml-auto w-3 h-3 group-data-[collapsible=icon]:hidden text-amber-700 dark:text-yellow-500" />}
                          </NextLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t bg-transparent border-amber-200/50 dark:border-amber-500/20">
        <div className="space-y-2">
          <SidebarMenuButton
            className="hover:bg-amber-500/10 text-amber-800 dark:text-yellow-400 group-data-[collapsible=icon]:justify-center h-12 rounded-xl font-bold"
            onClick={toggleTheme}
          >
            {mounted ? (
              localTheme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-amber-600" />
              )
            ) : (
              <span className="w-4 h-4 inline-block" />
            )}
            <span className="group-data-[collapsible=icon]:hidden">
              Switch to {mounted ? (localTheme === "dark" ? "Light" : "Dark") : "..."}
            </span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            className="text-rose-600 hover:bg-rose-500/10 group-data-[collapsible=icon]:justify-center h-12 rounded-xl font-bold"
            onClick={async () => {
              try {
                await db.auth.signOut();
                await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
              } catch (e) {}
              window.location.href = '/';
            }}
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="group-data-[collapsible=icon]:hidden">Exit Orchestration</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
