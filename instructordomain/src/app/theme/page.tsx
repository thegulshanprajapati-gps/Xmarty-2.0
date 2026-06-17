'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function ThemeSettings() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 border-amber-200/40 dark:border-amber-500/10">
          <SidebarTrigger />
          <div>
            <h1 className="font-headline font-bold text-xl">Theme Settings</h1>
            <p className="text-xs text-muted-foreground font-medium">Orchestration theme and styles</p>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-2xl mx-auto w-full flex items-center justify-center min-h-[70vh]">
          <Card className="border-amber-500/30 dark:border-amber-500/20 shadow-2xl rounded-[2.5rem] bg-background text-center p-8 space-y-6">
            <CardHeader className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-2xl font-bold text-amber-900 dark:text-yellow-400">
                Theme Orchestration Restricted
              </CardTitle>
              <CardDescription className="text-sm mt-2 max-w-md">
                Global style configurations, colors, and typography settings can only be managed from the central Admin Support Console.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              To update the platform theme, please log into the <strong>Support Console (Admin Console)</strong> and navigate to the <strong>Brand Orchestration</strong> page. Changes made there will propagate to all main and instructor domain interfaces automatically.
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
