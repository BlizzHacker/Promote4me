import fs from 'fs';
import path from 'path';
const mkdir=(p)=>fs.mkdirSync(p,{recursive:true});
mkdir('public/downloads');

const pluginPhp = `<?php
/**
 * Plugin Name: Promote4.me WooCommerce Proof of Work
 * Plugin URI: https://promote4.me
 * Description: Sends WooCommerce orders to Promote4.me proof-of-work tracking and creates customer tracking/proof records.
 * Version: 2.9.0
 * Author: Promote4.me
 */
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function(){
  add_options_page('Promote4.me', 'Promote4.me', 'manage_options', 'promote4me', 'p4me_page');
});

add_action('admin_init', function(){
  register_setting('p4me','p4me_api_url');
  register_setting('p4me','p4me_api_key');
  register_setting('p4me','p4me_send_status');
});

function p4me_page(){
  if (!empty($_POST['p4me_test'])) {
    p4me_send_order_to_promote4me(null, true);
    echo '<div class="notice notice-success"><p>Promote4.me test order submitted. Check Promote4.me Work Orders.</p></div>';
  }
  ?>
  <div class="wrap">
    <h1>Promote4.me WooCommerce Proof of Work</h1>
    <p>Send WooCommerce orders into Promote4.me for delivery tracking, contractor dispatch, GPS/photo proof, and client approval.</p>
    <form method="post" action="options.php">
      <?php settings_fields('p4me'); ?>
      <table class="form-table">
        <tr><th>Promote4.me API URL</th><td><input name="p4me_api_url" value="<?php echo esc_attr(get_option('p4me_api_url','https://promote4.me')); ?>" class="regular-text"></td></tr>
        <tr><th>External API Key</th><td><input name="p4me_api_key" value="<?php echo esc_attr(get_option('p4me_api_key','')); ?>" class="regular-text" autocomplete="off"><p class="description">Create this inside Promote4.me → Integrations / API Credential Center.</p></td></tr>
        <tr><th>Send when order status becomes</th><td><select name="p4me_send_status"><option value="processing" <?php selected(get_option('p4me_send_status','processing'),'processing'); ?>>Processing</option><option value="completed" <?php selected(get_option('p4me_send_status','processing'),'completed'); ?>>Completed</option><option value="on-hold" <?php selected(get_option('p4me_send_status','processing'),'on-hold'); ?>>On hold</option></select></td></tr>
      </table>
      <?php submit_button('Save Promote4.me Settings'); ?>
    </form>
    <form method="post"><input type="hidden" name="p4me_test" value="1"><?php submit_button('Send Promote4.me Test Order'); ?></form>
  </div>
  <?php
}

add_action('woocommerce_order_status_processing', function($id){ if(get_option('p4me_send_status','processing')==='processing') p4me_send_order_to_promote4me($id,false); });
add_action('woocommerce_order_status_completed', function($id){ if(get_option('p4me_send_status','processing')==='completed') p4me_send_order_to_promote4me($id,false); });
add_action('woocommerce_order_status_on-hold', function($id){ if(get_option('p4me_send_status','processing')==='on-hold') p4me_send_order_to_promote4me($id,false); });

function p4me_send_order_to_promote4me($id,$test=false){
  $api=rtrim(get_option('p4me_api_url','https://promote4.me'),'/');
  $key=get_option('p4me_api_key','');
  if(!$key) return;
  $o=$id&&function_exists('wc_get_order')?wc_get_order($id):null;
  $ship=$o ? $o->get_address('shipping') : array();
  $bill=$o ? $o->get_address('billing') : array();
  $addr=array_filter(array($ship['address_1']??'', $ship['city']??'', $ship['state']??'', $ship['postcode']??''));
  $payload=array(
    'source'=>'WooCommerce',
    'type'=>'Package Delivery',
    'title'=>$test?'WooCommerce Test Order':'WooCommerce Order #'.$id,
    'order_number'=>$test?'WC-TEST-'.time():'WC-'.$id,
    'customer_name'=>$o?trim(($bill['first_name']??'').' '.($bill['last_name']??'')):'WooCommerce Test Customer',
    'customer_email'=>$o?$o->get_billing_email():'test@example.com',
    'customer_phone'=>$o?$o->get_billing_phone():'',
    'address'=>$o?implode(', ',$addr):'302 E 4th St, Joplin, MO',
    'status'=>'Assigned',
    'instructions'=>'Imported from WooCommerce. Upload GPS/photo proof before completion.',
    'visibility'=>'private',
    'work_mode'=>'in_person',
    'is_public'=>false
  );
  $r=wp_remote_post($api.'/api/external/orders',array('headers'=>array('Content-Type'=>'application/json','X-P4ME-Key'=>$key),'body'=>wp_json_encode($payload),'timeout'=>20));
  if(is_wp_error($r)) error_log('Promote4.me order sync failed: '.$r->get_error_message());
}
?>`;

