'use client';

import { useContentBlock } from '@/hooks/use-content-block';

export default function PrivacyPage() {
  const seoTitle = useContentBlock('privacy', 'seo', 'title', 'Privacy Policy • XmartyCreator', 'text');
  const seoDesc = useContentBlock('privacy', 'seo', 'description', 'Privacy Policy for XmartyCreator.', 'text');

  const headingBlock = useContentBlock('privacy', 'hero', 'heading', 'Privacy Policy', 'text');
  const subtitleBlock = useContentBlock('privacy', 'hero', 'subtitle', 'This policy explains what we collect, why we collect it, and how you control your data.', 'text');

  const dataTitle = useContentBlock('privacy', 'sections', 'dataTitle', 'Data we collect', 'text');
  const dataList = useContentBlock('privacy', 'sections', 'dataList', [
    'Account details you provide (name, email).',
    'Usage signals (pages visited, feature interactions) to improve the product.',
    'Technical data (device, browser) for security and performance.'
  ], 'json');

  const useTitle = useContentBlock('privacy', 'sections', 'useTitle', 'How we use data', 'text');
  const useDesc = useContentBlock('privacy', 'sections', 'useDesc', 'We use data to provide the service, secure accounts, improve UX, and communicate product updates.', 'text');

  const choicesTitle = useContentBlock('privacy', 'sections', 'choicesTitle', 'Your choices', 'text');
  const choicesDesc = useContentBlock('privacy', 'sections', 'choicesDesc', 'You can request data export or deletion by contacting support. Where applicable, you may opt out of certain analytics in your browser settings.', 'text');

  const dataListItems = Array.isArray(dataList.value) ? dataList.value : [
    'Account details you provide (name, email).',
    'Usage signals (pages visited, feature interactions) to improve the product.',
    'Technical data (device, browser) for security and performance.'
  ];

  return (
    <div className="w-full">
      <title>{seoTitle.value}</title>
      <meta name="description" content={seoDesc.value} />

      <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <header className="space-y-4">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">{headingBlock.value}</h1>
          <p className="text-muted-foreground max-w-2xl">
            {subtitleBlock.value}
          </p>
        </header>

        <div className="mt-10 space-y-8">
          <section className="rounded-3xl border bg-card/60 backdrop-blur-sm p-6 md:p-8">
            <h2 className="font-headline text-xl font-semibold">{dataTitle.value}</h2>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
              {dataListItems.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border bg-card/60 backdrop-blur-sm p-6 md:p-8">
            <h2 className="font-headline text-xl font-semibold">{useTitle.value}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {useDesc.value}
            </p>
          </section>

          <section className="rounded-3xl border bg-card/60 backdrop-blur-sm p-6 md:p-8">
            <h2 className="font-headline text-xl font-semibold">{choicesTitle.value}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {choicesDesc.value}
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

