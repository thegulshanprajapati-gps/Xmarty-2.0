import { Metadata } from 'next';
import './globals.css';
export const dynamic = 'force-dynamic';

import { CMSProvider } from "@/components/cms-provider";
import { ClientLayoutShell } from "@/components/client-layout-shell";
import { getDb } from '@/lib/mongodb';

export const metadata: Metadata = {
  title: {
    default: "Xmarty Creator",
    template: "%s | Xmarty Creator"
  },
  description: "Create and manage certificates, courses, and communities.",
  keywords: ["education", "courses", "certificates", "exam", "learning"],
  authors: [{ name: "Xmarty Creator Team" }],
  openGraph: {
    title: "Xmarty Creator",
    description: "Create and manage certificates, courses, and communities.",
    type: "website"
  }
};

const defaultSettings = {
  themeMode: 'light',
  primaryColor: '#FF0000',
  secondaryColor: '#FF0000',
  siteName: 'Xmarty Creator',
};

function hexToHslString(hex: string): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return '0 100% 50%';
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return `${h || 0} ${Math.round((s || 1) * 100)}% ${Math.round(l * 100)}%`;
}

function normalizeColor(color?: string): string {
  if (!color || typeof color !== 'string') return '0 100% 50%';
  return color.startsWith('#') ? hexToHslString(color) : color;
}

function getReadableForeground(hsl: string): string {
  const match = hsl.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return '0 0% 98%';
  const l = Number(match[3]);
  return l > 60 ? '0 0% 9%' : '0 0% 98%';
}

function buildThemeStyles(settings: any) {
  const primaryColor = settings?.primaryColor || defaultSettings.primaryColor;
  const secondaryColor = settings?.secondaryColor || primaryColor || defaultSettings.secondaryColor;
  const primary = normalizeColor(primaryColor);
  const accent = normalizeColor(secondaryColor);
  const primaryForeground = getReadableForeground(primary);
  const accentForeground = getReadableForeground(accent);
  // SSR-safe font defaults
  const headingsFont = settings?.headingsFont || settings?.headings_font || 'Space Grotesk';
  const bodyFont = settings?.bodyFont || settings?.body_font || 'Inter';
  const sectionHeadingsFont = settings?.sectionHeadingsFont || settings?.section_headings_font || 'Space Grotesk';
  const subtitlesFont = settings?.subtitlesFont || settings?.subtitles_font || 'Inter';
  const buttonsFont = settings?.buttonsFont || settings?.buttons_font || 'Inter';
  const navFont = settings?.navFont || settings?.nav_font || 'Inter';
  const cardsFont = settings?.cardsFont || settings?.cards_font || 'Space Grotesk';
  const codeFont = settings?.codeFont || settings?.code_font || 'JetBrains Mono';
  const badgesFont = settings?.badgesFont || settings?.badges_font || 'Inter';
  const bannersFont = settings?.bannersFont || settings?.banners_font || 'Space Grotesk';

  return `:root{--primary:${primary} !important;--primary-foreground:${primaryForeground} !important;--ring:${primary} !important;--accent:${accent} !important;--accent-foreground:${accentForeground} !important;--font-headings:'${headingsFont}';--font-body:'${bodyFont}';--font-section-headings:'${sectionHeadingsFont}';--font-subtitles:'${subtitlesFont}';--font-buttons:'${buttonsFont}';--font-nav:'${navFont}';--font-cards:'${cardsFont}';--font-code:'${codeFont}';--font-badges:'${badgesFont}';--font-banners:'${bannersFont}';}.dark{--primary:${primary} !important;--primary-foreground:${primaryForeground} !important;--ring:${primary} !important;--accent:${accent} !important;--accent-foreground:${accentForeground} !important;--font-headings:'${headingsFont}';--font-body:'${bodyFont}';--font-section-headings:'${sectionHeadingsFont}';--font-subtitles:'${subtitlesFont}';--font-buttons:'${buttonsFont}';--font-nav:'${navFont}';--font-cards:'${cardsFont}';--font-code:'${codeFont}';--font-badges:'${badgesFont}';--font-banners:'${bannersFont}';}.bg-primary{background-color:hsl(${primary}) !important;}.text-primary{color:hsl(${primary}) !important;}.border-primary{border-color:hsl(${primary}) !important;}.decoration-primary{text-decoration-color:hsl(${primary}) !important;}.fill-primary{fill:hsl(${primary}) !important;}.bg-accent{background-color:hsl(${accent}) !important;}.text-accent{color:hsl(${accent}) !important;} h1,.font-headline{font-family:var(--font-headings) !important;} h2,h3,.font-section-heading{font-family:var(--font-section-headings) !important;} h4,h5,h6,.font-subtitle{font-family:var(--font-subtitles) !important;} body,.font-body{font-family:var(--font-body) !important;} button,.btn{font-family:var(--font-buttons) !important;} nav,.nav-link,.menu-item{font-family:var(--font-nav) !important;} .card-title{font-family:var(--font-cards) !important;} code,pre,.monospace{font-family:var(--font-code) !important;} .badge,.chip,.mini-text{font-family:var(--font-badges) !important;} .banner-accent,.hero-highlight{font-family:var(--font-banners) !important;}`;
}

