const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const output='deliverables/website-v3-validation/production-route-report.json';
const fetch=(url,statusOnly=false)=>execFileSync('curl',['-sS','--retry','2','--retry-all-errors','--retry-delay','1','--max-time','10','--retry-max-time','30',...(statusOnly?['-o','/dev/null','-w','%{http_code}']:[]),url],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const xml=fetch('https://www.pcpump.com/sitemap.xml');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if(!urls.length||urls.some(url=>!url.startsWith('https://www.pcpump.com/')))throw Error('Unexpected sitemap');
const report={checkedAt:new Date().toISOString(),total:urls.length,results:[]};
for(const url of urls){
 try{report.results.push({url,status:Number(fetch(url,true))})}catch(error){report.results.push({url,status:0,error:error.status===35?'TLS transport failure':`curl exit ${error.status}`})}
 fs.writeFileSync(output,JSON.stringify(report,null,2));
 if(report.results.length%20===0)console.log(`${report.results.length}/${urls.length}`);
}
const failed=report.results.filter(r=>r.status!==200);
if(failed.length){console.error(JSON.stringify(failed));process.exitCode=1}else console.log(`PASS: ${urls.length} production sitemap URLs, anonymous GET.`);
