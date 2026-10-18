const fs=require('node:fs'),assert=require('node:assert/strict');
const ts=require('/private/tmp/pcpump-v3-clean/node_modules/typescript');
function load(file,extra={}){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports','module',code)(name=>extra[name]||require(name),m.exports,m);return m.exports}
(async()=>{
 const originalFetch=global.fetch;
 let wrong=false,failMail=false,created=true,mailCount=0,nativeNotification='pending';
 global.fetch=async(url,options)=>{assert.equal(options.headers.Origin,'https://www.pcpump.com');const body=JSON.parse(options.body);return Response.json({status:'persisted',reference:wrong?'wrong':body.reference,receivedAt:'2026-10-17T12:00:00Z',created,notification:nativeNotification},{status:201})};
 const data=load('src/lib/pcp-data.ts'),config=load('src/lib/inquiry-delivery-config.ts');
 const {POST}=load('src/app/api/engineering-inquiries/route.ts',{'@/lib/pcp-data':data,'@/lib/inquiry-delivery-config':config,'@/lib/inquiry-mail':{sendEngineeringMail:async()=>{mailCount++;if(failMail)throw Error('synthetic failure');return {status:'accepted_by_mail_server'}}}});
 process.env.INQUIRY_RECEIVER_URL='https://receiver.invalid/submit';process.env.INQUIRY_SMTP_USER='sales@pcpump.com';process.env.INQUIRY_SMTP_PASSWORD='synthetic-test-only';
 const body={id:'5786c175-0584-4b4d-8bf4-080cf6b55ee2',system:'Surface-driven PCP',selection:{pump:'GLB120-27'},fields:{name:'Internal QA',company:'Internal QA',country:'Test',email:'qa@example.invalid',details:'Synthetic adapter test only.'}};
 const request=()=>new Request('https://www.pcpump.com/api/engineering-inquiries',{method:'POST',headers:{Origin:'https://www.pcpump.com','Content-Type':'application/json'},body:JSON.stringify(body)});
 const receipt=await (await POST(request())).json();assert.equal(receipt.status,'persisted');assert.equal(receipt.notification,'accepted_by_mail_server');assert.equal(mailCount,1);
 created=false;const retry=await (await POST(request())).json();assert.equal(retry.reference,receipt.reference);assert.equal(mailCount,1);
 created=true;failMail=true;const pending=await (await POST(request())).json();assert.equal(pending.status,'persisted');assert.equal(pending.notification,'pending');
 wrong=true;assert.equal((await POST(request())).status,502);
 wrong=false;process.env.INQUIRY_MAIL_PROVIDER='cloudflare';nativeNotification='accepted_by_email_service';const oldMailCount=mailCount;const native=await (await POST(request())).json();assert.equal(native.notification,'accepted_by_email_service');assert.equal(mailCount,oldMailCount);
 nativeNotification='pending';await POST(request());assert.equal(mailCount,oldMailCount);delete process.env.INQUIRY_MAIL_PROVIDER;
 delete process.env.INQUIRY_RECEIVER_URL;delete process.env.INQUIRY_SMTP_USER;delete process.env.INQUIRY_SMTP_PASSWORD;global.fetch=originalFetch;
 console.log('PASS: durable receipt contract, fixed reference, duplicate notification avoidance, SMTP failure preserves saved receipt, invalid upstream receipt rejected. Synthetic only.');
})().catch(error=>{console.error(error);process.exitCode=1});
