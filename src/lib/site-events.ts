export const siteEvents=['page_view','spec_view','resource_open','inquiry_start'] as const;
export const corePath=/^\/(en|es|ru)(\/(pcp-systems|downhole-pumps|pcp-elastomers|surface-drive-pcp|engineering-inquiry|request-quote|technical-resources))?$/;
export function validSiteEvent(value:unknown):value is {event:string;path:string;test:boolean}{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const body=value as Record<string,unknown>;
 return Object.keys(body).length===3&&Object.keys(body).every(k=>['event','path','test'].includes(k))&&typeof body.event==='string'&&(siteEvents as readonly string[]).includes(body.event)&&typeof body.path==='string'&&corePath.test(body.path)&&typeof body.test==='boolean';
}
