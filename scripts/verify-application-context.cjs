const {chromium}=require('/Users/weitzu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.PCP_APP_BASE||'http://127.0.0.1:3122';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const report={base,checkedAt:new Date().toISOString(),checks:[],submitted:false};
 try{
  for(const [width,topic,system] of [[1440,'Sand & solids','Surface-driven PCP'],[375,'Submersible direct drive','ESPCP']]){
   const c=await browser.newContext({viewport:{width,height:1000},extraHTTPHeaders:{DNT:'1'}});await c.addInitScript(()=>{window.__PCP_INTERNAL_QA__=true;Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'})});const p=await c.newPage();
   await p.goto(base+'/en/pcp-systems',{waitUntil:'networkidle'});await p.locator('.pcp-apps article').filter({has:p.getByRole('heading',{name:topic,exact:true})}).getByRole('link',{name:'Discuss this application'}).click();await p.waitForURL('**/en/engineering-inquiry?**');await p.waitForLoadState('networkidle');
   assert.match(await p.locator('.selected-context').innerText(),new RegExp(topic));assert.equal(await p.getByRole('combobox',{name:'System',exact:true}).inputValue(),system);
   await p.getByLabel('Contact name',{exact:true}).fill('Internal application context check');await p.getByLabel('Work email',{exact:true}).fill('qa@example.invalid');await p.getByLabel('Company',{exact:true}).fill('Internal QA');await p.getByLabel('Project country',{exact:true}).fill('Test');await p.getByLabel('Project details',{exact:true}).fill('Synthetic preparation only. Do not submit.');await p.getByRole('button',{name:'Review brief',exact:true}).click();
   assert.ok((await p.locator('.brief-review pre').innerText()).includes('application: '+topic));report.checks.push({width,topic,system,contextInBrief:true});await c.close();
  }
  fs.writeFileSync('deliverables/website-v3-validation/application-context'+(base.startsWith('https:')?'-production':'')+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
