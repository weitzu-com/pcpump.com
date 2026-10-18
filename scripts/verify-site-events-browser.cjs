const {chromium}=require('/Users/weitzu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const live=process.env.PCP_EVENTS_LIVE==='1',resourcesOnly=process.env.PCP_EVENTS_RESOURCES_ONLY==='1',base=process.env.PCP_EVENTS_BASE||'http://127.0.0.1:3122';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const report={base,liveReceiver:live,checkedAt:new Date().toISOString(),events:[],requestPrivacy:[],privacySignals:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:375,height:900}});await context.addInitScript(()=>{window.__PCP_INTERNAL_QA__=true});
  const inspect=async request=>{const headers=await request.allHeaders();const ref=headers.referer;report.requestPrivacy.push({referrerOriginOnly:Boolean(ref&&ref===new URL(base).origin+'/'),cookiesAbsent:!headers.cookie})};
  if(!live)await context.route('**/api/site-events',async route=>{await inspect(route.request());report.events.push({...route.request().postDataJSON(),status:204});await route.fulfill({status:204})});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  if(live)page.on('response',async r=>{if(r.url().endsWith('/api/site-events')){await inspect(r.request());report.events.push({...r.request().postDataJSON(),status:r.status()})}});
  const wait=async name=>{const end=Date.now()+10000;while(!report.events.some(e=>e.event===name&&e.status===204)){if(Date.now()>end)throw Error('Missing accepted event: '+name);await new Promise(r=>setTimeout(r,100))}};
  await page.goto(base+`/en/${resourcesOnly?'technical-resources':'downhole-pumps'}?email=do-not-collect@example.invalid`,{waitUntil:'networkidle'});await wait('page_view');
  if(!resourcesOnly){await page.locator('#specifications h2').scrollIntoViewIfNeeded();await wait('spec_view')}
  const downloaded=page.waitForEvent('download');await page.locator('a[href="/resources/pcp-pumps.csv"]').click();await downloaded;await wait('resource_open');
  if(!resourcesOnly){await page.goto(base+'/en/engineering-inquiry?private=do-not-collect',{waitUntil:'networkidle'});await page.getByLabel('Contact name',{exact:true}).fill('Do not put this in analytics');await wait('inquiry_start')}
  for(const event of report.events){assert.deepEqual(Object.keys(event).sort(),['event','path','status','test']);assert.equal(event.test,true);assert.equal(event.status,204);assert.ok(!event.path.includes('?'));assert.ok(!JSON.stringify(event).includes('do-not-collect'));assert.ok(!JSON.stringify(event).includes('Do not put'))}
  assert.equal((await context.cookies()).length,0);
  await context.close();
  for(const signal of ['DNT','GPC']){
   let count=0;const c=await browser.newContext({extraHTTPHeaders:signal==='DNT'?{DNT:'1'}:{'Sec-GPC':'1'}});
   await c.addInitScript(mode=>{window.__PCP_INTERNAL_QA__=true;if(mode==='DNT')Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'});else Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true})},signal);
   await c.route('**/api/site-events',async route=>{count++;await route.fulfill({status:204})});
   const p=await c.newPage();await p.goto(base+'/en/engineering-inquiry',{waitUntil:'networkidle'});await p.getByLabel('Contact name',{exact:true}).fill('Private test');await p.waitForTimeout(300);assert.equal(count,0);report.privacySignals.push({signal,requests:count});await c.close();
  }
  assert.equal(report.errors.length,0);assert.equal(report.events.filter(e=>e.event==='spec_view').length,resourcesOnly?0:1);
  assert.equal(report.requestPrivacy.length,report.events.length);assert.ok(report.requestPrivacy.every(p=>p.referrerOriginOnly&&p.cookiesAbsent));
  fs.writeFileSync('deliverables/website-v3-validation/'+(resourcesOnly?'resource-events-':'site-events-')+(live?'production.json':'browser.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({liveReceiver:live,events:report.events,privacySignals:report.privacySignals,errors:report.errors}));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
