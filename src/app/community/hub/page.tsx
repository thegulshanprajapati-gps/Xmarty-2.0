'use client';

import { useUser } from "@/hooks/use-user";
import { MessageSquare, Users, Sparkles, Hash, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const channels = [
  {
    id: "general-discussion",
    name: "General Discussion",
    description: "Talk about anything related to Xmarty Creator, programming, or just hang out.",
    icon: <Users className="h-6 w-6" />,
    color: "bg-blue-500",
    members: 1240
  },
  {
    id: "announcements",
    name: "Announcements",
    description: "Official updates, new courses, platform features and important news.",
    icon: <Sparkles className="h-6 w-6" />,
    color: "bg-emerald-500",
    members: 2450
  },
  {
    id: "help-and-support",
    name: "Help & Support",
    description: "Get help with your courses, coding bugs, or platform issues.",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "bg-rose-500",
    members: 890
  }
];

export default function CommunityHubListing() {
  const { user } = useUser();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFCFF] dark:bg-[#030712] py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Community Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            Welcome back{user ? `, ${user.firstName}` : ''}! Select a channel below to join the live conversation with mentors and peers.
          </p>
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <Link 
              key={channel.id} 
              href={`/community/hub/${channel.id}`}
              className="group relative bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/60 p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Top Banner Accent */}
              <div className={cn("absolute top-0 left-0 w-full h-1.5 opacity-80", channel.color)} />
              
              <div className="flex items-start justify-between">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", channel.color, "shadow-" + channel.color.split('-')[1] + "-500/20")}>
                  {channel.icon}
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  {channel.members} online
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold font-headline text-slate-900 dark:text-white flex items-center gap-2">
                  <Hash className="h-5 w-5 text-slate-400" />
                  {channel.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {channel.description}
                </p>
              </div>

              <div className="flex items-center text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
                Join Channel <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
