import fs from 'fs';

console.log('Applying Promote4.me 3.4.8 useRef hotfix...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.4.8';
if (!pkg.scripts.prebuild.includes('apply-3.4.8-use-ref-hotfix.mjs')) {
  pkg.scripts.prebuild += ' && node scripts/apply-3.4.8-use-ref-hotfix.mjs';
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replace('import React, { useEffect, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";');
if (!app.includes('useRef')) throw new Error('useRef import hotfix failed');
fs.writeFileSync('src/ProductApp.jsx', app);

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.4.8'").replaceAll('authRequired','requireAuth');
fs.writeFileSync('server/index.js', server);

console.log('Promote4.me 3.4.8 useRef hotfix applied.');
