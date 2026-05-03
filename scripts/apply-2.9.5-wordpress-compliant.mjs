import fs from 'fs';
import path from 'path';

const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
const write = (p, c) => { mkdir(path.dirname(p)); fs.writeFileSync(p, c); };

console.log('Applying Promote4.me 2.9.5 WordPress.org-compliant Proof Manager package...');

const pluginPhp = `<?php
/**
 * Plugin Name: Promote4.me Proof Manager
 * Plugin URI: https://promote4.me
 * Description: Creates proof-ready work packets from supported store orders with item checklists, customer details, staffer instructions, GPS/photo evidence, and approval tracking.
 * Version: 2.9.5
 * Author: Promote4.me
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) exit;

class P4ME_Proof_Manager {
  const OPT = 'p4me_settings';
  const LOG = 'p4me_logs';
  const NONCE = 'p4me_admin_action';

  public static function init() {
    add_action('admin_menu', [__CLASS__, 'menu']);
    add_action('admin_init', [__CLASS__, 'register_settings']);
    add_action('wp_dashboard_setup', [__CLASS__, 'dashboard_widget']);
    add_action('add_meta_boxes', [__CLASS__, 'order_metabox']);
    add_action('admin_post_p4me_test_order', [__CLASS__, 'handle_test_order']);
    add_action('admin_post_p4me_sync_order', [__CLASS__, 'handle_sync_order']);
    add_action('admin_post_p4me_clear_logs', [__CLASS__, 'handle_clear_logs']);
    add_action('admin_enqueue_scripts', [__CLASS__, 'assets']);
    add_filter('plugin_action_links_' . plugin_basename(__FILE__), [__CLASS__, 'plugin_links']);
    foreach (['processing','completed','on-hold'] as $status) {
      add_action('woocommerce_order_status_' . $status, function($order_id) use ($status) {
        $s = self::settings();
        $statuses = isset($s['statuses']) && is_array($s['statuses']) ? $s['statuses'] : ['processing'];
        if (in_array($status, $statuses, true)) self::sync_order($order_id, false);
      });
    }
  }

  public static function defaults() { return ['api_url'=>'https://promote4.me','api_key'=>'','statuses'=>['processing'],'public_jobs'=>'0','default_work_mode'=>'in_person','default_trade'=>'Delivery','reward_cents'=>'0','send_customer_note'=>'1','send_admin_url'=>'1','debug'=>'0']; }
  public static function settings() { $saved = get_option(self::OPT, []); return wp_parse_args(is_array($saved) ? $saved : [], self::defaults()); }
  public static function can_manage() { return current_user_can('manage_options') || current_user_can('manage_woocommerce'); }
  public static function assets($hook) { if (strpos($hook, 'p4me') === false && $hook !== 'index.php' && $hook !== 'post.php') return; wp_enqueue_style('p4me-admin', plugins_url('assets/admin.css', __FILE__), [], '2.9.5'); }
  public static function plugin_links($links) { array_unshift($links, '<a href="' . esc_url(admin_url('admin.php?page=p4me-dashboard')) . '">Dashboard</a>'); array_unshift($links, '<a href="' . esc_url(admin_url('admin.php?page=p4me-settings')) . '">Settings</a>'); return $links; }
  public static function menu() { add_menu_page('Promote4.me', 'Promote4.me', 'manage_options', 'p4me-dashboard', [__CLASS__, 'dashboard_page'], 'dashicons-location-alt', 56); add_submenu_page('p4me-dashboard', 'Dashboard', 'Dashboard', 'manage_options', 'p4me-dashboard', [__CLASS__, 'dashboard_page']); add_submenu_page('p4me-dashboard', 'Settings', 'Settings', 'manage_options', 'p4me-settings', [__CLASS__, 'settings_page']); add_submenu_page('p4me-dashboard', 'Logs', 'Logs', 'manage_options', 'p4me-logs', [__CLASS__, 'logs_page']); }
  public static function register_settings() { register_setting('p4me_group', self::OPT, [__CLASS__, 'sanitize_settings']); }
  public static function sanitize_settings($input) { $out = self::settings(); $out['api_url'] = esc_url_raw($input['api_url'] ?? 'https://promote4.me'); $out['api_key'] = sanitize_text_field($input['api_key'] ?? ''); $out['statuses'] = array_values(array_intersect((array)($input['statuses'] ?? []), ['processing','completed','on-hold'])); if (!$out['statuses']) $out['statuses'] = ['processing']; $out['public_jobs'] = !empty($input['public_jobs']) ? '1' : '0'; $out['default_work_mode'] = in_array(($input['default_work_mode'] ?? 'in_person'), ['in_person','online'], true) ? $input['default_work_mode'] : 'in_person'; $out['default_trade'] = sanitize_text_field($input['default_trade'] ?? 'Delivery'); $out['reward_cents'] = (string) max(0, intval($input['reward_cents'] ?? 0)); $out['send_customer_note'] = !empty($input['send_customer_note']) ? '1' : '0'; $out['send_admin_url'] = !empty($input['send_admin_url']) ? '1' : '0'; $out['debug'] = !empty($input['debug']) ? '1' : '0'; return $out; }
  public static function dashboard_widget() { if (self::can_manage()) wp_add_dashboard_widget('p4me_dashboard_widget', 'Promote4.me Proof Manager', [__CLASS__, 'dashboard_widget_html']); }
  public static function dashboard_widget_html() { $stats = self::stats(); echo '<div class="p4me-mini"><strong>' . esc_html($stats['synced']) . '</strong><span>Synced packets</span></div><div class="p4me-mini"><strong>' . esc_html($stats['errors']) . '</strong><span>Errors</span></div><p><a class="button button-primary" href="' . esc_url(admin_url('admin.php?page=p4me-dashboard')) . '">Open Promote4.me Dashboard</a></p>'; }
  public static function stats() { return ['synced'=>intval(get_option('p4me_synced_count', 0)), 'errors'=>intval(get_option('p4me_error_count', 0)), 'last'=>get_option('p4me_last_sync', 'Never'), 'logs'=>array_slice(array_reverse((array)get_option(self::LOG, [])), 0, 8)]; }
  public static function dashboard_page() { if (!self::can_manage()) wp_die('Permission denied'); $s = self::settings(); $stats = self::stats(); echo '<div class="wrap p4me-wrap"><div class="p4me-hero"><div><h1>Promote4.me Proof Manager</h1><p>Turn store activity into proof-ready work packets with checklists, GPS/photo evidence, and approval tracking.</p></div><a class="button button-primary button-hero" target="_blank" href="' . esc_url($s['api_url']) . '">Open Promote4.me</a></div><div class="p4me-grid"><div class="p4me-card"><span>Synced Packets</span><strong>' . esc_html($stats['synced']) . '</strong></div><div class="p4me-card"><span>Errors</span><strong>' . esc_html($stats['errors']) . '</strong></div><div class="p4me-card"><span>Last Sync</span><strong>' . esc_html($stats['last']) . '</strong></div><div class="p4me-card"><span>API</span><strong>' . (!empty($s['api_key']) ? 'Configured' : 'Missing Key') . '</strong></div></div><div class="p4me-panel"><h2>Hot Keys</h2><div class="p4me-actions"><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">' . wp_nonce_field(self::NONCE, '_wpnonce', true, false) . '<input type="hidden" name="action" value="p4me_test_order"><button class="button button-primary">Send Test Work Packet</button></form><a class="button" href="' . esc_url(admin_url('edit.php?post_type=shop_order')) . '">View Store Orders</a><a class="button" href="' . esc_url(admin_url('admin.php?page=p4me-settings')) . '">Configure API</a><a class="button" href="' . esc_url($s['api_url'] . '/?v=wordpress') . '" target="_blank">Promote4.me App</a></div></div><div class="p4me-panel"><h2>Recent Activity</h2>'; self::logs_table(false); echo '</div></div>'; }
  public static function settings_page() { if (!self::can_manage()) wp_die('Permission denied'); $s = self::settings(); echo '<div class="wrap p4me-wrap"><h1>Promote4.me Settings</h1><form method="post" action="options.php">'; settings_fields('p4me_group'); echo '<div class="p4me-panel"><h2>Connection</h2><table class="form-table"><tr><th>Promote4.me API URL</th><td><input class="regular-text" name="' . self::OPT . '[api_url]" value="' . esc_attr($s['api_url']) . '"></td></tr><tr><th>External API Key</th><td><input type="password" class="regular-text" name="' . self::OPT . '[api_key]" value="' . esc_attr($s['api_key']) . '" autocomplete="off"><p class="description">Create this in Promote4.me → Integrations → API Credential Center.</p></td></tr></table></div><div class="p4me-panel"><h2>Automation</h2><table class="form-table"><tr><th>Send packet when status becomes</th><td>'; foreach(['processing'=>'Processing','completed'=>'Completed','on-hold'=>'On hold'] as $k=>$label) echo '<label><input type="checkbox" name="' . self::OPT . '[statuses][]" value="' . esc_attr($k) . '" ' . checked(in_array($k, $s['statuses'], true), true, false) . '> ' . esc_html($label) . '</label><br>'; echo '</td></tr><tr><th>Default work mode</th><td><select name="' . self::OPT . '[default_work_mode]"><option value="in_person" ' . selected($s['default_work_mode'], 'in_person', false) . '>In person / delivery / field service</option><option value="online" ' . selected($s['default_work_mode'], 'online', false) . '>Online deliverable</option></select></td></tr><tr><th>Trade/category</th><td><input name="' . self::OPT . '[default_trade]" value="' . esc_attr($s['default_trade']) . '"></td></tr><tr><th>Reward cents</th><td><input type="number" name="' . self::OPT . '[reward_cents]" value="' . esc_attr($s['reward_cents']) . '"></td></tr><tr><th>Public work map</th><td><label><input type="checkbox" name="' . self::OPT . '[public_jobs]" value="1" ' . checked($s['public_jobs'], '1', false) . '> Allow imported packets to appear publicly</label></td></tr><tr><th>Include customer note</th><td><label><input type="checkbox" name="' . self::OPT . '[send_customer_note]" value="1" ' . checked($s['send_customer_note'], '1', false) . '> Yes</label></td></tr><tr><th>Include source admin URL</th><td><label><input type="checkbox" name="' . self::OPT . '[send_admin_url]" value="1" ' . checked($s['send_admin_url'], '1', false) . '> Yes</label></td></tr><tr><th>Debug logging</th><td><label><input type="checkbox" name="' . self::OPT . '[debug]" value="1" ' . checked($s['debug'], '1', false) . '> Enable verbose logs</label></td></tr></table></div>'; submit_button('Save Promote4.me Settings'); echo '</form></div>'; }
  public static function logs_page() { if (!self::can_manage()) wp_die('Permission denied'); echo '<div class="wrap p4me-wrap"><h1>Promote4.me Logs</h1><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">' . wp_nonce_field(self::NONCE, '_wpnonce', true, false) . '<input type="hidden" name="action" value="p4me_clear_logs"><button class="button">Clear logs</button></form><div class="p4me-panel">'; self::logs_table(true); echo '</div></div>'; }
  public static function logs_table($all=true) { $logs = array_reverse((array)get_option(self::LOG, [])); if (!$all) $logs = array_slice($logs, 0, 8); if (!$logs) { echo '<p>No Promote4.me activity yet.</p>'; return; } echo '<table class="widefat striped"><thead><tr><th>Time</th><th>Level</th><th>Message</th></tr></thead><tbody>'; foreach($logs as $log) echo '<tr><td>' . esc_html($log['time']) . '</td><td>' . esc_html($log['level']) . '</td><td>' . esc_html($log['message']) . '</td></tr>'; echo '</tbody></table>'; }
  public static function order_metabox() { if (post_type_exists('shop_order')) add_meta_box('p4me_order_box', 'Promote4.me Work Packet', [__CLASS__, 'order_box_html'], 'shop_order', 'side', 'high'); }
  public static function order_box_html($post) { if (!self::can_manage()) return; $last = get_post_meta($post->ID, '_p4me_last_sync', true); echo '<p>Last sync: <strong>' . esc_html($last ?: 'Never') . '</strong></p><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">' . wp_nonce_field(self::NONCE, '_wpnonce', true, false) . '<input type="hidden" name="action" value="p4me_sync_order"><input type="hidden" name="order_id" value="' . esc_attr($post->ID) . '"><button class="button button-primary">Sync to Promote4.me</button></form>'; }
  public static function handle_test_order() { self::guard(); self::sync_order(null, true); wp_safe_redirect(admin_url('admin.php?page=p4me-dashboard')); exit; }
  public static function handle_sync_order() { self::guard(); self::sync_order(absint($_POST['order_id'] ?? 0), false); wp_safe_redirect(wp_get_referer() ?: admin_url('admin.php?page=p4me-dashboard')); exit; }
  public static function handle_clear_logs() { self::guard(); update_option(self::LOG, []); wp_safe_redirect(admin_url('admin.php?page=p4me-logs')); exit; }
  public static function guard() { if (!self::can_manage()) wp_die('Permission denied'); check_admin_referer(self::NONCE); }
  public static function log($level, $message) { $logs = (array)get_option(self::LOG, []); $logs[] = ['time'=>current_time('mysql'), 'level'=>$level, 'message'=>$message]; update_option(self::LOG, array_slice($logs, -100), false); if ($level === 'error') update_option('p4me_error_count', intval(get_option('p4me_error_count', 0)) + 1, false); }
  public static function money_cents($amount) { return (int) round(((float)$amount) * 100); }
  public static function build_payload($order_id, $test=false) { $s = self::settings(); $order = $order_id && function_exists('wc_get_order') ? wc_get_order($order_id) : null; $ship = $order ? $order->get_address('shipping') : []; $bill = $order ? $order->get_address('billing') : []; $items = []; if ($order) foreach($order->get_items() as $item) { $p = $item->get_product(); $items[] = ['name'=>$item->get_name(),'quantity'=>$item->get_quantity(),'sku'=>$p ? $p->get_sku() : '','product_id'=>$p ? $p->get_id() : '','subtotal_cents'=>self::money_cents($item->get_subtotal()),'total_cents'=>self::money_cents($item->get_total())]; } if (!$items) $items[] = ['name'=>'Demo product/service','quantity'=>1,'sku'=>'P4ME-DEMO','total_cents'=>1200]; $address = $order ? implode(', ', array_filter([$ship['address_1'] ?? $bill['address_1'] ?? '', $ship['address_2'] ?? '', $ship['city'] ?? $bill['city'] ?? '', $ship['state'] ?? $bill['state'] ?? '', $ship['postcode'] ?? $bill['postcode'] ?? ''])) : '302 E 4th St, Joplin, MO'; return ['source'=>'WordPress','type'=>'Package Delivery','title'=>$test ? 'WordPress Test Work Packet' : 'Store Order #' . $order_id,'order_number'=>$test ? 'WP-TEST-' . time() : 'WP-' . $order_id,'customer_name'=>$order ? trim(($bill['first_name'] ?? '') . ' ' . ($bill['last_name'] ?? '')) : 'WordPress Test Customer','customer_email'=>$order ? $order->get_billing_email() : 'test@example.com','customer_phone'=>$order ? $order->get_billing_phone() : '','address'=>$address,'status'=>'Assigned','payment_method'=>$order ? $order->get_payment_method_title() : 'Demo payment','order_total_cents'=>$order ? self::money_cents($order->get_total()) : 1200,'admin_url'=>$order && $s['send_admin_url'] === '1' ? admin_url('post.php?post=' . $order_id . '&action=edit') : '','customer_note'=>$order && $s['send_customer_note'] === '1' ? $order->get_customer_note() : '','line_items'=>$items,'proof_checklist'=>[['id'=>'arrive','label'=>'Confirm arrival at customer/site location','required'=>true],['id'=>'items','label'=>'Confirm all ordered items/services are accounted for','required'=>true],['id'=>'photo','label'=>'Upload completion photo with GPS','required'=>true],['id'=>'notes','label'=>'Add completion notes for client/admin','required'=>false]],'instructions'=>'Review customer info, verify line items, complete service/delivery, upload GPS/photo proof, and submit for approval.','visibility'=>$s['public_jobs'] === '1' ? 'public' : 'private','is_public'=>$s['public_jobs'] === '1','work_mode'=>$s['default_work_mode'],'trade'=>$s['default_trade'],'reward_cents'=>intval($s['reward_cents']),'worker_classification'=>'employee_or_contractor']; }
  public static function sync_order($order_id, $test=false) { $s = self::settings(); if (empty($s['api_key'])) { self::log('error', 'Missing External API Key.'); return false; } $payload = self::build_payload($order_id, $test); $response = wp_remote_post(rtrim($s['api_url'], '/') . '/api/external/orders', ['headers'=>['Content-Type'=>'application/json', 'X-P4ME-Key'=>$s['api_key']], 'body'=>wp_json_encode($payload), 'timeout'=>25]); if (is_wp_error($response)) { self::log('error', 'Sync failed: ' . $response->get_error_message()); return false; } $code = wp_remote_retrieve_response_code($response); $body = wp_remote_retrieve_body($response); if ($code < 200 || $code >= 300) { self::log('error', 'Sync failed HTTP ' . $code . ': ' . $body); return false; } update_option('p4me_synced_count', intval(get_option('p4me_synced_count', 0)) + 1, false); update_option('p4me_last_sync', current_time('mysql'), false); if ($order_id && function_exists('wc_get_order')) { update_post_meta($order_id, '_p4me_last_sync', current_time('mysql')); $order = wc_get_order($order_id); if ($order) $order->add_order_note('Synced to Promote4.me proof manager.'); } self::log('success', 'Synced ' . ($test ? 'test packet' : 'order ' . $order_id) . ' to Promote4.me.'); return true; }
}
P4ME_Proof_Manager::init();
?>`;

