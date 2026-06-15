'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ContentBlock = {
  id: string;
  page_slug: string;
  section_key: string;
  content_key: string;
  value: string | null;
  type: string;
  json_value: any | null;
  created_at: string;
  updated_at: string;
};

export type CustomFont = {
  id: string;
  name: string;
  format: string;
  file_name: string;
  created_at?: string;
};

interface CMSContextType {
  settings: any;
  contentBlocks: ContentBlock[];
  customFonts: CustomFont[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  refreshContentBlocks: () => Promise<void>;
  refreshFonts: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType>({
  settings: null,
  contentBlocks: [],
  customFonts: [],
  loading: false,
  refreshSettings: async () => {},
  refreshContentBlocks: async () => {},
  refreshFonts: async () => {},
});

function hexToHslString(hex?: string): string {
  if (!hex || typeof hex !== 'string') return '0 100% 50%';
  const h = hex.replace('#', '');
  if (h.length !== 6) return '0 100% 50%';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hDeg = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hDeg = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hDeg = (b - r) / d + 2; break;
      case b: hDeg = (r - g) / d + 4; break;
    }
    hDeg = Math.round(hDeg * 60);
  }
  const H = Math.round(hDeg || 0);
  const S = Math.round((s || 1) * 100);
  const L = Math.round(l * 100);
  return `${H} ${S}% ${L}%`;
}

function getReadableForeground(hsl: string): string {
  const match = hsl.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return '210 40% 98%';
  const l = Number(match[3]);
  return l > 60 ? '222 47% 11%' : '210 40% 98%';
}

const defaultSettings = {
  themeMode: 'light',
  primaryColor: '#FF0000',
  secondaryColor: '#FF0000',
  siteName: 'XmartyCreator',
  headingsFont: 'Times New Roman',
  bodyFont: 'Times New Roman',
};