fs.writeFileSync('public/downloads/promote4me-woocommerce.php', pluginPhp);

function crc32(buf){
  let table=crc32.table;
  if(!table){ table=[]; for(let n=0;n<256;n++){let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1); table[n]=c>>>0;} crc32.table=table; }
  let crc=0^(-1); for(const b of buf) crc=(crc>>>8)^table[(crc^b)&0xff]; return (crc^(-1))>>>0;
}
function dosDateTime(){ return {time:0, date:33}; }
function makeZip(files){
  const locals=[], centrals=[]; let offset=0; const dt=dosDateTime();
  for(const f of files){
    const name=Buffer.from(f.name); const data=Buffer.from(f.data); const crc=crc32(data);
    const local=Buffer.alloc(30+name.length);
    local.writeUInt32LE(0x04034b50,0); local.writeUInt16LE(20,4); local.writeUInt16LE(0,6); local.writeUInt16LE(0,8); local.writeUInt16LE(dt.time,10); local.writeUInt16LE(dt.date,12); local.writeUInt32LE(crc,14); local.writeUInt32LE(data.length,18); local.writeUInt32LE(data.length,22); local.writeUInt16LE(name.length,26); local.writeUInt16LE(0,28); name.copy(local,30);
    locals.push(local,data);
    const central=Buffer.alloc(46+name.length);
    central.writeUInt32LE(0x02014b50,0); central.writeUInt16LE(20,4); central.writeUInt16LE(20,6); central.writeUInt16LE(0,8); central.writeUInt16LE(0,10); central.writeUInt16LE(dt.time,12); central.writeUInt16LE(dt.date,14); central.writeUInt32LE(crc,16); central.writeUInt32LE(data.length,20); central.writeUInt32LE(data.length,24); central.writeUInt16LE(name.length,28); central.writeUInt16LE(0,30); central.writeUInt16LE(0,32); central.writeUInt16LE(0,34); central.writeUInt16LE(0,36); central.writeUInt32LE(0,38); central.writeUInt32LE(offset,42); name.copy(central,46);
    centrals.push(central); offset += local.length + data.length;
  }
  const centralSize=centrals.reduce((n,b)=>n+b.length,0); const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0); end.writeUInt16LE(0,4); end.writeUInt16LE(0,6); end.writeUInt16LE(files.length,8); end.writeUInt16LE(files.length,10); end.writeUInt32LE(centralSize,12); end.writeUInt32LE(offset,16); end.writeUInt16LE(0,20);
  return Buffer.concat([...locals,...centrals,end]);
}

const zip = makeZip([
  {name:'promote4me-woocommerce/promote4me-woocommerce.php', data: pluginPhp},
  {name:'promote4me-woocommerce/README.html', data:`<!doctype html><h1>Promote4.me WooCommerce Plugin</h1><ol><li>Upload this ZIP in WordPress Plugins &gt; Add New &gt; Upload Plugin.</li><li>Activate Promote4.me WooCommerce Proof of Work.</li><li>Open Settings &gt; Promote4.me.</li><li>Paste your Promote4.me API URL and External API Key.</li><li>Click Send Promote4.me Test Order.</li></ol>`}
]);
fs.writeFileSync('public/downloads/promote4me-woocommerce.zip', zip);

fs.writeFileSync('public/downloads/promote4me-shopify-addon.html', `<!doctype html><meta charset="utf-8"><title>Promote4.me Shopify Beta Add-on</title><style>body{font-family:Arial;padding:30px;max-width:760px;margin:auto}input,button{width:100%;padding:12px;margin:8px 0}button{background:#111827;color:white;border:0;border-radius:10px}</style><h1>Promote4.me Shopify Beta Add-on</h1><p>Test Shopify-style order ingestion.</p><input id="url" value="https://promote4.me"><input id="key" placeholder="Promote4.me External API Key"><input id="order" value="SHOPIFY-TEST-001"><input id="name" value="Shopify Test Customer"><input id="address" value="302 E 4th St, Joplin, MO"><button onclick="send()">Send Shopify Test Order</button><pre id="out"></pre><script>async function send(){const base=url.value.replace(/\\/$/,'');const body={source:'Shopify',type:'Package Delivery',title:'Shopify Test Local Delivery',order_number:order.value,customer_name:name.value,address:address.value,status:'Assigned',instructions:'Imported from Shopify beta add-on. Upload delivery proof.'};const r=await fetch(base+'/api/external/orders',{method:'POST',headers:{'Content-Type':'application/json','X-P4ME-Key':key.value},body:JSON.stringify(body)});out.textContent=await r.text();}</script>`);
fs.writeFileSync('public/downloads/README-addons.txt','Promote4.me add-ons\n\nWooCommerce: download promote4me-woocommerce.zip and upload it in WordPress Plugins > Add New > Upload Plugin.\nShopify Beta: use the Shopify app starter/download page and API key.\n');

