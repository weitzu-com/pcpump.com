import { randomUUID } from 'node:crypto';
import { pumps,materials,drives } from '@/lib/pcp-data';
import { smtpConfiguration } from '@/lib/inquiry-delivery-config';
import { sendEngineeringMail } from '@/lib/inquiry-mail';
export const runtime='nodejs';
export const maxDuration=30;
export async function POST(request:Request){
 const response=(message:string,status:number)=>Response.json({message},{status,headers:{'Cache-Control':'no-store'}});
 const requestUrl=new URL(request.url);const scheme=request.headers.get('x-forwarded-proto')?.split(',')[0].trim()||requestUrl.protocol.slice(0,-1);const publicOrigin=`${scheme}://${request.headers.get('host')||requestUrl.host}`;const origin=request.headers.get('origin');if(!origin||origin!==publicOrigin)return response('This request must originate from the website.',403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return response('JSON is required.',415);
 let body;try{const reader=request.body?.getReader();if(!reader)return response('Empty inquiry.',400);let raw='';const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;raw+=decoder.decode(value,{stream:true});if(raw.length>20000){await reader.cancel();return response('The inquiry is too long.',413)}}body=JSON.parse(raw)}catch{return response('The inquiry could not be read.',400)}
 const fields=body?.fields,selection=body?.selection||{};
 if(!fields||typeof fields!=='object'||Array.isArray(fields))return response('Contact information is required.',400);
 if(fields.website)return response('The inquiry could not be accepted.',400);
 for(const k of ['name','company','country','details','email'])if(typeof fields[k]!=='string'||!fields[k].trim())return response('Complete the required contact and project fields.',400);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)||fields.email.length>254)return response('Enter a valid email address.',400);
 if(Object.entries(fields).length>24||Object.entries(fields).some(([k,v])=>k.length>100||typeof v!=='string'||v.length>(k==='details'?3000:254)))return response('One or more fields exceed the allowed length.',400);
 if(typeof selection!=='object'||Array.isArray(selection)||Object.keys(selection).some(k=>!['pump','material','drive'].includes(k)))return response('Invalid equipment candidates.',400);
 if(!['Surface-driven PCP','ESPCP','Reciprocating lift','Drive upgrade','Not sure yet'].includes(body.system))return response('Choose a supported system.',400);
 for(const [key,items] of Object.entries({pump:pumps,material:materials,drive:drives}))if(selection[key]&&!items.some(i=>i.model===selection[key]))return response('A shortlisted model is not recognized.',400);
 const id=body.id||randomUUID();
 if(typeof id!=='string'||!/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(id)||id.length!==36)return response('Invalid inquiry reference. Review your brief and retry.',400);
 if(process.env.INQUIRY_RECEIVER_URL){
  const reference=`PCP-${id}`;
  const inquiry={reference,system:body.system,fields,selection,receivedAt:new Date().toISOString()};
  try{
   const target=new URL(process.env.INQUIRY_RECEIVER_URL);
   if(target.protocol!=='https:')return response('The inquiry receiver is unavailable.',503);
   const upstream=await fetch(target,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.pcpump.com'},body:JSON.stringify(inquiry),signal:AbortSignal.timeout(10000),redirect:'error'});
   if(upstream.status===409)return response('Your details differ from an earlier submission. Review your brief and submit again.',409);
   if(!upstream.ok)return response('The inquiry could not be saved. Your details are still here; keep your brief and retry later.',upstream.status===429?429:502);
   const receipt=await upstream.json();
   if(receipt.status!=='persisted'||receipt.reference!==reference||typeof receipt.receivedAt!=='string')return response('The receiving service did not provide a verified receipt. Keep your brief.',502);
   let notification=receipt.notification==='accepted_by_email_service'?'accepted_by_email_service':'pending';
   if(receipt.created===true&&notification==='pending'&&process.env.INQUIRY_MAIL_PROVIDER!=='cloudflare'&&smtpConfiguration()){
    try{await sendEngineeringMail({...inquiry,receivedAt:receipt.receivedAt});notification='accepted_by_mail_server'}catch{notification='pending'}
   }
   return Response.json({reference,status:'persisted',receivedAt:receipt.receivedAt,notification},{headers:{'Cache-Control':'no-store'}});
  }catch{return response('A saved receipt could not be confirmed. Your inquiry may have arrived. Retry with the same brief or contact sales@pcpump.com.',502)}
 }
 if(smtpConfiguration()){
  const reference=`PCP-${randomUUID()}`;
  try{
   const result=await sendEngineeringMail({reference,system:body.system,fields,selection,receivedAt:new Date().toISOString()});
   return Response.json({reference,status:result.status},{headers:{'Cache-Control':'no-store'}});
  }catch{return response('The mail server did not confirm acceptance. Your inquiry may not have been delivered. Keep your brief and contact sales@pcpump.com.',502)}
 }
 const destination=process.env.INQUIRY_WEBHOOK_URL;
 if(!destination)return response('Online delivery is not connected. Download your brief or open an email draft to sales@pcpump.com. Your inquiry has not been sent.',503);
 let target;try{target=new URL(destination);if(target.protocol!=='https:'&&!(process.env.NODE_ENV==='development'&&target.hostname==='127.0.0.1'))return response('The inquiry service is unavailable.',503)}catch{return response('The inquiry service is unavailable.',503)}
 const reference=`PCP-${randomUUID()}`;
 try{const upstream=await fetch(target,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.INQUIRY_WEBHOOK_TOKEN?{Authorization:`Bearer ${process.env.INQUIRY_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({reference,system:body.system,fields,selection,receivedAt:new Date().toISOString()}),signal:AbortSignal.timeout(10000),redirect:'error'});if(!upstream.ok)return response('The inquiry service did not accept the request. Download your brief and email it.',502);return Response.json({reference,status:'accepted_by_inquiry_service'},{headers:{'Cache-Control':'no-store'}})}catch{return response('The inquiry service could not be reached. Download your brief and email it.',502)}
}
