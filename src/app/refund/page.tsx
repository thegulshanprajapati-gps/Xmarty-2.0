'use client';

import { useContentBlock } from '@/hooks/use-content-block';

export default function RefundPage() {
  const seoTitle = useContentBlock('refund', 'seo', 'title', 'Refund Policy • Xmarty Creator', 'text');
  const seoDesc = useContentBlock('refund', 'seo', 'description', 'Refund Policy for Xmarty Creator.', 'text');

  const headingBlock = useContentBlock('refund', 'hero', 'heading', 'Refund Policy', 'text');
  const subtitleBlock = useContentBlock('refund', 'hero', 'subtitle', 'We aim to be fair and transparent. Refund eligibility can vary by product and purchase type.', 'text');

  const eligibilityTitle = useContentBlock('refund', 'sections', 'eligibilityTitle', 'Eligibility', 'text');
  const eligibilityList = useContentBlock('refund', 'sections', 'eligibilityList', [
    'Request within a reasonable timeframe from purchase.',
    'Provide order details and the reason for the request.',
    'Some digital goods may be ineligible once substantially consumed.'
  ], 'json');

  const howToTitle = useContentBlock('refund', 'sections', 'howToTitle', 'How to request', 'text');
  const howToDesc = useContentBlock('refund', 'sections', 'howToDesc', 'Contact support through the Contact page with your order ID and email used for purchase. We’ll confirm the outcome by email.', 'text');

  const listItems = Array.isArray(eligibilityList.value) ? eligibilityList.value : [
    'Request within a reasonable timeframe from purchase.',
    'Provide order details and the reason for the request.',
    'Some digital goods may be ineligible once substantially consumed.'
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
            <h2 className="font-headline text-xl font-semibold">{eligibilityTitle.value}</h2>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
              {listItems.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border bg-card/60 backdrop-blur-sm p-6 md:p-8">
            <h2 className="font-headline text-xl font-semibold">{howToTitle.value}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {howToDesc.value}
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

