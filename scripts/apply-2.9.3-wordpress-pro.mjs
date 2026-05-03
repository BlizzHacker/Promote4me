import fs from 'fs';
import path from 'path';

const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
const write = (p, c) => { mkdir(path.dirname(p)); fs.writeFileSync(p, c); };

console.log('Applying Promote4.me 2.9.3 WordPress compatibility package...');

// Kept intentionally lightweight because 2.9.5 now generates the WordPress.org-compliant package.
mkdir('public/downloads');
if (!fs.existsSync('public/downloads/README-addons.html')) {
  write('public/downloads/README-addons.html', '<!doctype html><title>Promote4.me Add-ons</title><h1>Promote4.me Add-ons</h1><p>Download the latest WordPress Proof Manager ZIP and Shopify embedded app package from Promote4.me Integrations.</p>');
}

console.log('Promote4.me 2.9.3 compatibility package applied.');
