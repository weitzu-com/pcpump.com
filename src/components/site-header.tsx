import Link from 'next/link';
import {LanguageSwitcher} from './language-switcher';
import {MobileNavigation} from './mobile-navigation';
import {type Locale} from '@/lib/site-content';
export function SiteHeader({locale}:{locale:Locale}){
 const labels={en:['PCP systems','Other lift systems','Engineering','Resources','Engineering inquiry'],es:['Sistemas PCP','Otros sistemas','Ingeniería','Recursos','Consulta técnica'],ru:['Системы PCP','Другие системы','Инжиниринг','Ресурсы','Технический запрос']}[locale];
 const links=[[`/${locale}/pcp-systems`,labels[0]],[`/${locale}#other-lift-equipment`,labels[1]],[`/${locale}/quality-and-engineering`,labels[2]],[`/${locale}/technical-resources`,labels[3]]];
 return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><Link className="wordmark" href={`/${locale}`} aria-label="PCPUMP.COM home"><span className="brand-symbol" aria-hidden="true">≋</span>PCPUMP<span>.COM</span></Link><nav className="primary-nav" aria-label="Primary navigation">{links.map(([href,t])=><Link key={href} href={href}>{t}</Link>)}<Link className="header-cta" href={`/${locale}/engineering-inquiry`}>{labels[4]} ↗</Link></nav><MobileNavigation links={links} inquiryHref={`/${locale}/engineering-inquiry`} inquiryLabel={labels[4]} menuLabel={{en:"Menu",es:"Menú",ru:"Меню"}[locale]}/><LanguageSwitcher locale={locale}/></header></>
}
