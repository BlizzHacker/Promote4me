import fs from 'fs';
console.log('Applying Promote4.me 3.5.3 no-manual-ZIP fallback patch...');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version='3.5.3';
if(!pkg.scripts.prebuild.includes('apply-3.5.3-no-manual-zip-fallback.mjs')) pkg.scripts.prebuild+=' && node scripts/apply-3.5.3-no-manual-zip-fallback.mjs';
fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
let server=fs.readFileSync('server/index.js','utf8');
server=server.replace(/version: '[^']+'/g,"version: '3.5.3'");
server=server.replace(/if\(zip\)\{\s*try\{ const r=await fetch\('https:\/\/api\.zippopotam\.us\/us\/'\+zip[\s\S]*?if\(cache\[zip\]\) return \{\.\.\.cache\[zip\],zip,label:zip,source:'cache'\};\s*\}/,`if(zip){
    try{ const r=await fetch('https://api.zippopotam.us/us/'+zip,{signal:AbortSignal.timeout(5000)}); if(r.ok){ const j=await r.json(); const p=j.places?.[0]; if(p) return {city:p['place name'],state:p['state abbreviation'],lat:Number(p.latitude),lng:Number(p.longitude),zip,label:zip,source:'zippopotam'}; } }catch{}
  }`);
server=server.replace("return {...cache[64801],zip:zip||'64801',label:s,source:'fallback'};","return {city:s,state:'',lat:39.8283,lng:-98.5795,zip:zip||'',label:s,source:'unresolved-us-center',warning:'Location lookup failed. Check ZIP/city spelling or external geocoder connectivity.'};");
fs.writeFileSync('server/index.js',server);
let app=fs.readFileSync('src/ProductApp.jsx','utf8');
app=app.replaceAll('Work Hub · v3.5.2','Work Hub · v3.5.3').replaceAll('Promote4.me v3.2.0','Promote4.me v3.5.3').replaceAll('Authentik / Social Login','Social Login');
fs.writeFileSync('src/ProductApp.jsx',app);
console.log('Promote4.me 3.5.3 no-manual-ZIP fallback patch applied.');
