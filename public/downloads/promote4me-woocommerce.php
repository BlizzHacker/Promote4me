<?php
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
?>