const readme = `=== Promote4.me Proof Manager ===
Contributors: promote4me
Tags: proof, delivery, field service, orders, gps
Requires at least: 6.0
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 2.9.5
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create proof-ready work packets from supported store orders with staffer checklists, GPS/photo evidence, and approval tracking.

== Description ==
Promote4.me Proof Manager connects WordPress store activity to Promote4.me work packets. It helps teams dispatch delivery, field service, and proof-of-work tasks from store orders.

== Installation ==
1. Upload the plugin ZIP in Plugins > Add New > Upload Plugin.
2. Activate Promote4.me Proof Manager.
3. Go to Promote4.me > Settings.
4. Paste your Promote4.me External API Key.
5. Open Promote4.me > Dashboard and send a test work packet.

== Changelog ==
= 2.9.5 =
* Renamed for WordPress.org trademark compliance.
* Added dashboard, logs, hot keys, test packet, settings, proof checklist payloads, and order sync support.
`;
const css = `.p4me-wrap{max-width:1200px}.p4me-hero{display:flex;align-items:center;justify-content:space-between;gap:20px;background:linear-gradient(135deg,#07111f,#0f766e);color:#fff;border-radius:18px;padding:24px;margin:18px 0}.p4me-hero h1{color:#fff;margin:0}.button-hero{font-size:16px!important;padding:8px 16px!important}.p4me-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}.p4me-card,.p4me-panel{background:#fff;border:1px solid #dcdcde;border-radius:14px;padding:18px;margin:14px 0;box-shadow:0 8px 24px rgba(0,0,0,.05)}.p4me-card span{display:block;color:#64748b}.p4me-card strong{font-size:28px}.p4me-actions{display:flex;flex-wrap:wrap;gap:10px}.p4me-mini{display:inline-grid;margin:0 16px 10px 0}.p4me-mini strong{font-size:24px;color:#0f766e}.p4me-mini span{color:#64748b}`;