let app=fs.readFileSync('src/ProductApp.jsx','utf8');
if(!app.includes('function WorkforcePanel')){
 app=app.replace('["team", "Team", Users],','["workforce", "Workforce", Users],\n    ["team", "Team", Users],');
 app=app.replace('["training", "Training", ShieldCheck],','["marketplace", "Find Work", Map],\n    ["training", "Training", ShieldCheck],');
 app=app.replace('{active === "team" && <Team {...props} />}','{active === "workforce" && <WorkforcePanel boot={boot} />}\n        {active === "team" && <Team {...props} />}');
 app=app.replace('{active === "training" && <TrainingPanel user={session.user} />}','{active === "marketplace" && <MarketplacePanel />}\n        {active === "training" && <TrainingPanel user={session.user} />}');
 app=app.replace('function Team({ boot, reload, setNotice }) {', `function WorkforcePanel({ boot }) { const workers=(boot.teamMembers||[]).filter(w=>w.status!=="deleted"); return <div className="content-grid"><section className="panel wide"><h3>Employees + Independent Contractors</h3><p className="hint">Employees can be on Teams. Independent Contractors can be company-approved without a private team and receive API-powered jobs when enabled by admins.</p><div className="card-grid">{workers.map(w=><article className="person-card" key={w.id}><div className="avatar">{w.full_name?.[0]}</div><div><strong>{w.full_name}</strong><p>{w.worker_type||"employee"} · {w.role}</p><small>{w.email} · Company API access: {w.api_access===0?"off":"on"}</small><p>{w.skills_json||w.notes}</p></div></article>)}</div></section><section className="panel"><h3>1099 Contractor System</h3><p>Use Team for employees/private teams. Use Workforce for independent contractors, plumbers, technicians, delivery drivers, and public marketplace workers.</p></section></div>; }
function Team({ boot, reload, setNotice }) {`);
}
if(!app.includes('function MarketplacePanel')){
 app=app.replace('function AddOns({ boot, plans, setNotice }) {', `function MarketplacePanel() { const [jobs,setJobs]=useState([]); useEffect(()=>{fetch('/api/public/work-listings').then(r=>r.json()).then(d=>setJobs(d.jobs||[])).catch(()=>{})},[]); return <div className="content-grid"><section className="panel wide"><h3>Public Work Listings</h3><p className="hint">Angi / Field Nation style work board focused on proof-of-work for technicians, plumbers, delivery drivers, flyer teams, and contractors.</p><div className="card-grid">{jobs.length?jobs.map(j=><article className="client-card" key={j.id}><strong>{j.title}</strong><p>{j.trade||j.type} · {j.address}</p><small>{j.worker_classification} · Budget {Number(j.budget_cents||0)/100}</small><button className="primary">Apply</button></article>):<article className="client-card"><strong>No public listings yet</strong><p>Create a job and mark it public to test the marketplace.</p></article>}</div></section></div>; }
function AddOns({ boot, plans, setNotice }) {`);
}
if(!app.includes('promote4me-woocommerce.zip')){
 app=app.replace('<h3>Installable add-ons & delivery networks</h3>','<h3>Installable add-ons & delivery networks</h3><div className="download-grid"><a className="download-card" href="/downloads/promote4me-woocommerce.zip" download><strong>Download WordPress/WooCommerce Plugin ZIP</strong><span>promote4me-woocommerce.zip</span></a><a className="download-card" href="/downloads/promote4me-shopify-addon.html" download><strong>Download Shopify Beta Add-on</strong><span>promote4me-shopify-addon.html</span></a><a className="download-card" href="/downloads/README-addons.html"><strong>Interactive Setup Guide</strong><span>README-addons.html</span></a></div>');
}
app=app.replaceAll('/downloads/promote4me-woocommerce.php','/downloads/promote4me-woocommerce.zip');
app=app.replaceAll('promote4me-woocommerce.php','promote4me-woocommerce.zip');
app=app.replaceAll('Download WordPress/WooCommerce Plugin</strong>','Download WordPress/WooCommerce Plugin ZIP</strong>');
fs.writeFileSync('src/ProductApp.jsx',app);
let css=fs.readFileSync('src/styles.css','utf8');
if(!css.includes('P4ME 2.5 VISIBLE ADDONS')) css+='\n/* P4ME 2.5 VISIBLE ADDONS */\n.download-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:16px 0}.download-card{display:grid;gap:6px;text-decoration:none;border:1px solid rgba(125,211,252,.22);background:rgba(14,165,233,.10);border-radius:18px;padding:16px;color:#fff}.download-card span{color:#7dd3fc}.download-card:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.55)}\n';
fs.writeFileSync('src/styles.css',css);
console.log('Applied visible add-ons UI and generated installable WordPress ZIP.');
