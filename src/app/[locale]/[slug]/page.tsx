import {PcpPage,PcpSteps} from "@/components/pcp-pages";
import {pcpSlugs,pcpTitles} from "@/lib/pcp-navigation";
import {pcpSearchMeta,pcpShareImage} from "@/lib/pcp-metadata";
import {PcpResources} from "@/components/pcp-resources";
import { PcpSystem } from "@/components/pcp/pcp-system";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactBand } from "@/components/contact-band";
import { getPage, isLocale, locales, localizePage, pages, type Locale, ui } from "@/lib/site-content";

export const dynamicParams = false;
const baseUrl = "https://www.pcpump.com";

const homeLabels: Record<Locale, string> = { en: "Home", es: "Inicio", ru: "Главная" };

export function generateStaticParams() {
  return locales.flatMap((locale) => [...new Set([...pages.map(p=>p.slug),...pcpSlugs,'technical-resources'])].map(slug => ({locale,slug})));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getPage(slug);
  if (!isLocale(locale)) return {};
  const searchSlug=locale==='en'&&slug==='request-quote'?'engineering-inquiry':locale==='en'&&slug==='progressive-cavity-pumps'?'pcp-systems':slug;
  if(pcpSearchMeta[searchSlug]){
    const meta=pcpSearchMeta[searchSlug],url=`${baseUrl}/${locale}/${searchSlug}`;
    return {title:meta.title,description:meta.description,alternates:{canonical:url,languages:{en:`${baseUrl}/en/${searchSlug}`,es:`${baseUrl}/es/${searchSlug}`,ru:`${baseUrl}/ru/${searchSlug}`,'x-default':`${baseUrl}/en/${searchSlug}`}},openGraph:{title:`${meta.title} | PCPUMP.COM`,description:meta.description,url,siteName:'PCPUMP.COM',type:'website',images:[{url:pcpShareImage,alt:'PCPUMP technical reference and artificial lift equipment'}]},twitter:{card:'summary_large_image',title:`${meta.title} | PCPUMP.COM`,description:meta.description,images:[pcpShareImage]}};
  }
  if (!page) return {};
  const content = localizePage(page, locale);
  const path = `/${locale}/${slug}`;
  return {
    title: content.title,
    description: content.meta,
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        en: `${baseUrl}/en/${slug}`,
        es: `${baseUrl}/es/${slug}`,
        ru: `${baseUrl}/ru/${slug}`,
        "x-default": `${baseUrl}/en/${slug}`,
      },
    },
    openGraph: { title: `${content.title} | PCPUMP.COM`, description: content.meta, url: `${baseUrl}${path}`, locale, images: [{ url: content.image }] },
    twitter: { card: "summary_large_image", title: `${content.title} | PCPUMP.COM`, description: content.meta, images: [content.image] },
  };
}

export default async function DetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const page = getPage(slug);
  if (!isLocale(locale)) notFound();
  if(slug==='technical-resources')return <PcpResources locale={locale}/>;
  if (locale === "en" && ["pcp-systems", "progressive-cavity-pumps"].includes(slug)) return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"WebPage",name:"PCP systems",url:`${baseUrl}/en/${slug}`})}}/><div className="engineering eng-container"><PcpSteps locale={locale} current="pcp-systems"/></div><PcpSystem inquiryPath="/en/engineering-inquiry" /></>;
  if (locale === "en" && slug === "request-quote") return <PcpPage locale={locale} slug="engineering-inquiry"/>;
  if (pcpTitles[slug]) return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:pcpTitles[slug],url:`${baseUrl}/${locale}/${slug}`})}}/><PcpPage locale={locale} slug={slug}/></>;
  if (!page) notFound();
  const content = localizePage(page, locale);
  const copy = ui[locale];
  const related = pages.filter((candidate) => candidate.section === page.section && candidate.slug !== page.slug).slice(0, 3);
  if (related.length < 3) {
    related.push(...pages.filter((candidate) => candidate.slug !== page.slug && !related.includes(candidate)).slice(0, 3 - related.length));
  }

  const isService = page.section === "services" || page.slug === "oilfield-services";
  const isCompany = page.section === "company";
  const pageUrl = `${baseUrl}/${locale}/${slug}`;
  const mainEntity = isCompany ? {
    "@type": "WebPage",
    name: content.title,
    description: content.meta,
    url: pageUrl,
  } : isService ? {
    "@type": "Service",
    name: content.title,
    description: content.meta,
    provider: { "@type": "Organization", name: "PCPUMP.COM", email: "sales@pcpump.com" },
    areaServed: "Worldwide",
  } : {
    "@type": "Product",
    name: content.title,
    description: content.meta,
    image: `${baseUrl}${content.image}`,
    brand: { "@type": "Brand", name: "PCPUMP.COM" },
    additionalProperty: content.facts.map((fact) => ({ "@type": "PropertyValue", name: fact.label, value: fact.value })),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      mainEntity,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabels[locale], item: `${baseUrl}/${locale}` },
          { "@type": "ListItem", position: 2, name: content.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <Link href={`/${locale}`}>{homeLabels[locale]}</Link><span>/</span><span aria-current="page">{content.title}</span>
      </div>
      <section className="page-hero">
        <div className="page-hero-copy">
          <p className="eyebrow">PCPUMP.COM / {page.section}</p>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
          <a className="text-link" href="mailto:sales@pcpump.com">sales@pcpump.com <span>↗</span></a>
        </div>
        <figure className="page-hero-media">
          <Image src={content.image} alt={content.title} fill sizes="(max-width: 900px) 100vw, 48vw" priority />
        </figure>
      </section>

      <section className="fact-section" aria-labelledby="fact-title">
        <div className="section-kicker">
          <p className="eyebrow">01 / Data</p>
          <h2 id="fact-title">{copy.documented}</h2>
        </div>
        <dl className="fact-grid">
          {content.facts.map((fact) => <div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>)}
        </dl>
      </section>

      <section className="content-section">
        <div className="section-kicker">
          <p className="eyebrow">02 / System</p>
          <h2>{copy.why}</h2>
        </div>
        <ul className="feature-list">
          {content.bullets.map((bullet, index) => <li key={bullet}><span>0{index + 1}</span><p>{bullet}</p></li>)}
        </ul>
      </section>

      <section className="use-section">
        <article><p className="eyebrow">03 / Application</p><h2>{copy.application}</h2><p>{content.application}</p></article>
        <article><p className="eyebrow">04 / Selection</p><h2>{copy.selection}</h2><p>{content.selection}</p></article>
      </section>

      <section className="related-section" aria-labelledby="related-title">
        <div className="section-heading compact"><p className="eyebrow">05 / Explore</p><h2 id="related-title">{copy.related}</h2></div>
        <div className="related-grid">
          {related.map((candidate) => {
            const item = localizePage(candidate, locale);
            return (
              <Link href={`/${locale}/${candidate.slug}`} key={candidate.slug}>
                <div className="related-image"><Image src={item.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" /></div>
                <h3>{item.title}</h3><span aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </div>
      </section>
      <ContactBand locale={locale} />
    </main>
  );
}
