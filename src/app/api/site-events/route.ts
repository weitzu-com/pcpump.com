import {validSiteEvent} from '@/lib/site-events';
export const runtime='nodejs';
export async function POST(request:Request){
 const reply=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
 const url=new URL(request.url),scheme=request.headers.get('x-forwarded-proto')?.split(',')[0].trim()||url.protocol.slice(0,-1);
 if(request.headers.get('origin')!==`${scheme}://${request.headers.get('host')||url.host}`)return reply(403);
 if(request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1')return reply(204);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415);
 let raw='';
 try{const reader=request.body?.getReader();if(!reader)return reply(400);const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;raw+=decoder.decode(value,{stream:true});if(raw.length>1000){await reader.cancel();return reply(413)}}}catch{return reply(400)}
 let body;try{body=JSON.parse(raw)}catch{return reply(400)}
 if(!validSiteEvent(body))return reply(400);
 if(!process.env.INQUIRY_RECEIVER_URL)return reply(503);
 try{const target=new URL(process.env.INQUIRY_RECEIVER_URL);if(target.protocol!=='https:')return reply(503);target.pathname='/events';target.search='';target.hash='';const result=await fetch(target,{method:'POST',headers:{Origin:'https://www.pcpump.com','Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(5000),redirect:'error'});return reply(result.status===202?204:502)}catch{return reply(502)}
}
