'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { GOOGLE_FONTS_LIST } from '@/lib/font-list';
import { useCMS } from '@/components/cms-provider';

interface TinyMCEEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TinyMCEEditor({ value, onChange, placeholder, className }: TinyMCEEditorProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [EditorComponent, setEditorComponent] = useState<any>(null);
  const { customFonts } = useCMS();
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'pqssm8ctj174zbor7gv0bdz1solj7nmbugzttwfj2n6287z1';

  useEffect(() => {
    // Detect system theme
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    
    // Listen for changes
    const observer = new MutationObserver(() => {
      const darkActive = document.documentElement.classList.contains('dark');
      setTheme(darkActive ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Client-side dynamic import of the editor to avoid Turbopack chunk issues
    import('@tinymce/tinymce-react')
      .then((mod) => {
        setEditorComponent(() => mod.Editor);
      })
      .catch((err) => {
        console.error("Failed to dynamically load TinyMCE component", err);
      });

    return () => observer.disconnect();
  }, []);

  const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Abel&family=Abril+Fatface&family=Alfa+Slab+One&family=Alice&family=Amatic+SC&family=Anonymous+Pro&family=Archivo+Black&family=Arimo&family=Arizonia&family=Arvo&family=Asap&family=Assistant&family=Barlow&family=Bitter&family=Bree+Serif&family=Bricolage+Grotesque&family=Bungee&family=Cabin&family=Cardo&family=Caveat&family=Chivo&family=Cinzel&family=Comfortaa&family=Cormorant+Garamond&family=Courgette&family=Courier+Prime&family=Crimson+Text&family=Dancing+Script&family=DM+Sans&family=DM+Serif+Display&family=Domine&family=Dosis&family=EB+Garamond&family=Exo+2&family=Fira+Code&family=Fira+Sans&family=Fredoka&family=Garamond&family=Geist&family=Georgia&family=Gloria+Hallelujah&family=Gochi+Hand&family=Great+Vibes&family=Heebo&family=Hind&family=IBM+Plex+Mono&family=IBM+Plex+Sans&family=Inconsolata&family=Indie+Flower&family=Inter&family=JetBrains+Mono&family=Josefin+Sans&family=Kanit&family=Karla&family=Kaushan+Script&family=Lato&family=League+Script&family=Lexend&family=Libre+Baskerville&family=Libre+Franklin&family=Lobster&family=Lora&family=Lustria&family=Manrope&family=Maven+Pro&family=Merriweather&family=Montserrat&family=Mukta&family=Neuton&family=Noto+Sans&family=Noto+Serif&family=Nunito&family=Open+Sans&family=Oswald&family=Outfit&family=Overpass&family=Pacifico&family=Parisienne&family=Permanent+Marker&family=Playfair+Display&family=Plus+Jakarta+Sans&family=Poppins&family=Press+Start+2P&family=Quicksand&family=Raleway&family=Righteous&family=Roboto&family=Roboto+Mono&family=Sacramento&family=Satisfy&family=Space+Grotesk&family=Special+Elite&family=Spectral&family=Tangerine&family=Titan+One&family=Ubuntu&family=Urbanist&family=Varela+Round&family=Work+Sans&family=Yellowtail&family=Yeseva+One&display=swap';

  // Build dynamic @font-face CSS for custom uploaded fonts (served from /fonts/ route)
  const customFontFacesCss = (customFonts || []).map(f => {
    const formatStr = f.format === 'truetype' ? 'truetype' : f.format === 'opentype' ? 'opentype' : f.format;
    const fontUrl = `/fonts/${encodeURIComponent(f.file_name)}`;
    return `@font-face { font-family: '${f.name}'; src: url('${fontUrl}') format('${formatStr}'); font-display: swap; }`;
  }).join(' ');

  // Combined font_family_formats: Google Fonts + custom uploaded fonts
  const allFontsList = [
    ...GOOGLE_FONTS_LIST,
    ...(customFonts || []).map((f: any) => f.name),
  ].sort((a, b) => a.localeCompare(b));

  const fontFormats = allFontsList.map(font => `${font}=${font}`).join('; ');

  // Use CSS variable for body font so TinyMCE respects the active brand font
  const bodyFontVar = typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'Inter, sans-serif'
    : 'Inter, sans-serif';

  if (!EditorComponent) {
    return <div className="h-60 bg-muted/10 animate-pulse rounded-2xl border border-primary/5" />;
  }

  return (
    <div className={cn("border border-primary/10 rounded-2xl overflow-hidden bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all", className)}>
      <EditorComponent
        apiKey={apiKey}
        value={value}
        onEditorChange={(content: string) => onChange(content)}
        init={{
          height: 320,
          menubar: 'insert format table tools help',
          placeholder: placeholder || 'Start writing here...',
          plugins: [
            // Free plugins baseline
            'accordion', 'advlist', 'anchor', 'autolink', 'autoresize', 'autosave',
            'charmap', 'code', 'codesample', 'directionality', 'emoticons', 'fullscreen',
            'help', 'image', 'importcss', 'insertdatetime', 'link', 'lists', 'media',
            'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'save', 'searchreplace',
            'table', 'visualblocks', 'visualchars', 'wordcount',
            
            // Premium plugins - Selected for CMS & Blogging
            'tableofcontents',  // Auto-indexes structure to build navigation tables for blogs
            'footnotes',        // Adds references and academic citations within publications
            'importword'        // Imports Microsoft Word documents directly without format breakage
          ],
          toolbar: 'undo redo | blocks fontfamily | ' +
            'bold italic underline strikethrough forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'table image link media | footnotes tableofcontents importword removeformat code | fullscreen',
          // Dynamic content_style: uses the active brand font from CSS variable, not hardcoded Inter
          content_style: `${customFontFacesCss} body { font-family: ${bodyFontVar}; font-size: 14px; }`,
          font_family_formats: fontFormats,
          skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
          content_css: [theme === 'dark' ? 'dark' : 'default', googleFontsUrl],
          branding: false,
          statusbar: true,
          setup: (editor: any) => {
            editor.on('init', () => {
              editor.getContainer().style.transition = 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out';
            });
          }
        }}
      />
    </div>
  );
}
