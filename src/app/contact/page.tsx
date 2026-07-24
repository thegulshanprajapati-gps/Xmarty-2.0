'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useContentBlock } from "@/hooks/use-content-block";

export default function ContactPage() {
  const seoTitle = useContentBlock("contact", "seo", "title", "Contact Us - Xmarty Creator", "text");
  const seoDesc = useContentBlock("contact", "seo", "description", "Get in touch with the Xmarty Creator support and admissions team.", "text");
  const seoKeywords = useContentBlock("contact", "seo", "keywords", "contact, support, help, email, address", "text");

  const badgeText = useContentBlock("contact", "hero", "badge", "Get In Touch", "text");
  const titleText = useContentBlock("contact", "hero", "title", "How can we help?", "text");
  const subtitleText = useContentBlock("contact", "hero", "subtitle", "Our orchestration support team and Vasant AI are active to assist with your educational pathway.", "text");

  const platformHeading = useContentBlock("contact", "info", "heading", "Platform Channels", "text");
  const platformSub = useContentBlock("contact", "info", "sub", "Have direct questions regarding course catalogs or active connections? Speak to our team.", "text");

  const emailVal = useContentBlock("contact", "channels", "emailVal", "hello@Xmarty Creator.com", "text");
  const emailDesc = useContentBlock("contact", "channels", "emailDesc", "Fast replies within 2-hour cycles.", "text");
  const phoneVal = useContentBlock("contact", "channels", "phoneVal", "+91 98765 43210", "text");
  const phoneDesc = useContentBlock("contact", "channels", "phoneDesc", "Available Mon-Fri (IST).", "text");
  const addressVal = useContentBlock("contact", "channels", "addressVal", "Silicon Valley, Tech Hub Tower", "text");
  const addressDesc = useContentBlock("contact", "channels", "addressDesc", "Central AI management operations.", "text");

  const aiTitle = useContentBlock("contact", "ai", "title", "Vasant AI Agent", "text");
  const aiSub = useContentBlock("contact", "ai", "sub", "Active 24/7. Monitoring ports.", "text");

  return (
    <div className="w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10 sm:py-14">
      <title>{seoTitle.value}</title>
      <meta name="description" content={seoDesc.value} />
      <meta name="keywords" content={seoKeywords.value} />
      
      <main className="max-w-5xl mx-auto px-4 py-2 space-y-8">
        {/* Hero Section - Super Compact & Premium */}
        <section className="text-center max-w-xl mx-auto space-y-3">
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-md font-bold text-xs tracking-widest uppercase">
            {badgeText.value}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-headline font-black tracking-tight text-slate-950 dark:text-white leading-tight" dangerouslySetInnerHTML={{ __html: titleText.value }} />
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {subtitleText.value}
          </p>
        </section>

        {/* Info & Form grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">{platformHeading.value}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {platformSub.value}
              </p>
            </div>

            <div className="space-y-4">
              <ContactInfoItem 
                icon={Mail} 
                title="Support Email" 
                value={emailVal.value} 
                desc={emailDesc.value} 
              />
              <ContactInfoItem 
                icon={Phone} 
                title="Direct Line" 
                value={phoneVal.value} 
                desc={phoneDesc.value} 
              />
              <ContactInfoItem 
                icon={MapPin} 
                title="HQ Orchestration" 
                value={addressVal.value} 
                desc={addressDesc.value} 
              />
            </div>

            <Card className="bg-red-500 text-white border-none rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{aiTitle.value}</p>
                  <p className="opacity-80 text-xs font-semibold">{aiSub.value}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden p-6 bg-white dark:bg-slate-950/40">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white focus-visible:ring-red-500 focus-visible:ring-1 text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@Xmarty Creator.com" 
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white focus-visible:ring-red-500 focus-visible:ring-1 text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Subject</Label>
                  <Input 
                     id="subject" 
                     placeholder="Course catalog configuration" 
                     className="h-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white focus-visible:ring-red-500 focus-visible:ring-1 text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Your Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe how we can support your deployment..." 
                    className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white focus-visible:ring-red-500 focus-visible:ring-1 resize-none text-sm" 
                  />
                </div>
                <Button className="w-full h-11 text-sm font-bold shadow-sm transition-all rounded-lg bg-red-500 hover:bg-red-650 text-white">
                  Submit Form Details
                  <Send className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>
            </Card>
          </div>
          
        </section>
      </main>
    </div>
  );
}

function ContactInfoItem({ icon: Icon, title, value, desc }: any) {
  return (
    <div className="flex gap-3 group">
      <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 shrink-0 border border-red-500/5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-0.5 min-w-0">
        <h4 className="font-bold text-sm leading-tight text-slate-950 dark:text-white">{title}</h4>
        <p className="text-red-600 dark:text-red-400 font-bold text-sm truncate">{value}</p>
        <p className="text-slate-400 dark:text-slate-500 text-xs">{desc}</p>
      </div>
    </div>
  );
}
