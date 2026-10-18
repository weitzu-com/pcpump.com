import { createHash, randomUUID } from "node:crypto";
import { link, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { inquiryFields, validateInquiry, type InquiryFields } from "@/lib/inquiry-schema";
export const runtime="nodejs";
export async function POST(request:Request){
 if(process.env.PCP_PREVIEW_INQUIRIES!=="1"||process.env.NODE_ENV==="production")return Response.json({error:"Online submission is not configured. Please contact sales@pcpump.com."},{status:503});
 const url=new URL(request.url);const origin=request.headers.get("origin");const host=request.headers.get("host")||"";const localHost=/^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]+)?$/.test(host);
 if(!["localhost","127.0.0.1","[::1]"].includes(url.hostname)||!localHost||origin!==`${url.protocol}//${host}`)return Response.json({error:"This form is available only in the local preview."},{status:403});
 try {
  const reader=request.body?.getReader();if(!reader)throw new Error("Empty request.");let total=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>3*1024*1024){await reader.cancel();return Response.json({error:"Request too large. Use a PDF up to 2 MB."},{status:413});}chunks.push(value);}
  const body=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id||"")||body.consent!==true)throw new Error("A valid request identifier and consent are required.");
  const fields={} as InquiryFields;for(const k of Object.keys(inquiryFields) as (keyof InquiryFields)[]){const value=body.fields?.[k];if(typeof value!=="string"||value.length>(k==="requirements"?4000:300))throw new Error("Check the inquiry fields and their lengths.");fields[k]=value.trim();}
  const invalid=validateInquiry(fields);if(invalid)throw new Error(invalid);
  let attachment=null;
  if(body.attachment){const a=body.attachment;if(typeof a.name!=="string"||a.name.length>200||!a.name.toLowerCase().endsWith(".pdf")||typeof a.data!=="string"||!/^[A-Za-z0-9+/]*={0,2}$/.test(a.data))throw new Error("Choose a valid PDF attachment.");const data=Buffer.from(a.data,"base64");if(data.length>2*1024*1024||data.subarray(0,5).toString()!=="%PDF-")throw new Error("Choose a PDF no larger than 2 MB.");attachment={name:path.basename(a.name),data:a.data,bytes:data.length};}
  const reference=`PREVIEW-${body.id}`;const payload={fields,attachment};const hash=createHash("sha256").update(JSON.stringify(payload)).digest("hex");const dir=path.join(process.cwd(),".local-inquiries");await mkdir(dir,{recursive:true,mode:0o700});const file=path.join(dir,`${body.id}.json`);
  const temporary=path.join(dir,`${body.id}.${randomUUID()}.tmp`);
  try {
   await writeFile(temporary,JSON.stringify({reference,hash,createdAt:new Date().toISOString(),preview:true,consent:true,...payload},null,2),{flag:"wx",mode:0o600});
   try{await link(temporary,file);}catch(e){if((e as NodeJS.ErrnoException).code!=="EEXIST")throw e;}
  } finally { await unlink(temporary).catch(()=>{}); }
  const saved=JSON.parse(await readFile(file,"utf8"));if(saved.hash!==hash)return Response.json({error:"This request was already saved with different details. Reload to start a new inquiry."},{status:409});
  return Response.json({reference:saved.reference,preview:true},{headers:{"Cache-Control":"no-store"}});
 }catch(e){const msg=e instanceof Error?e.message:"Invalid inquiry.";return Response.json({error:msg.startsWith("E")||msg.includes("JSON")?"The inquiry could not be saved. Check the details and retry.":msg},{status:400});}
}
