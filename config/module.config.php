<?php
return [
    'view_manager'  => [
        'template_map'        => [
            'partial/messages' => __DIR__ . '/../view/partial/messages.phtml',
        ],
        'template_path_stack' => [
            __DIR__ . '/../view',
        ],
    ],
    'asset_manager' => include __DIR__ . '/assets.config.php',
];
