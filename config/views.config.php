<?php
/**
 * @copyright 2018 Internalsystemerror Limited
 */
declare(strict_types=1);

return [
    'template_map' => [
        'partial/messages' => realpath(__DIR__ . '/../view/partial/messages.phtml'),
    ],
    'strategies'   => [
        'ViewJsonStrategy',
    ],
];
