'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';


interface CMSContextType {
  settings: any;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType>({ settings: null, loading: false, refreshSettings: async () => {} });

export const CMSProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const row = await res.json();
      
      setSettings({
        id: row?.id,
        themeMode: row?.theme_settings?.themeMode || 'light',
        primaryColor: row?.primary_color || '12 90% 55%',
        secondaryColor: row?.secondary_color || row?.primary_color || '12 90% 55%',
        siteName: row?.site_name || 'Xmarty Creator',
        logo: row?.logo || null,
        ...row,
      });
    } catch (error) {
      console.error('Failed to refresh settings', error);
      setSettings({
        themeMode: 'light',
        primaryColor: '12 90% 55%',
        secondaryColor: '12 90% 55%',
        siteName: 'Xmarty Creator',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;

    if (settings.themeMode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings?.themeMode]);

  useEffect(() => {
    if (!settings) return;
    const primary = settings.primaryColor || '231 48% 48%';
    const accent = settings.secondaryColor || primary;

    let styleTag = document.getElementById('cms-dynamic-orchestration');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'cms-dynamic-orchestration';
      document.head.appendChild(styleTag);
    }

    const css = `
      :root {
        --primary: ${primary} !important;
        --primary-foreground: ${primary} !important;
        --ring: ${primary} !important;
        --accent: ${accent} !important;
        --accent-foreground: ${accent} !important;
      }
      .dark {
        --primary: ${primary} !important;
        --primary-foreground: ${primary} !important;
        --ring: ${primary} !important;
        --accent: ${accent} !important;
        --accent-foreground: ${accent} !important;
      }
      .bg-primary { background-color: hsl(${primary}) !important; }
      .text-primary { color: hsl(${primary}) !important; }
      .border-primary { border-color: hsl(${primary}) !important; }
      .decoration-primary { text-decoration-color: hsl(${primary}) !important; }
      .fill-primary { fill: hsl(${primary}) !important; }
      .bg-accent { background-color: hsl(${accent}) !important; }
      .text-accent { color: hsl(${accent}) !important; }
    `;

    styleTag.innerHTML = css;
  }, [settings?.primaryColor, settings?.secondaryColor]);

  return React.createElement(
    CMSContext.Provider,
    { value: { settings, loading, refreshSettings } },
    children
  );
};

export const useCMS = () => useContext(CMSContext);
