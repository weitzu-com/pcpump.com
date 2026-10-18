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
import { baseUrl, isRedirected, jsonLdScript, localHref, localizedSeo, organizationId } from "@/lib/seo";
import { pcpProductListJsonLd } from "@/lib/pcp-jsonld";
import { getPage, isLocale, locales, localizePage, pages, type Locale, ui } from "@/lib/site-content";

export const dynamicParams = false;

const homeLabels: Record<Locale, string> = { en: "Home", es: "Inicio", ru: "Главная" };

export function generateStaticParams() {
  return locales.flatMap((locale) => [...new Set([...pages.map(p=>p.slug),...pcpSlugs,'technical-resources'])].filter(slug=>!isRedirected(locale,slug)).map(slug => ({locale,slug})));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getPage(slug);
  if (!isLocale(locale)) return {};
  // /en/progressive-cavity-pumps 308-redirects to /en/pcp-systems (next.config.ts); no metadata of its own.
  // /en/request-quote keeps its own self-referencing canonical (it is a distinct indexed URL with ES/RU equivalents).
  const searchSlug=slug;
  if(pcpSearchMeta[searchSlug]){
    const meta=pcpSearchMeta[searchSlug],url=`${baseUrl}/${locale}/${searchSlug}`;
    return {title:meta.title,description:meta.description,...localizedSeo(locale,searchSlug),openGraph:{title:`${meta.title} | PCPUMP`,description:meta.description,url,siteName:'PCPUMP',type:'website',images:[{url:pcpShareImage,alt:'PCPUMP technical reference and artificial lift equipment'}]},twitter:{card:'summary_large_image',title:`${meta.title} | PCPUMP`,description:meta.description,images:[pcpShareImage]}};
  }
  if (!page) return {};
  const content = localizePage(page, locale);
  const path = `/${locale}/${slug}`;
  return {
    title: content.title,
    description: content.meta,
    ...localizedSeo(locale, slug),
    openGraph: { title: `${content.title} | PCPUMP`, description: content.meta, url: `${baseUrl}${path}`, locale, siteName: "PCPUMP", type: "website", images: [{ url: content.image }] },
    twitter: { card: "summary_large_image", title: `${content.title} | PCPUMP`, description: content.meta, images: [content.image] },
  };
}

export default async function DetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const page = getPage(slug);
  if (!isLocale(locale)) notFound();
  if(slug==='technical-resources')return <PcpResources locale={locale}/>;
  if (locale === "en" && slug === "pcp-systems") return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"WebPage",name:"PCP systems",url:`${baseUrl}/en/${slug}`})}}/><div className="engineering eng-container"><PcpSteps locale={locale} current="pcp-systems"/></div><PcpSystem inquiryPath="/en/engineering-inquiry" /></>;
  if (locale === "en" && slug === "request-quote") return <PcpPage locale={locale} slug="engineering-inquiry"/>;
  if (pcpTitles[slug]) { const products=pcpProductListJsonLd(slug,`${baseUrl}/${locale}/${slug}`); return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({'@context':'https://schema.org','@type':'WebPage',name:pcpTitles[slug],url:`${baseUrl}/${locale}/${slug}`,publisher:{'@id':organizationId}})}/>{products&&<script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(products)}/>}<PcpPage locale={locale} slug={slug}/></>; }
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
    provider: { "@id": organizationId },
    areaServed: "Worldwide",
  } : {
    "@type": "Product",
    name: content.title,
    description: content.meta,
    image: `${baseUrl}${content.image}`,
    brand: { "@type": "Brand", name: "PCPUMP" },
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
              <Link href={localHref(locale, candidate.slug)} key={candidate.slug}>
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
