import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactBand } from "@/components/contact-band";
import { isLocale, type Locale, ui } from "@/lib/site-content";

const baseUrl = "https://www.pcpump.com";
const homeMeta: Record<Locale, { title: string; description: string }> = {
  en: { title: "Oilfield Pumping & Production Systems", description: "PCP, artificial-lift, drilling, workover and tubular equipment configured for demanding oilfield projects." },
  es: { title: "Sistemas de bombeo y producción petrolera", description: "PCP, levantamiento artificial, perforación, reacondicionamiento y tubulares para proyectos petroleros exigentes." },
  ru: { title: "Насосные системы и оборудование для нефтедобычи", description: "ВН, механизированная добыча, бурение, КРС и трубная продукция для сложных нефтепромысловых проектов." },
};

const groups = [
  { slug: "production-equipment", image: "/images/pumping-units-field.webp" },
  { slug: "drilling-equipment", image: "/images/mobile-drilling-rig.webp" },
  { slug: "service-vehicles", image: "/images/coiled-tubing-truck.webp" },
  { slug: "tubular-goods", image: "/images/tubular-goods-warehouse.webp" },
  { slug: "oilfield-services", image: "/images/coiled-tubing-field-service.webp" },
  { slug: "machining", image: "/images/cnc-machining-floor.webp" },
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const meta = homeMeta[locale];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: { en: `${baseUrl}/en`, es: `${baseUrl}/es`, ru: `${baseUrl}/ru`, "x-default": `${baseUrl}/en` },
    },
    openGraph: { title: `${meta.title} | PCPUMP.COM`, description: meta.description, url: `${baseUrl}/${locale}`, locale },
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = ui[locale];
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PCPUMP.COM",
    url: `${baseUrl}/${locale}`,
    email: "sales@pcpump.com",
    description: homeMeta[locale].description,
    areaServed: "Worldwide",
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{copy.homeEyebrow}</p>
          <h1>{copy.homeTitle}</h1>
          <p className="hero-lede">{copy.homeIntro}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href={`/${locale}/request-quote`}>{copy.quote}</Link>
            <Link className="button button-secondary" href={`/${locale}/products`}>{copy.explore}</Link>
          </div>
          <dl className="proof-strip" aria-label="Documented manufacturing scope">
            <div><dt>280+</dt><dd>{copy.homeProof[0]}</dd></div>
            <div><dt>6</dt><dd>{copy.homeProof[1]}</dd></div>
            <div><dt>15,000</dt><dd>{copy.homeProof[2]}</dd></div>
          </dl>
        </div>
        <figure className="hero-media">
          <Image src="/images/pumping-units-field.webp" alt={copy.homeTitle} fill sizes="(max-width: 900px) 100vw, 52vw" priority />
          <figcaption>PCPUMP.COM · {copy.homeEyebrow}</figcaption>
        </figure>
      </section>

      <section className="category-section" aria-labelledby="categories-title">
        <div className="section-heading">
          <p className="eyebrow">280+ / 6</p>
          <h2 id="categories-title">{copy.categoriesTitle}</h2>
          <p>{copy.categoriesIntro}</p>
        </div>
        <div className="category-grid">
          {groups.map((group, index) => (
            <Link className="category-card" href={`/${locale}/${group.slug}`} key={group.slug}>
              <div className="category-image">
                <Image src={group.image} alt={copy.productGroups[index]} fill sizes="(max-width: 760px) 100vw, 33vw" />
              </div>
              <div className="category-copy">
                <span>0{index + 1}</span>
                <h3>{copy.productGroups[index]}</h3>
                <p>{copy.productDescriptions[index]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="capability-story">
        <div className="capability-media">
          <Image src="/images/pcp-stator-production.webp" alt="Progressive cavity pump stator production" fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <div className="capability-copy">
          <p className="eyebrow">PCP · Artificial lift · Field systems</p>
          <h2>{copy.why}</h2>
          <p>{copy.contactBody}</p>
          <div className="capability-links">
            <Link href={`/${locale}/progressive-cavity-pumps`}>PCP systems <span>↗</span></Link>
            <Link href={`/${locale}/quality-and-engineering`}>{copy.navCapabilities} <span>↗</span></Link>
            <Link href={`/${locale}/applications`}>{copy.navIndustries} <span>↗</span></Link>
          </div>
        </div>
      </section>

      <ContactBand locale={locale} />
    </main>
  );
}
