'use client';

import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Award, Users, Rocket, Heart, Twitter, Linkedin, Github } from "lucide-react";
import { useContentBlock } from "@/hooks/use-content-block";
import { CustomizableBadge } from "@/components/cms/customizable-badge";
import { EditableText } from "@/components/cms/editable-text";
import Image from "next/image";

export default function AboutPage() {
  const seoTitle = useContentBlock("about", "seo", "title", "About Us - Xmarty Creator", "text");
  const seoDesc = useContentBlock("about", "seo", "description", "Learn about Xmarty Creator, our story, mission, and how we help creators build real software.", "text");
  const seoKeywords = useContentBlock("about", "seo", "keywords", "about us, mission, story, Xmarty Creator", "text");

  const heroTitle = useContentBlock("about", "hero", "title", "Designing the Future of Tech Education", "text");
  const heroSubtitle = useContentBlock("about", "hero", "subtitle", "We empower builders, designers, and engineers to create state-of-the-art software systems with production-grade architectures.", "text");
  const heroImage = useContentBlock("about", "hero", "image", "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80", "text");

  const storyHeading = useContentBlock("about", "story", "heading", "For Creators, By Architects", "text");
  const storyContent = useContentBlock("about", "story", "content", `<p>In 2021, we set out to build a platform that treated learning like professional development. We didn't just want to teach code; we wanted to teach architectural thinking, scalability, and design excellence.</p><p>Today, Xmarty Creator is home to over 45,000 students globally, powered by the Vasant AI Assistant and mentored by some of the brightest minds in the industry.</p>`, "text");

  const founderBadge = useContentBlock("about", "founder", "badge", "Meet Our Founder", "text");
  const founderName = useContentBlock("about", "founder", "name", "Mukesh Raj", "text");
  const founderTitle = useContentBlock("about", "founder", "title", "Founder & CEO, Xmarty Creator", "text");
  const founderQuote = useContentBlock("about", "founder", "quote", `"Our mission is simple: we don't just teach syntax, we forge digital architects who build production-grade, scalable software from day one."`, "text");
  const founderBio = useContentBlock("about", "founder", "bio", `<p>Mukesh Raj started Xmarty Creator with a vision to revolutionize tech education. With years of experience leading engineering teams and building enterprise architectures, he realized that traditional coursework fails to prepare students for real-world software creation.</p><p>By introducing AI-mentorship (Vasant AI) and codebases that mirror real tech environments, he bridged the gap between learning and architectural execution. Under his leadership, Xmarty Creator has grown into a global community.</p>`, "text");
  const founderBackText = useContentBlock("about", "founder", "back_text", "We believe tech education is not about memorizing commands, but mastering software engineering principles that stand the test of time.", "text");
  const founderBackAdditionalText = useContentBlock("about", "founder", "back_additional_text", "<p>Through hands-on system architecture challenges, live mentoring sessions, and open-source project contributions, we help you transition from a coder to a senior software architect.</p>", "text");
  const founderImageBlock = useContentBlock("about", "founder", "image", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80", "text");
  const founderTwitter = useContentBlock("about", "founder", "twitter", "https://twitter.com", "text");
  const founderLinkedin = useContentBlock("about", "founder", "linkedin", "https://linkedin.com", "text");
  const founderGithub = useContentBlock("about", "founder", "github", "https://github.com", "text");

  const getImageUrl = (imgBlockValue: any) => {
    if (!imgBlockValue) return "";
    if (typeof imgBlockValue === 'string') {
      if (imgBlockValue.trim().startsWith('{')) {
        try {
          return JSON.parse(imgBlockValue).url || imgBlockValue;
        } catch (e) {
          return imgBlockValue;
        }
      }
      return imgBlockValue;
    }
    return imgBlockValue.url || "";
  };

  const values = [
    { title: "Innovation", icon: Rocket, desc: "We push the boundaries of EdTech through AI and modern design." },
    { title: "Quality", icon: Award, desc: "Only the highest standard of industry-relevant curriculum." },
    { title: "Community", icon: Users, desc: "A collaborative ecosystem where creators grow together." },
    { title: "Passion", icon: Heart, desc: "We are educators first, driven by the success of our students." },
  ];

  return (
    <div className="w-full">
      <style>{`
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 3rem;
          overflow: hidden;
        }
        .flip-card-front {
          transform: rotateY(0deg);
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
      <title>{seoTitle.value}</title>
      <meta name="description" content={seoDesc.value} />
      <meta name="keywords" content={seoKeywords.value} />
      <main className="bg-background text-foreground transition-colors duration-300">
        
        {/* Hero */}
        <section className="py-16 md:py-20 relative overflow-hidden bg-slate-500/[0.02] border-b border-slate-200/40 dark:border-slate-800/40">
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-red-500/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <CustomizableBadge
              pageSlug="about"
              sectionKey="hero"
              badgeKey="badge"
              defaultText="OUR STORY"
              className="border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 bg-red-500/5"
            />
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              <EditableText pageSlug="about" sectionKey="hero" contentKey="title" defaultValue="Designing the Future of Tech Education" as="span" />
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              <EditableText pageSlug="about" sectionKey="hero" contentKey="subtitle" defaultValue="We empower builders, designers, and engineers to create state-of-the-art software systems with production-grade architectures." as="span" />
            </p>
          </div>
        </section>

        {/* Mission & Story */}
        <section className="py-16 md:py-20 bg-background border-b border-slate-200/40 dark:border-slate-800/40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <CustomizableBadge
                pageSlug="about"
                sectionKey="story"
                badgeKey="badge"
                defaultText="OUR MISSION"
                className="border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 bg-red-500/5"
              />
              <h2 className="text-4xl lg:text-5xl font-headline font-black text-slate-900 dark:text-white leading-tight">
                <EditableText pageSlug="about" sectionKey="story" contentKey="heading" defaultValue="For Creators, By Architects" as="span" />
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                <EditableText pageSlug="about" sectionKey="story" contentKey="content" defaultValue={`<p>In 2021, we set out to build a platform that treated learning like professional development. We didn't just want to teach code; we wanted to teach architectural thinking, scalability, and design excellence.</p><p>Today, Xmarty Creator is home to over 45,000 students globally, powered by the Vasant AI Assistant and mentored by some of the brightest minds in the industry.</p>`} as="div" />
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg relative aspect-video lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <Image src={getImageUrl(heroImage.value) || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"} alt="Team Workshop" fill className="object-cover" data-ai-hint="team work" />
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-16 md:py-20 bg-slate-500/[0.01] border-b border-slate-200/40 dark:border-slate-800/40 relative overflow-hidden">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row-reverse items-center gap-20 relative z-10">
            <div className="flex-1 space-y-6">
              <CustomizableBadge
                pageSlug="about"
                sectionKey="founder"
                badgeKey="badge"
                defaultText="MEET OUR FOUNDER"
                className="border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 bg-red-500/5"
              />
              <h2 className="text-4xl lg:text-5xl font-headline font-black text-slate-900 dark:text-white leading-tight">
                {String(founderName.value)}
              </h2>
              <p className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-widest -mt-2">
                {String(founderTitle.value)}
              </p>
              
              <div 
                className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: String(founderBio.value) }}
              />
            </div>
            
            <div className="flex-1 w-full max-w-sm aspect-[3/4] flip-card group cursor-pointer">
              <div className="flip-card-inner">
                {/* Front Face */}
                <div className="flip-card-front border border-slate-200 dark:border-slate-800 shadow-xl relative w-full h-full bg-slate-100 dark:bg-slate-900">
                  <Image 
                    src={getImageUrl(founderImageBlock.value)} 
                    alt={`${String(founderName.value)}, Founder`}
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-slate-950/80 backdrop-blur-sm border border-white/10 shadow-lg animate-pulse">
                      Hover to Flip 🔄
                    </span>
                  </div>
                </div>

                {/* Back Face */}
                <div className="flip-card-back bg-gradient-to-br from-white via-slate-50 to-red-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/90 border border-slate-200 dark:border-red-500/20 shadow-2xl p-8 flex flex-col justify-between text-left">
                  <div className="space-y-6 overflow-hidden flex flex-col flex-grow justify-center">
                    <blockquote 
                      className="border-l-4 border-red-500 pl-4 italic text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium"
                      dangerouslySetInnerHTML={{ __html: String(founderQuote.value) }}
                    />
                    <div className="space-y-3">
                      {founderBackText.value && (
                        <div 
                          className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{ __html: String(founderBackText.value) }}
                        />
                      )}
                      {founderBackAdditionalText.value && (
                        <div 
                          className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{ __html: String(founderBackAdditionalText.value) }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Social Links on Back */}
                  <div className="flex gap-2.5 pt-4 border-t border-slate-200 dark:border-white/10 mt-auto shrink-0">
                    {founderTwitter.value && founderTwitter.value !== "#" && (
                      <a href={String(founderTwitter.value)} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-red-500/25 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all border border-slate-200 dark:border-white/5">
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {founderLinkedin.value && founderLinkedin.value !== "#" && (
                      <a href={String(founderLinkedin.value)} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-red-500/25 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all border border-slate-200 dark:border-white/5">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {founderGithub.value && founderGithub.value !== "#" && (
                      <a href={String(founderGithub.value)} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-red-500/25 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all border border-slate-200 dark:border-white/5">
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300 border-b border-slate-200/40 dark:border-slate-800/40">
          {/* Glow spots */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/10 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[250px] h-[250px] bg-rose-500/5 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 space-y-16 relative z-10">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <CustomizableBadge
                pageSlug="about"
                sectionKey="values"
                badgeKey="badge"
                defaultText="OUR VALUES"
                className="border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 bg-red-500/5"
              />
              <h2 className="text-4xl lg:text-5xl font-headline font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                The Pillars of Our Mission
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">
                At Xmarty Creator, we are driven by core standards designed to empower developers and creators globally.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <div key={i} className="p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/20 hover:border-red-500/40 dark:hover:border-red-500/40 hover:shadow-lg dark:hover:bg-slate-900/50 transition-all duration-300 space-y-6 text-center group relative overflow-hidden">
                  <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-500 mx-auto group-hover:scale-110 group-hover:bg-red-500/20 transition-all duration-300">
                    <v.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">{v.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-slate-500/[0.01]">
          <div className="max-w-4xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-4">
              <CustomizableBadge
                pageSlug="about"
                sectionKey="faq"
                badgeKey="badge"
                defaultText="FAQ"
                className="border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 bg-red-500/5"
              />
              <h2 className="text-4xl lg:text-5xl font-headline font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Everything you need to know about the Xmarty Creator ecosystem.</p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                { q: "Is Xmarty Creator suitable for beginners?", a: "Absolutely. Our curriculum starts from foundations and scales to enterprise levels, ensuring anyone with passion can learn." },
                { q: "What makes Vasant AI different?", a: "Vasant is trained specifically on our curriculum to provide context-aware, 24/7 technical guidance that feels like a real tutor." },
                { q: "Do I get a certificate?", a: "Yes, every completed course includes an industry-verified digital certificate that you can share on LinkedIn." },
                { q: "Can I access courses offline?", a: "Our platform is optimized for web access, but all resource materials and code templates are downloadable for offline use." }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 rounded-2xl px-6">
                  <AccordionTrigger className="text-base md:text-lg font-bold hover:no-underline text-slate-900 dark:text-white py-4">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}
