'use client';
import Link from 'next/link';
import {useRef} from 'react';
export function MobileNavigation({links,inquiryHref,inquiryLabel,menuLabel}:{links:string[][];inquiryHref:string;inquiryLabel:string;menuLabel:string}){
 const details=useRef<HTMLDetailsElement>(null);
 return <details className="mobile-menu" ref={details} onKeyDown={event=>{if(event.key==='Escape'&&details.current?.open){details.current.open=false;details.current.querySelector('summary')?.focus()}}}><summary>{menuLabel} <span aria-hidden="true">＋</span></summary><nav aria-label="Mobile navigation" onClick={event=>{if((event.target as HTMLElement).closest('a')&&details.current)details.current.open=false}}>{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}<Link href={inquiryHref}>{inquiryLabel} ↗</Link></nav></details>;
}
