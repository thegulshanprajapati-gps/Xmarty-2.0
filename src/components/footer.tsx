'use client';

import Link from 'next/link';
import {
  ArrowUp,
  GraduationCap,
  Instagram,
  Linkedin,
  Send,
  Twitter,
  Youtube,
} from 'lucide-react';

import { useCMS } from '@/components/cms-provider';
import { useContentBlock } from '@/hooks/use-content-block';
import { EditableText } from '@/components/cms/editable-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FooterLink = { label: string; href: string };
type FooterLinks = {
  platform: FooterLink[];
  support: FooterLink[];
  legal: FooterLink[];
};

const defaultFooterLinks: FooterLinks = {
  platform: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Courses', href: '/courses' },
    { label: 'Community', href: '/community' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Updates', href: '/updates' },
    { label: 'Verify Certificate', href: '/verify-certificate' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

export function Footer() {
  const { settings } = useCMS();
  const currentYear = new Date().getFullYear();
  const footerLinks = (settings?.footerLinks as FooterLinks | undefined) ?? defaultFooterLinks;

  const aboutTextBlock = useContentBlock(
    'footer',
    'content',
    'aboutText',
    'XmartyCreator: A world-class EdTech ecosystem designed for industrial mastery. We merge architectural excellence with personalized AI mentoring.',
    'text'
  );

  const newsletterHeadingBlock = useContentBlock(
    'footer',
    'content',
    'newsletterHeading',
    'Join 45,000+ creators for weekly tech insights, course launches, and industry updates.',
    'text'
  );

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative overflow-hidden border-t bg-muted/30 pt-20 pb-24 lg:pb-10 select-none">
      {/* Decorative background (always clipped to footer) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 -bottom-40 h-80 bg-gradient-to-t from-primary/10 to-transparent blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
              <span className="font-headline text-2xl font-bold tracking-tight text-primary">
                {settings?.siteName || 'XmartyCreator'}
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              <EditableText
                pageSlug="footer"
                sectionKey="content"
                contentKey="aboutText"
                defaultValue="XmartyCreator: A world-class EdTech ecosystem designed for industrial mastery. We merge architectural excellence with personalized AI mentoring."
                as="span"
                className="text-sm leading-relaxed"
              />
            </p>

            <div className="flex gap-3">
              {[Instagram, Twitter, Youtube, Linkedin].map((Icon, index) => (
                <Link
                  key={index}
                  href="#"
                  aria-label="Social link"
                  className="grid h-10 w-10 place-items-center rounded-xl border bg-background/80 shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Platform
            </h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="mr-0 h-px w-0 bg-primary transition-all group-hover:mr-2 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Support
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="mr-0 h-px w-0 bg-primary transition-all group-hover:mr-2 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Stay Updated
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <EditableText
                pageSlug="footer"
                sectionKey="content"
                contentKey="newsletterHeading"
                defaultValue="Join 45,000+ creators for weekly tech insights, course launches, and industry updates."
                as="span"
                className="text-sm leading-relaxed"
              />
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="h-12 border-2 bg-background/80 focus-visible:ring-primary"
              />
              <Button
                size="icon"
                className="h-12 w-12 shrink-0 bg-primary shadow-lg shadow-primary/20"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-primary/10 pt-10 md:flex-row">
          <p className="text-sm font-medium text-muted-foreground">
            © {currentYear} <EditableText
              pageSlug="footer"
              sectionKey="content"
              contentKey="copyright"
              defaultValue="XmartyCreator"
              as="span"
              className="font-bold text-primary"
            />. All rights reserved.
          </p>

          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="rounded-full border-2 border-primary/20 shadow-sm hover:bg-primary/5"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