async function getInitialSettings() {
  try {
    const db = await getDb();
    const row = await db.collection('site_settings').findOne({}, { sort: { updated_at: -1 } });
    if (!row) return defaultSettings;
    return {
      themeMode: row?.theme_settings?.themeMode || defaultSettings.themeMode,
      primaryColor: row?.primary_color || defaultSettings.primaryColor,
      secondaryColor: row?.secondary_color || row?.primary_color || defaultSettings.secondaryColor,
      siteName: row?.site_name || defaultSettings.siteName,
      headingsFont: row?.headings_font || 'Space Grotesk',
      bodyFont: row?.body_font || 'Inter',
      sectionHeadingsFont: row?.section_headings_font || 'Space Grotesk',
      subtitlesFont: row?.subtitles_font || 'Inter',
      buttonsFont: row?.buttons_font || 'Inter',
      navFont: row?.nav_font || 'Inter',
      cardsFont: row?.cards_font || 'Space Grotesk',
      codeFont: row?.code_font || 'JetBrains Mono',
      badgesFont: row?.badges_font || 'Inter',
      bannersFont: row?.banners_font || 'Space Grotesk',
    };
  } catch (error) {
    console.error('Failed to load site settings for SSR', error);
    return defaultSettings;
  }
}

async function getInitialContentBlocks() {
  try {
    const db = await getDb();
    const data = await db.collection('content_blocks').find({}).toArray();
    return data.map((doc: any) => ({
      ...doc,
      id: doc._id.toString(),
      _id: undefined,
    }));
  } catch (error) {
    console.warn('Unable to load initial content blocks for SSR', error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getInitialSettings();
  const contentBlocks = await getInitialContentBlocks();
  const isDark = settings.themeMode === 'dark';

  return (
    <html lang="en" suppressHydrationWarning className={isDark ? 'dark' : undefined}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__XMARTY_INITIAL_SETTINGS = ${JSON.stringify(settings).replace(/</g, '\\u003c')}; window.__XMARTY_INITIAL_CONTENT = ${JSON.stringify(contentBlocks).replace(/</g, '\\u003c')};`,
          }}
        />
        <style
          id="xmarty-theme"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: buildThemeStyles(settings) }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden w-full">
        <div className="flex flex-1 min-h-screen flex-col w-full">
          <CMSProvider initialSettings={settings} initialContentBlocks={contentBlocks}>
            <ClientLayoutShell>
              {children}
            </ClientLayoutShell>
          </CMSProvider>
        </div>
      </body>
    </html>
  );
}
