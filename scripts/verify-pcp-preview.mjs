import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const base=process.env.PCP_TEST_BASE||'http://127.0.0.1:3101';
const runtime=process.env.PCP_TEST_RUNTIME||process.cwd();
const schema=await readFile(path.join(runtime,'src/lib/inquiry-schema.ts'),'utf8');
const keys=[...schema.matchAll(/(?:^|[,\s])([a-zA-Z]+):"/g)].map(m=>m[1]);
const fields=Object.fromEntries(keys.map(k=>[k,'']));
Object.assign(fields,{name:'Preview QA',company:'Example Test Company',email:'qa@example.invalid',country:'Test project',system:'Surface PCP',models:'GLB105-27',requirements:'TEST ONLY: assess a pump for a sample well.',flow:'15.1',temperature:'80'});
const body={id:randomUUID(),consent:true,fields,attachment:{name:'test.pdf',data:Buffer.from('%PDF-1.4\n% Local preview test only\n%%EOF').toString('base64')}};
const post=(value,origin=base)=>fetch(`${base}/api/inquiries`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(value)});
for(const p of ['/en/progressive-cavity-pumps','/en/request-quote','/resources/pcp-pumps.csv','/resources/pcp-elastomers.csv','/resources/pcp-driveheads.csv']){const r=await fetch(base+p);assert.equal(r.status,200,p);const text=await r.text();if(p.includes('progressive-cavity')){assert.match(text,/One system/);assert.match(text,/GLB1400-18/);assert.equal((text.match(/<h1[ >]/g)||[]).length,1);}if(p.includes('request-quote'))assert.match(text,/LOCAL PREVIEW/);}
assert.equal((await post(body,'https://example.invalid')).status,403);
assert.equal((await post({...body,fields:{...fields,email:'invalid'}})).status,400);
assert.equal((await post({...body,fields:{...fields,sand:'101'}})).status,400);
assert.equal((await post({...body,consent:false})).status,400);
assert.equal((await post({...body,attachment:{name:'bad.pdf',data:Buffer.from('not a pdf').toString('base64')}})).status,400);
const first=await post(body);assert.equal(first.status,200);const receipt=await first.json();assert.match(receipt.reference,/^PREVIEW-/);
const repeat=await post(body);assert.equal(repeat.status,200);assert.equal((await repeat.json()).reference,receipt.reference);
assert.equal((await post({...body,fields:{...fields,flow:'20'}})).status,409);
const concurrentBody={...body,id:randomUUID()};
const concurrent=await Promise.all(Array.from({length:8},()=>post(concurrentBody)));
for(const response of concurrent){assert.equal(response.status,200);assert.equal((await response.json()).reference,`PREVIEW-${concurrentBody.id}`);}
const saved=JSON.parse(await readFile(path.join(runtime,'.local-inquiries',`${body.id}.json`),'utf8'));
assert.equal(saved.fields.models,'GLB105-27');assert.equal(saved.fields.flow,'15.1');assert.equal(saved.preview,true);assert.equal(saved.attachment.bytes,Buffer.from(body.attachment.data,'base64').length);
console.log('PASS: pages, three downloads, origin checks, field validation, PDF validation, persistence readback, identical retry, eight concurrent retries and changed-payload conflict. Test record:',receipt.reference);
