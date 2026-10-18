'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {corePath,type siteEvents} from '@/lib/site-events';
declare global {interface Window {__PCP_INTERNAL_QA__?:boolean}}
export function SiteEventTracker({enabled}:{enabled:boolean}){
 const path=usePathname();
 useEffect(()=>{
  if(!enabled||!path||!corePath.test(path)||navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  let stopped=false,started=false;
  const send=(event:typeof siteEvents[number])=>{
   if(stopped)return;
   void fetch('/api/site-events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,path,test:window.__PCP_INTERNAL_QA__===true}),credentials:'omit',referrerPolicy:'origin',keepalive:true}).catch(()=>{});
  };
  send('page_view');
  const onFocus=(event:FocusEvent)=>{if(!started&&(event.target as HTMLElement)?.closest('.inquiry-form')){started=true;send('inquiry_start')}};
  const onClick=(event:MouseEvent)=>{const link=(event.target as HTMLElement)?.closest('a');if(link&&/^\/resources\/pcp-(pumps|elastomers|driveheads)\.csv$/.test(new URL(link.href,location.origin).pathname))send('resource_open')};
  document.addEventListener('focusin',onFocus);document.addEventListener('click',onClick);
  const section=document.querySelector('#specifications,#specs');
  const specifications=section?.querySelector('h2')||section;
  const observer=specifications?new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting&&e.intersectionRatio>=0.5)){send('spec_view');observer?.disconnect()}},{threshold:0.5}):null;
  if(specifications)observer?.observe(specifications);
  return()=>{stopped=true;document.removeEventListener('focusin',onFocus);document.removeEventListener('click',onClick);observer?.disconnect()};
 },[enabled,path]);
 return null;
}
