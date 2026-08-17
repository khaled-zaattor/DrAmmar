<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://localhost:3000',
        'http://localhost:8080',
        'https://alisbarbershop.com',
        'https://www.alisbarbershop.com',
        'https://manage.alisbarbershop.com',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Was 0, which meant the browser re-ran a preflight before *every* request.
    // Chrome caps this at 7200s and Firefox at 86400s — either beats zero.
    'max_age' => 86400,

    // Both frontends authenticate with a Sanctum bearer token from
    // localStorage; neither sends cookies (no credentials:'include',
    // no withCredentials, no /sanctum/csrf-cookie call). Leaving this on only
    // added the stricter credentialed-CORS rules for no benefit.
    'supports_credentials' => false,

];
