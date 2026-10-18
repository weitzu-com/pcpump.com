const fs=require('node:fs'),assert=require('node:assert/strict');
const ts=require('/private/tmp/pcpump-v3-clean/node_modules/typescript');
function load(file,extra={}){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports','module',code)(name=>extra[name]||require(name),m.exports,m);return m.exports}
(async()=>{
 const schema=load('src/lib/site-events.ts'),{POST}=load('src/app/api/site-events/route.ts',{'@/lib/site-events':schema});
 process.env.INQUIRY_RECEIVER_URL='https://receiver.invalid/submit';const original=global.fetch;let status=202,captured,calls=0;
 global.fetch=async(url,options)=>{calls++;captured={url:String(url),body:JSON.parse(options.body)};return new Response(null,{status})};
 const signal={event:'spec_view',path:'/en/downhole-pumps',test:true};
 const request=(body=signal,headers={})=>new Request('https://www.pcpump.com/api/site-events',{method:'POST',headers:{origin:'https://www.pcpump.com','content-type':'application/json',...headers},body:JSON.stringify(body)});
 assert.equal((await POST(request())).status,204);assert.equal(captured.url,'https://receiver.invalid/events');assert.deepEqual(captured.body,signal);
 assert.equal((await POST(request({...signal,path:'/en/technical-resources',event:'resource_open'}))).status,204);
 assert.equal((await POST(request({...signal,email:'private@example.invalid'}))).status,400);
 assert.equal((await POST(request({...signal,path:'/en?email=private'}))).status,400);
 assert.equal((await POST(request({...signal,event:'lead_qualified'}))).status,400);
 assert.equal((await POST(request(signal,{origin:'https://untrusted.invalid'}))).status,403);
 const before=calls;assert.equal((await POST(request(signal,{dnt:'1'}))).status,204);assert.equal((await POST(request(signal,{'sec-gpc':'1'}))).status,204);assert.equal(calls,before);
 status=503;assert.equal((await POST(request())).status,502);
 delete process.env.INQUIRY_RECEIVER_URL;assert.equal((await POST(request())).status,503);global.fetch=original;
 console.log('PASS: strict aggregate payload, no query/contact fields, no client qualification event, origin checks, privacy signals and failed receiver handling. Synthetic only.');
})().catch(error=>{console.error(error);process.exitCode=1});
