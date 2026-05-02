<?php
/**
 * Plugin Name: Promote4.me Delivery Monitor
 * Description: Embeds the Promote4.me delivery tracking experience with the [promote4me_delivery_tracker] shortcode.
 * Version: 2.0.0
 * Author: Promote4.me
 */

if (!defined('ABSPATH')) {
    exit;
}

function promote4me_delivery_tracker_shortcode($atts) {
    $atts = shortcode_atts(array(
        'host' => 'https://your-domain.com',
        'height' => '720px',
        'tracking' => isset($_GET['tracking']) ? sanitize_text_field($_GET['tracking']) : '',
    ), $atts, 'promote4me_delivery_tracker');

    $src = esc_url(add_query_arg(array(
        'tracking' => $atts['tracking'],
        'source' => 'wordpress',
        'site' => home_url(),
    ), $atts['host']));

    return '<div class="promote4me-delivery-monitor"><iframe title="Promote4.me Delivery Tracker" src="' . $src . '" style="width:100%;height:' . esc_attr($atts['height']) . ';border:0;border-radius:18px;overflow:hidden;" loading="lazy"></iframe></div>';
}
add_shortcode('promote4me_delivery_tracker', 'promote4me_delivery_tracker_shortcode');
