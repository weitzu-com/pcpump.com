const {chromium}=require('/Users/weitzu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.PCP_LIVE_BASE||'https://www.pcpump.com';
const out='deliverables/website-v3-validation';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const report={base,checkedAt:new Date().toISOString(),pages:[],errors:[],synthetic:true,salesInboxReceiptVerified:false};
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await page.addInitScript(()=>{window.__PCP_INTERNAL_QA__=true});page.on('pageerror',e=>report.errors.push(e.message));
  for(const width of [375,1440]){
   await page.setViewportSize({width,height:1000});
   for(const slug of ['','pcp-systems','downhole-pumps','pcp-elastomers','surface-drive-pcp','engineering-inquiry']){
    const r=await page.goto(`${base}/en${slug?'/'+slug:''}`,{waitUntil:'networkidle'});assert.equal(r.status(),200);
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    assert.equal(await page.locator('img').evaluateAll(async imgs=>(await Promise.all(imgs.map(async i=>{i.loading='eager';try{await i.decode();return i.naturalWidth>0}catch{return false}}))).every(Boolean)),true);
    report.pages.push({width,slug:slug||'home',status:'pass'});
    await page.screenshot({path:`${out}/live-${slug||'home'}-${width}.png`,fullPage:slug==='engineering-inquiry'});
   }
  }
  const flowWidth=Number(process.env.PCP_LIVE_FLOW_WIDTH||1440);await page.setViewportSize({width:flowWidth,height:1000});
  await page.goto(`${base}/en/downhole-pumps`,{waitUntil:'networkidle'});await page.getByLabel('Find a model').fill('GLB120-27');await page.getByRole('button',{name:'Select',exact:true}).click();
  await page.getByRole('link',{name:'Next: elastomers'}).click();await page.waitForLoadState('networkidle');
  await page.locator('.material-card').filter({has:page.getByRole('heading',{name:'GY-3',exact:true})}).getByRole('button').click();
  await page.getByRole('link',{name:'Next: driveheads'}).click();await page.waitForLoadState('networkidle');await page.getByLabel('Find a model').fill('PMM20-450');await page.getByRole('button',{name:'Select',exact:true}).click();
  await page.getByRole('link',{name:/^Review inquiry/}).click();await page.waitForLoadState('networkidle');assert.match(await page.locator('.selected-context').innerText(),/GLB120-27.*GY-3.*PMM20-450/);
  await page.getByLabel('Contact name',{exact:true}).fill('Internal production acceptance test');await page.getByLabel('Work email',{exact:true}).fill('qa@example.invalid');await page.getByLabel('Company',{exact:true}).fill('Internal QA');await page.getByLabel('Project country',{exact:true}).fill('Test');await page.getByLabel('Project details',{exact:true}).fill('INTERNAL WEBSITE ACCEPTANCE TEST. Target flow 10 m3/day. Exclude from all commercial metrics.');
  if(process.env.PCP_LIVE_SUBMIT!=='1')throw Error('Live submission requires PCP_LIVE_SUBMIT=1. No inquiry sent.');
  let responsePromise=page.waitForResponse(r=>r.url().endsWith('/api/engineering-inquiries')&&r.request().method()==='POST');await page.getByRole('button',{name:'Send engineering inquiry',exact:true}).click();let response=await responsePromise;assert.equal(response.status(),200);const receipt=await response.json();assert.equal(receipt.status,'persisted');assert.match(receipt.reference,/^PCP-/);
  await page.getByRole('status').waitFor();assert.match(await page.getByRole('status').innerText(),/has been saved/);
  responsePromise=page.waitForResponse(r=>r.url().endsWith('/api/engineering-inquiries')&&r.request().method()==='POST');await page.getByRole('button',{name:'Send engineering inquiry',exact:true}).click();response=await responsePromise;assert.equal((await response.json()).reference,receipt.reference);
  report.inquiry={...receipt,flowWidth,repeatUsesSameReference:true,authoritativeReadbackPending:true};await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/live-inquiry-receipt-${flowWidth}.png`,fullPage:true});assert.equal(report.errors.length,0);
  fs.writeFileSync(`${out}/production-report${flowWidth===1440?'':'-mobile'}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({pages:report.pages.length,inquiry:report.inquiry,errors:report.errors}));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
