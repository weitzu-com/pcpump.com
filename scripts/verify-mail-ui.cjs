const {chromium}=require('/Users/weitzu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const report={base:'https://www.pcpump.com',checkedAt:new Date().toISOString(),mockedSubmission:true,externalEmailSent:false,checks:[]};
 try {
  for(const width of [375,1440]){
   const context=await browser.newContext({viewport:{width,height:1000},extraHTTPHeaders:{DNT:'1'}});
   await context.addInitScript(()=>{window.__PCP_INTERNAL_QA__=true;Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'})});
   let notification='accepted_by_email_service';
   await context.route('**/api/engineering-inquiries',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'persisted',reference:'PCP-internal-ui-only',notification})}));
   const page=await context.newPage();await page.goto(report.base+'/en/engineering-inquiry',{waitUntil:'networkidle'});
   assert.equal(await page.getByText(/Email notifications are still being configured/).count(),0);
   for(const [label,value] of [['Contact name','Internal UI test'],['Work email','qa@example.invalid'],['Company','No external submission'],['Project country','Test'],['Project details','Mocked receipt UI validation only.']])await page.getByLabel(label,{exact:true}).fill(value);
   await page.getByRole('button',{name:'Send engineering inquiry',exact:true}).click();
   await page.getByRole('status').filter({hasText:'The email service accepted'}).waitFor();
   assert.match(await page.getByRole('status').innerText(),/inbox delivery is not yet confirmed/);
   notification='pending';await page.getByRole('button',{name:'Send engineering inquiry',exact:true}).click();await page.getByRole('status').filter({hasText:'Email notification is pending'}).waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   report.checks.push({width,providerConfiguredNotice:true,acceptedStateHonest:true,pendingStateHonest:true,noHorizontalOverflow:true});await context.close();
  }
  fs.writeFileSync('deliverables/website-v3-validation/mail-ui-production.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
