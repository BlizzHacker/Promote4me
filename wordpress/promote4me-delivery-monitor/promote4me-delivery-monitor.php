<?php
/**
 * Plugin Name: Promote4.me WooCommerce Proof & Delivery Monitor
 * Description: WooCommerce integration for Promote4.me jobs, delivery tracking, proof-of-work review, and customer order status embeds.
 * Version: 2.2.0
 * Author: Promote4.me
 */

if (!defined('ABSPATH')) {
    exit;
}

function p4me_option($key, $default = '') {
    return get_option('p4me_' . $key, $default);
}

function p4me_admin_menu() {
    add_options_page('Promote4.me', 'Promote4.me', 'manage_options', 'p4me-settings', 'p4me_settings_page');
}
add_action('admin_menu', 'p4me_admin_menu');

function p4me_settings_page() {
    if (isset($_POST['p4me_save']) && check_admin_referer('p4me_save_settings')) {
        update_option('p4me_host', esc_url_raw($_POST['p4me_host']));
        update_option('p4me_api_key', sanitize_text_field($_POST['p4me_api_key']));
        update_option('p4me_default_job_type', sanitize_text_field($_POST['p4me_default_job_type']));
        echo '<div class="updated"><p>Promote4.me settings saved.</p></div>';
    }
    $host = esc_attr(p4me_option('host', 'https://promote4.me'));
    $api_key = esc_attr(p4me_option('api_key', ''));
    $job_type = esc_attr(p4me_option('default_job_type', 'Package Delivery'));
    echo '<div class="wrap"><h1>Promote4.me WooCommerce</h1><form method="post">';
    wp_nonce_field('p4me_save_settings');
    echo '<table class="form-table">';
    echo '<tr><th>Promote4.me Host</th><td><input class="regular-text" name="p4me_host" value="' . $host . '" /></td></tr>';
    echo '<tr><th>API Key / Bearer Token</th><td><input class="regular-text" name="p4me_api_key" value="' . $api_key . '" /></td></tr>';
    echo '<tr><th>Default Job Type</th><td><select name="p4me_default_job_type"><option ' . selected($job_type, 'Package Delivery', false) . '>Package Delivery</option><option ' . selected($job_type, 'Food Delivery', false) . '>Food Delivery</option><option ' . selected($job_type, 'Technician On-Site', false) . '>Technician On-Site</option><option ' . selected($job_type, 'Team Promo', false) . '>Team Promo</option></select></td></tr>';
    echo '</table><p><button class="button button-primary" name="p4me_save" value="1">Save Settings</button></p></form></div>';
}

function p4me_create_or_update_job_from_order($order_id) {
    if (!function_exists('wc_get_order')) return;
    $order = wc_get_order($order_id);
    if (!$order) return;
    $host = rtrim(p4me_option('host', 'https://promote4.me'), '/');
    $api_key = p4me_option('api_key', '');
    if (!$api_key) return;

    $address = trim($order->get_shipping_address_1() . ' ' . $order->get_shipping_address_2() . ', ' . $order->get_shipping_city() . ', ' . $order->get_shipping_state() . ' ' . $order->get_shipping_postcode());
    if (!$address) {
        $address = trim($order->get_billing_address_1() . ' ' . $order->get_billing_address_2() . ', ' . $order->get_billing_city() . ', ' . $order->get_billing_state() . ' ' . $order->get_billing_postcode());
    }

    $payload = array(
        'id' => 'WC-' . $order->get_id(),
        'order_number' => $order->get_order_number(),
        'type' => p4me_option('default_job_type', 'Package Delivery'),
        'title' => 'WooCommerce Order #' . $order->get_order_number(),
        'source' => 'WooCommerce',
        'customer_name' => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
        'customer_email' => $order->get_billing_email(),
        'customer_phone' => $order->get_billing_phone(),
        'address' => $address,
        'status' => 'Assigned',
        'instructions' => 'WooCommerce order imported. Upload proof of delivery or proof of work before closing.',
    );

    wp_remote_post($host . '/api/jobs', array(
        'headers' => array('Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . $api_key),
        'body' => wp_json_encode($payload),
        'timeout' => 20,
    ));
}
add_action('woocommerce_order_status_processing', 'p4me_create_or_update_job_from_order');
add_action('woocommerce_order_status_completed', 'p4me_create_or_update_job_from_order');

function promote4me_delivery_tracker_shortcode($atts) {
    $atts = shortcode_atts(array(
        'host' => p4me_option('host', 'https://promote4.me'),
        'height' => '760px',
        'tracking' => isset($_GET['tracking']) ? sanitize_text_field($_GET['tracking']) : '',
    ), $atts, 'promote4me_delivery_tracker');
    $src = esc_url(add_query_arg(array('tracking' => $atts['tracking'], 'source' => 'woocommerce', 'site' => home_url()), $atts['host']));
    return '<div class="promote4me-delivery-monitor"><iframe title="Promote4.me Proof and Delivery Tracker" src="' . $src . '" style="width:100%;height:' . esc_attr($atts['height']) . ';border:0;border-radius:18px;overflow:hidden;" loading="lazy"></iframe></div>';
}
add_shortcode('promote4me_delivery_tracker', 'promote4me_delivery_tracker_shortcode');

function p4me_order_tracking_box($order) {
    if (!$order) return;
    $host = esc_url(p4me_option('host', 'https://promote4.me'));
    $tracking = rawurlencode($order->get_order_number());
    echo '<section class="woocommerce-p4me-tracker"><h2>Delivery / Proof Status</h2><p><a class="button" target="_blank" href="' . $host . '?tracking=' . $tracking . '">Track this order with Promote4.me</a></p></section>';
}
add_action('woocommerce_order_details_after_order_table', 'p4me_order_tracking_box');
