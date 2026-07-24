'use client';

import { useContentBlock } from '@/hooks/use-content-block';

export default function TermsPage() {
  const seoTitle = useContentBlock('terms', 'seo', 'title', 'Terms of Service • Xmarty Creator', 'text');
  const seoDesc = useContentBlock('terms', 'seo', 'description', 'Terms of Service for Xmarty Creator.', 'text');

  const headingBlock = useContentBlock('terms', 'hero', 'heading', 'Terms of Service', 'text');
  const subtitleBlock = useContentBlock('terms', 'hero', 'subtitle', 'By using Xmarty Creator, you agree to these terms. Please read them carefully.', 'text');

  const useTitle = useContentBlock('terms', 'sections', 'useTitle', 'Acceptable use', 'text');
  const useDesc = useContentBlock('terms', 'sections', 'useDesc', 'Do not misuse the service, attempt unauthorized access, or interfere with normal operation.', 'text');

  const accountsTitle = useContentBlock('terms', 'sections', 'accountsTitle', 'Accounts', 'text');
  const accountsDesc = useContentBlock('terms', 'sections', 'accountsDesc', 'You are responsible for safeguarding your credentials and for activity on your account.', 'text');

  const contentTitle = useContentBlock('terms', 'sections', 'contentTitle', 'Content', 'text');
  const contentDesc = useContentBlock('terms', 'sections', 'contentDesc', 'You retain ownership of your content. You grant us permission to host and display it solely to provide the service.', 'text');

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
            <h2 className="font-headline text-xl font-semibold">{useTitle.value}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {useDesc.value}
            </p>
          </section>

          <section className="rounded-3xl border bg-card/60 backdrop-blur-sm p-6 md:p-8">
            <h2 className="font-headline text-xl font-semibold">{accountsTitle.value}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {accountsDesc.value}
            </p>
          </section>

          <section className="rounded-3xl border bg-card/60 backdrop-blur-sm p-6 md:p-8">
            <h2 className="font-headline text-xl font-semibold">{contentTitle.value}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {contentDesc.value}
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

