import type { Metadata } from "next";
import {PcpHome} from "@/components/pcp-home";
import {pcpShareImage} from '@/lib/pcp-metadata';

import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/lib/site-content";
import { brandName, jsonLdScript, localizedSeo, organizationId } from "@/lib/seo";

const baseUrl = "https://www.pcpump.com";
const homeMeta: Record<Locale, { title: string; description: string }> = {
  en: { title: "PCPUMP | Progressive Cavity Pump (PCP) & Artificial Lift", description: "PCPUMP: progressive cavity pump (PCP) systems, stator elastomer compounds and surface driveheads. Build an engineering inquiry around your well conditions." },
  es: { title: "PCPUMP | Sistemas de bombeo y producción petrolera", description: "PCP, levantamiento artificial, perforación, reacondicionamiento y tubulares para proyectos petroleros exigentes." },
  ru: { title: "PCPUMP | Насосные системы и оборудование для нефтедобычи", description: "ВН, механизированная добыча, бурение, КРС и трубная продукция для сложных нефтепромысловых проектов." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const meta = homeMeta[locale];
  return {
    title: { absolute: meta.title },
    description: meta.description,
    ...localizedSeo(locale),
    openGraph: { title: meta.title, description: meta.description, url: `${baseUrl}/${locale}`, locale,siteName:brandName,type:'website',images:[{url:pcpShareImage,width:1200,height:630,alt:'PCP systems. Conditions first.'}] },
    twitter:{card:'summary_large_image',title:meta.title,description:meta.description,images:[pcpShareImage]},
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
 const {locale}=await params;
 if(!isLocale(locale)) notFound();
 return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({'@context':'https://schema.org','@type':'WebSite',name:brandName,alternateName:'pcpump.com',url:`${baseUrl}/${locale}`,publisher:{'@id':organizationId}})}/><PcpHome locale={locale}/></>;
}
