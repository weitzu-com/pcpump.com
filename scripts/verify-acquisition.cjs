const {chromium}=require('/Users/weitzu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.PCP_ACQUISITION_BASE||'http://127.0.0.1:3122';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const report={base,checkedAt:new Date().toISOString(),metadata:[],navigation:[],downloads:[],errors:[],indexationVerified:false};
 try{
  const c=await browser.newContext({viewport:{width:1440,height:1000},extraHTTPHeaders:{DNT:'1'}});await c.addInitScript(()=>{window.__PCP_INTERNAL_QA__=true;Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'})});const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  const descriptions=new Set();
  await p.goto(base+'/en',{waitUntil:'networkidle'});const homeImage=new URL(await p.locator('meta[property="og:image"]').getAttribute('content'));assert.equal(homeImage.origin,'https://www.pcpump.com');assert.equal(homeImage.pathname,'/opengraph-image');assert.ok(homeImage.searchParams.get('v'));report.homeShareImage=homeImage.toString();
  for(const [slug,titlePattern] of [['pcp-systems',/PCP Artificial Lift Systems/],['downhole-pumps',/Downhole PCP Pumps/],['pcp-elastomers',/PCP Elastomer Compounds/],['surface-drive-pcp',/PCP Surface Driveheads/],['engineering-inquiry',/PCP Engineering Inquiry/],['technical-resources',/PCP Technical Resources/]]){
   const r=await p.goto(`${base}/en/${slug}`,{waitUntil:'networkidle'});assert.equal(r.status(),200);const title=await p.title(),description=await p.locator('meta[name=description]').getAttribute('content');assert.match(title,titlePattern);assert.ok(description.length>80);assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),`https://www.pcpump.com/en/${slug}`);assert.equal(await p.locator('meta[property="og:description"]').getAttribute('content'),description);assert.equal(await p.locator('meta[property="og:title"]').getAttribute('content'),title);descriptions.add(description);report.metadata.push({slug,title,description});
  }
  assert.equal(descriptions.size,6);
  for(const [legacy,canonical] of [['request-quote','engineering-inquiry'],['progressive-cavity-pumps','pcp-systems']]){await p.goto(`${base}/en/${legacy}`);assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),`https://www.pcpump.com/en/${canonical}`)}
  for(const width of [1440,375]){
   await p.setViewportSize({width,height:1000});await p.goto(base+'/en/downhole-pumps',{waitUntil:'networkidle'});
   const nav=width===375?p.getByRole('navigation',{name:'Mobile navigation'}):p.getByRole('navigation',{name:'Primary navigation'});
   if(width===375){await p.locator('.mobile-menu summary').click();await p.keyboard.press('Escape');assert.equal(await p.locator('.mobile-menu').evaluate(e=>e.open),false);await p.locator('.mobile-menu summary').click()}
   await nav.getByRole('link',{name:'Resources',exact:true}).click();await p.waitForURL('**/en/technical-resources');await p.waitForLoadState('networkidle');if(width===375)assert.equal(await p.locator('.mobile-menu').evaluate(e=>e.open),false);
   assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('a[download]').count(),3);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await p.screenshot({path:`deliverables/website-v3-validation/${base.startsWith('https:')?'live-':''}resources-${width}.png`,fullPage:true});
   if(width===1440)for(const [file,rows] of [['pumps',59],['elastomers',8],['driveheads',23]]){const waiting=p.waitForEvent('download');await p.locator(`a[href="/resources/pcp-${file}.csv"]`).click();const download=await waiting;assert.equal(await download.failure(),null);const stream=await download.createReadStream();let content='';for await(const chunk of stream)content+=chunk;assert.match(content,/^model,/);assert.equal(content.trim().split(/\r?\n/).length-1,rows);report.downloads.push({file,rows,bytes:Buffer.byteLength(content)})}
   if(width===375)await p.locator('.mobile-menu summary').click();await nav.getByRole('link',{name:'Other lift systems',exact:true}).click();await p.waitForURL('**/en#other-lift-equipment');await p.locator('#other-lift-equipment').waitFor();assert.equal(await p.locator('#other-lift-equipment a').count(),4);if(width===375)assert.equal(await p.locator('.mobile-menu').evaluate(e=>e.open),false);report.navigation.push({width,resources:'pass',supportingLiftFamilies:4,menuClose:width===375?'pass':'not applicable'});
   if(width===375){await p.goto(base+'/en/pcp-systems',{waitUntil:'networkidle'});await p.locator('.mobile-menu summary').click();await p.screenshot({path:`deliverables/website-v3-validation/${base.startsWith('https:')?'live-':''}mobile-menu-system-after.png`});await nav.getByRole('link',{name:/Engineering inquiry/}).click({timeout:5000});await p.waitForURL('**/en/engineering-inquiry');assert.equal(await p.locator('.mobile-menu').evaluate(e=>e.open),false);report.navigation[report.navigation.length-1].systemMenuToInquiry='pass'}
  }
  for(const locale of ['es','ru']){const r=await p.goto(`${base}/${locale}/technical-resources`,{waitUntil:'networkidle'});assert.equal(r.status(),200);assert.match(await p.locator('.translation-note').innerText(),/English/);assert.equal(await p.locator('a[download]').count(),3)}
  assert.equal(report.errors.length,0);fs.writeFileSync(`deliverables/website-v3-validation/acquisition${base.startsWith('https:')?'-production':''}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({metadata:report.metadata.length,navigation:report.navigation,downloads:report.downloads,errors:report.errors,indexationVerified:false}));await c.close();
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
