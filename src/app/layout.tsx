import { Metadata } from 'next';
import './globals.css';
import { CMSProvider } from "@/components/cms-provider";
import { ClientLayoutShell } from "@/components/client-layout-shell";
import { getDb } from '@/lib/mongodb';

export const metadata: Metadata = {
  title: {
    default: "XmartyCreator",
    template: "%s | XmartyCreator"
  },
  description: "Create and manage certificates, courses, and communities.",
  keywords: ["education", "courses", "certificates", "exam", "learning"],
  authors: [{ name: "XmartyCreator Team" }],
  openGraph: {
    title: "XmartyCreator",
    description: "Create and manage certificates, courses, and communities.",
    type: "website"
  }
};

const defaultSettings = {
  themeMode: 'light',
  primaryColor: '#FF0000',
  secondaryColor: '#FF0000',
  siteName: 'XmartyCreator',
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
  if (!match) return '210 40% 98%';
  const l = Number(match[3]);
  return l > 60 ? '222 47% 11%' : '210 40% 98%';
}

function buildThemeStyles(settings: any) {
  const primaryColor = settings?.primaryColor || defaultSettings.primaryColor;
  const secondaryColor = settings?.secondaryColor || primaryColor || defaultSettings.secondaryColor;
  const primary = normalizeColor(primaryColor);
  const accent = normalizeColor(secondaryColor);
  const primaryForeground = getReadableForeground(primary);
  const accentForeground = getReadableForeground(accent);
  // SSR-safe font defaults — these are the initial values before CMSProvider overrides them client-side
  const headingsFont = settings?.headingsFont || 'Times New Roman';
  const bodyFont = settings?.bodyFont || 'Times New Roman';

  return `:root{--primary:${primary} !important;--primary-foreground:${primaryForeground} !important;--ring:${primary} !important;--accent:${accent} !important;--accent-foreground:${accentForeground} !important;--font-headings:'${headingsFont}';--font-body:'${bodyFont}';}.dark{--primary:${primary} !important;--primary-foreground:${primaryForeground} !important;--ring:${primary} !important;--accent:${accent} !important;--accent-foreground:${accentForeground} !important;--font-headings:'${headingsFont}';--font-body:'${bodyFont}';}.bg-primary{background-color:hsl(${primary}) !important;}.text-primary{color:hsl(${primary}) !important;}.border-primary{border-color:hsl(${primary}) !important;}.decoration-primary{text-decoration-color:hsl(${primary}) !important;}.fill-primary{fill:hsl(${primary}) !important;}.bg-accent{background-color:hsl(${accent}) !important;}.text-accent{color:hsl(${accent}) !important;}`;
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
      headingsFont: row?.headings_font || 'Times New Roman',
      bodyFont: row?.body_font || 'Times New Roman',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Abel&family=Abril+Fatface&family=Alfa+Slab+One&family=Alice&family=Amatic+SC&family=Anonymous+Pro&family=Archivo+Black&family=Arimo&family=Arizonia&family=Arvo&family=Asap&family=Assistant&family=Barlow&family=Bitter&family=Bree+Serif&family=Bricolage+Grotesque&family=Bungee&family=Cabin&family=Cardo&family=Caveat&family=Chivo&family=Cinzel&family=Comfortaa&family=Cormorant+Garamond&family=Courgette&family=Courier+Prime&family=Crimson+Text&family=Dancing+Script&family=DM+Sans&family=DM+Serif+Display&family=Domine&family=Dosis&family=EB+Garamond&family=Exo+2&family=Fira+Code&family=Fira+Sans&family=Fredoka&family=Garamond&family=Geist&family=Georgia&family=Gloria+Hallelujah&family=Gochi+Hand&family=Great+Vibes&family=Heebo&family=Hind&family=IBM+Plex+Mono&family=IBM+Plex+Sans&family=Inconsolata&family=Indie+Flower&family=Inter&family=JetBrains+Mono&family=Josefin+Sans&family=Kanit&family=Karla&family=Kaushan+Script&family=Lato&family=League+Script&family=Lexend&family=Libre+Baskerville&family=Libre+Franklin&family=Lobster&family=Lora&family=Lustria&family=Manrope&family=Maven+Pro&family=Merriweather&family=Montserrat&family=Mukta&family=Neuton&family=Noto+Sans&family=Noto+Serif&family=Nunito&family=Open+Sans&family=Oswald&family=Outfit&family=Overpass&family=Pacifico&family=Parisienne&family=Permanent+Marker&family=Playfair+Display&family=Plus+Jakarta+Sans&family=Poppins&family=Press+Start+2P&family=Quicksand&family=Raleway&family=Righteous&family=Roboto&family=Roboto+Mono&family=Sacramento&family=Satisfy&family=Space+Grotesk&family=Special+Elite&family=Spectral&family=Tangerine&family=Titan+One&family=Ubuntu&family=Urbanist&family=Varela+Round&family=Work+Sans&family=Yellowtail&family=Yeseva+One&display=swap" rel="stylesheet" />
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
