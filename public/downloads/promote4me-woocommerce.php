<?php
/** Plugin Name: Promote4.me WooCommerce Proof of Work
 * Version: 2.5.0
 * Description: Sends WooCommerce orders to Promote4.me proof-of-work tracking.
 */
if (!defined('ABSPATH')) exit;
add_action('admin_menu', fn()=>add_options_page('Promote4.me','Promote4.me','manage_options','promote4me','p4me_page'));
add_action('admin_init', function(){ register_setting('p4me','p4me_api_url'); register_setting('p4me','p4me_api_key'); });
function p4me_page(){ if(!empty($_POST['p4me_test'])) p4me_send(null,true); ?>
<div class="wrap"><h1>Promote4.me WooCommerce</h1><form method="post" action="options.php"><?php settings_fields('p4me'); ?><p>API URL<br><input name="p4me_api_url" value="<?php echo esc_attr(get_option('p4me_api_url','https://promote4.me')); ?>" class="regular-text"></p><p>External API Key<br><input name="p4me_api_key" value="<?php echo esc_attr(get_option('p4me_api_key','')); ?>" class="regular-text"></p><?php submit_button(); ?></form><form method="post"><input type="hidden" name="p4me_test" value="1"><?php submit_button('Send Test Order'); ?></form></div><?php }
add_action('woocommerce_order_status_processing', fn($id)=>p4me_send($id,false));
function p4me_send($id,$test=false){ $api=rtrim(get_option('p4me_api_url','https://promote4.me'),'/'); $key=get_option('p4me_api_key',''); if(!$key)return; $o=$id&&function_exists('wc_get_order')?wc_get_order($id):null; $payload=['source'=>'WooCommerce','type'=>'Package Delivery','title'=>$test?'WooCommerce Test Order':'WooCommerce Order #'.$id,'order_number'=>$test?'WC-TEST-'.time():'WC-'.$id,'customer_name'=>$o?trim($o->get_billing_first_name().' '.$o->get_billing_last_name()):'WooCommerce Test Customer','customer_email'=>$o?$o->get_billing_email():'test@example.com','customer_phone'=>$o?$o->get_billing_phone():'','address'=>$o?trim($o->get_shipping_address_1().' '.$o->get_shipping_city().' '.$o->get_shipping_state().' '.$o->get_shipping_postcode()):'Test delivery address','status'=>'Assigned','instructions'=>'Imported from WooCommerce. Upload proof before completion.']; wp_remote_post($api.'/api/external/orders',['headers'=>['Content-Type'=>'application/json','X-P4ME-Key'=>$key],'body'=>wp_json_encode($payload),'timeout'=>15]); }
?>