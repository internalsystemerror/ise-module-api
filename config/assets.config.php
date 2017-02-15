<?php
return [
    'resolver_configs' => [
        'collections' => [
            'css/master.css' => [
                'css/api-global.css',
            ],
            'js/master.js'   => [
                'js/api-ajaxify.js',
                'js/api-global.js',
            ],
        ],
        'paths'       => [
            __DIR__ . '/../assets',
        ],
        'map'         => [
            /* CSS */
            'css/api-global.css' => __DIR__ . '/../assets/css/api-global.css',
            /* JS */
            'js/api-ajaxify.js'  => __DIR__ . '/../assets/js/api-ajaxify.js',
            'js/api-global.js'   => __DIR__ . '/../assets/js/api-global.js',
        ],
    ],
];
