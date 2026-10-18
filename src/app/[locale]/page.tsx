import type { Metadata } from "next";
import {PcpHome} from "@/components/pcp-home";
import {pcpShareImage} from '@/lib/pcp-metadata';

import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/lib/site-content";
import { jsonLdScript, localizedSeo, organizationId } from "@/lib/seo";

const baseUrl = "https://www.pcpump.com";
const homeMeta: Record<Locale, { title: string; description: string }> = {
  en: { title: "PCP Systems & Artificial Lift Engineering", description: "Explore progressive cavity pumps, elastomer compounds and surface driveheads. Build an engineering inquiry around your well conditions." },
  es: { title: "Sistemas de bombeo y producción petrolera", description: "PCP, levantamiento artificial, perforación, reacondicionamiento y tubulares para proyectos petroleros exigentes." },
  ru: { title: "Насосные системы и оборудование для нефтедобычи", description: "ВН, механизированная добыча, бурение, КРС и трубная продукция для сложных нефтепромысловых проектов." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const meta = homeMeta[locale];
  return {
    title: meta.title,
    description: meta.description,
    ...localizedSeo(locale),
    openGraph: { title: `${meta.title} | PCPUMP.COM`, description: meta.description, url: `${baseUrl}/${locale}`, locale,siteName:'PCPUMP.COM',type:'website',images:[{url:pcpShareImage,width:1200,height:630,alt:'PCP systems. Conditions first.'}] },
    twitter:{card:'summary_large_image',title:`${meta.title} | PCPUMP.COM`,description:meta.description,images:[pcpShareImage]},
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
 const {locale}=await params;
 if(!isLocale(locale)) notFound();
 return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({'@context':'https://schema.org','@type':'WebSite',name:'PCPUMP.COM',url:`${baseUrl}/${locale}`,publisher:{'@id':organizationId}})}/><PcpHome locale={locale}/></>;
}