export const CMSProvider = ({ 
  children,
  initialSettings,
  initialContentBlocks
}: { 
  children: React.ReactNode;
  initialSettings?: any;
  initialContentBlocks?: ContentBlock[];
}) => {
  const [settings, setSettings] = useState<any>(initialSettings || defaultSettings);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(initialContentBlocks || []);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshContentBlocks = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      if (!res.ok) throw new Error('Failed to fetch content blocks');
      const data = await res.json();
      setContentBlocks((data || []) as ContentBlock[]);
    } catch (error) {
      console.warn('Failed to refresh content blocks', error);
      setContentBlocks([]);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load site settings');
      const row = await res.json();

      setSettings({
        id: row?.id,
        siteName: row?.site_name || defaultSettings.siteName,
        primaryColor: row?.primary_color || defaultSettings.primaryColor,
        secondaryColor: row?.secondary_color || row?.primary_color || defaultSettings.secondaryColor,
        themeMode: row?.theme_settings?.themeMode || defaultSettings.themeMode,
        headingsFont: row?.headings_font || 'Times New Roman',
        bodyFont: row?.body_font || 'Times New Roman',
        logo: row?.logo || null,
        ...row,
      });
    } catch (error) {
      console.error('Failed to load site settings', error);
      setSettings(defaultSettings);
    }
  }, []);

  const refreshFonts = useCallback(async () => {
    try {
      const res = await fetch('/api/fonts');
      if (!res.ok) throw new Error('Failed to fetch custom fonts');
      const data = await res.json();
      if (data.success && data.fonts) {
        setCustomFonts(data.fonts);
      }
    } catch (error) {
      console.warn('Failed to refresh custom fonts', error);
      setCustomFonts([]);
    }
  }, []);

  useEffect(() => {
    const initCMS = async () => {
      setLoading(true);
      try {
        await Promise.all([refreshSettings(), refreshContentBlocks(), refreshFonts()]);
      } catch (err) {
        console.error('Error initializing CMS', err);
      } finally {
        setLoading(false);
      }
    };
    initCMS();
  }, [refreshSettings, refreshContentBlocks, refreshFonts]);

  useEffect(() => {
    if (!settings) return;
    if (settings.themeMode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings?.themeMode]);

  useEffect(() => {
    if (!settings) return;
    const rawPrimary = settings?.primaryColor || defaultSettings.primaryColor;
    const rawAccent = settings?.secondaryColor || rawPrimary;
    const primary = typeof rawPrimary === 'string' && rawPrimary.startsWith('#') ? hexToHslString(rawPrimary) : String(rawPrimary || defaultSettings.primaryColor);
    const accent = typeof rawAccent === 'string' && rawAccent.startsWith('#') ? hexToHslString(rawAccent) : String(rawAccent || rawPrimary || defaultSettings.secondaryColor);
    const primaryForeground = getReadableForeground(primary);
    const accentForeground = getReadableForeground(accent);

    const activeHeadingsFont = settings?.headingsFont || 'Times New Roman';
    const activeBodyFont = settings?.bodyFont || 'Times New Roman';

    // Generate @font-face style declarations
    const fontFacesCss = customFonts.map(f => {
      const formatStr = f.format === 'truetype' ? 'truetype' : f.format === 'opentype' ? 'opentype' : f.format;
      const fontUrl = `/fonts/${encodeURIComponent(f.file_name)}?v=${f.created_at ? new Date(f.created_at).getTime() : Date.now()}`;
      return `
        @font-face {
          font-family: '${f.name}';
          src: url('${fontUrl}') format('${formatStr}');
          font-display: swap;
        }
      `;
    }).join('\n');

    let styleTag = document.getElementById('cms-dynamic-orchestration');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'cms-dynamic-orchestration';
      document.head.appendChild(styleTag);
    }

    const css = `
      ${fontFacesCss}

      :root {
        --primary: ${primary} !important;
        --primary-foreground: ${primaryForeground} !important;
        --ring: ${primary} !important;
        --accent: ${accent} !important;
        --accent-foreground: ${accentForeground} !important;
        --font-headings: '${activeHeadingsFont}' !important;
        --font-body: '${activeBodyFont}' !important;
      }
      .dark {
        --primary: ${primary} !important;
        --primary-foreground: ${primaryForeground} !important;
        --ring: ${primary} !important;
        --accent: ${accent} !important;
        --accent-foreground: ${accentForeground} !important;
        --font-headings: '${activeHeadingsFont}' !important;
        --font-body: '${activeBodyFont}' !important;
      }

      .bg-primary { background-color: hsl(${primary}) !important; }
      .text-primary { color: hsl(${primary}) !important; }
      .border-primary { border-color: hsl(${primary}) !important; }
      .decoration-primary { text-decoration-color: hsl(${primary}) !important; }
      .fill-primary { fill: hsl(${primary}) !important; }
      .bg-accent { background-color: hsl(${accent}) !important; }
      .text-accent { color: hsl(${accent}) !important; }

      /* Global selector binds */
      h1, h2, h3, h4, h5, h6, .font-headline {
        font-family: var(--font-headings) !important;
      }
      body, .font-body {
        font-family: var(--font-body) !important;
      }
    `;
    styleTag.innerHTML = css;

    // Direct property setting on documentElement
    document.documentElement.style.setProperty('--font-body', `'${activeBodyFont}'`);
    document.documentElement.style.setProperty('--font-headings', `'${activeHeadingsFont}'`);

    // Runtime proof logs
    console.log('Theme Settings:', settings);
    console.log('Body Font DB:', settings.bodyFont || settings.body_font);
    console.log(
      'Applied Font:',
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-body')
    );
  }, [settings?.primaryColor, settings?.secondaryColor, settings?.headingsFont, settings?.bodyFont, customFonts]);

  return (
    <CMSContext.Provider value={{ settings, contentBlocks, customFonts, loading, refreshSettings, refreshContentBlocks, refreshFonts }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => useContext(CMSContext);
