<?php
/**
 * Plugin Name: Hidden Deals
 * Description: A WordPress plugin to display a React-based Hidden Deals dashboard.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL-2.0
 */

if (!defined('ABSPATH')) {
    exit; // No direct access
}

define('HIDDEN_DEALS_PATH', plugin_dir_path(__FILE__));
define('HIDDEN_DEALS_URL', plugins_url('/', __FILE__));

/**
 * Add admin menu page for Hidden Deals
 */
function hidden_deals_admin_menu()
{
    $page_hook_suffix = add_menu_page(
        __('Hidden Deals', 'hidden-deals'),
        __('Hidden Deals', 'hidden-deals'),
        'manage_options',
        'hidden-deals',
        'hidden_deals_page_template',
        'dashicons-admin-home',
        20
    );
    add_action("admin_print_scripts-{$page_hook_suffix}", 'hidden_deals_enqueue_scripts');
}
add_action('admin_menu', 'hidden_deals_admin_menu');

/**
 * Enqueue React app scripts and styles
 */
function hidden_deals_enqueue_scripts()
{
    $js_file = HIDDEN_DEALS_PATH . 'build/static/js/main.js';
    $css_file = HIDDEN_DEALS_PATH . 'build/static/css/index.css';

    // Enqueue JavaScript
    if (file_exists($js_file)) {
        wp_enqueue_script(
            'hidden-deals-script',
            HIDDEN_DEALS_URL . 'build/static/js/main.js',
            ['wp-element'],
            filemtime($js_file),
            true
        );

        // Use environment variable for API base URL
        $api_base = getenv('HIDDEN_DEALS_API_BASE') ?: 'https://property-scraper.glitch.me';
        $api_url = $api_base . '/api/listings';

        // Pass API URL and nonce to React app
        wp_localize_script(
            'hidden-deals-script',
            'hiddenDealsConfig',
            [
                'apiUrl' => $api_url,
                'nonce' => wp_create_nonce('wp_rest')
            ]
        );
    } else {
        error_log('Hidden Deals: JavaScript file not found at ' . $js_file);
    }

    // Enqueue CSS
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'hidden-deals-style',
            HIDDEN_DEALS_URL . 'build/static/css/index.css',
            [],
            filemtime($css_file)
        );
    } else {
        error_log('Hidden Deals: CSS file not found at ' . $css_file);
    }
}

/**
 * Render the admin page
 */
function hidden_deals_page_template()
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'hidden-deals'));
    }
    echo '<div class="wrap"><div id="root"></div></div>';
}

/**
 * Register REST API proxy endpoint
 */
function hidden_deals_register_rest_routes()
{
    register_rest_route('hidden-deals/v1', '/listings', [
        'methods' => 'GET',
        'callback' => 'hidden_deals_proxy_listings',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        }
    ]);
}
add_action('rest_api_init', 'hidden_deals_register_rest_routes');

/**
 * Proxy API request to external listings API
 */
function hidden_deals_proxy_listings($request)
{
    $params = $request->get_query_params();
    // Read env var passed from Docker
    // $api_url = getenv('HIDDEN_DEALS_API_BASE') ?: 'https://property-scraper.glitch.me';

    // For production, uncomment the following line and comment the above
    $api_url = 'https://property-scraper.glitch.me/api/listings';
    $url = add_query_arg($params, $api_url);

    $response = wp_remote_get($url, [
        'timeout' => 10,
        'headers' => [
            'Content-Type' => 'application/json'
        ]
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('api_error', 'Failed to fetch listings', ['status' => 500]);
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error('json_error', 'Invalid API response', ['status' => 500]);
    }

    return rest_ensure_response($data);
}