<?php
return [
    'resolver_configs' => [
        'collections' => [
            'css/master.css' => [
                'css/api-global.css',
            ],
            'js/master.js'   => [
                'js/api-alert.js',
                'js/api-notification.js',
                'js/api-ajaxify.js',
                'js/api-global.js',
            ],
        ],
        'paths'       => [
            __DIR__ . '/../assets',
        ],
        'map'         => [
            /* CSS */
            'css/api-global.css'     => realpath(__DIR__ . '/../assets/css/api-global.css'),
            /* JS */
            'js/api-alert.js'        => realpath(__DIR__ . '/../assets/js/api-alert.js'),
            'js/api-notification.js' => realpath(__DIR__ . '/../assets/js/api-notification.js'),
            'js/api-ajaxify.js'      => realpath(__DIR__ . '/../assets/js/api-ajaxify.js'),
            'js/api-global.js'       => realpath(__DIR__ . '/../assets/js/api-global.js'),
        ],
    ],
];