function crc32(buf){let t=crc32.t;if(!t){t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);t[n]=c>>>0}crc32.t=t}let c=0^(-1);for(const b of buf)c=(c>>>8)^t[(c^b)&255];return(c^(-1))>>>0}
function zip(files){let locals=[],centrals=[],offset=0;for(const f of files){const name=Buffer.from(f.name),data=Buffer.from(f.data),crc=crc32(data),local=Buffer.alloc(30+name.length);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0,6);local.writeUInt16LE(0,8);local.writeUInt32LE(crc,14);local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);name.copy(local,30);locals.push(local,data);const cen=Buffer.alloc(46+name.length);cen.writeUInt32LE(0x02014b50,0);cen.writeUInt16LE(20,4);cen.writeUInt16LE(20,6);cen.writeUInt32LE(crc,16);cen.writeUInt32LE(data.length,20);cen.writeUInt32LE(data.length,24);cen.writeUInt16LE(name.length,28);cen.writeUInt32LE(offset,42);name.copy(cen,46);centrals.push(cen);offset+=local.length+data.length}const size=centrals.reduce((n,b)=>n+b.length,0),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(size,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,...centrals,end])}
const files = [{ name:'promote4me-proof-manager/promote4me-proof-manager.php', data:pluginPhp },{ name:'promote4me-proof-manager/readme.txt', data:readme },{ name:'promote4me-proof-manager/assets/admin.css', data:css }];
write('public/downloads/promote4me-proof-manager.zip', zip(files));
write('public/downloads/promote4me-woocommerce.zip', zip(files));
let pkg = JSON.parse(fs.readFileSync('package.json','utf8')); pkg.version = '2.9.5'; if (!pkg.scripts.prebuild.includes('apply-2.9.5-wordpress-compliant.mjs')) pkg.scripts.prebuild += ' && node scripts/apply-2.9.5-wordpress-compliant.mjs'; fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');
let server = fs.readFileSync('server/index.js','utf8'); server = server.replace(/version: '[^']+'/g, "version: '2.9.5'"); fs.writeFileSync('server/index.js', server);
let app = fs.readFileSync('src/ProductApp.jsx','utf8'); app = app.replaceAll('WordPress / WooCommerce Pro','WordPress Proof Manager').replaceAll('promote4me-woocommerce.zip','promote4me-proof-manager.zip').replaceAll('WooCommerce Store','WordPress Store').replaceAll('WooCommerce','WordPress'); fs.writeFileSync('src/ProductApp.jsx', app);
console.log('Promote4.me Proof Manager 2.9.5 generated.');
